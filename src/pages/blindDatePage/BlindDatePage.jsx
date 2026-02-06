import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";
import BlindQueue from "../../components/blindDateComponents/blindQueue/BlindQueue";
import BlindProgressBar from "../../components/blindDateComponents/blindProgressBar/BlindProgressBar";
import BlindGameCard from "../../components/blindDateComponents/blindGameCard/BlindGameCard";
import BlindChatSection from "../../components/blindDateComponents/blindChatSection/BlindChatSection";
import BlindInterestsModal from "../../components/blindDateComponents/blindInterestsModal/BlindInterestsModal";
import BlindRevealZone from "../../components/blindDateComponents/blindRevealZone/BlindRevealZone";
import BlindFinalReveal from "../../components/blindDateComponents/blindFinalReveal/BlindFinalReveal";
import BlindInstructions from "../../components/blindDateComponents/blindInstructions/BlindInstructions";
import BlindRejected from "../../components/blindDateComponents/blindRejected/BlindRejected.jsx";
import SubscriptionModal from "../../components/modals/subscriptionModal/SubscriptionModal";
import loveIsBlindImg from "../../assets/loveisblind.png";
import "../../styles/design-tokens.css";
import "./BlindDatePage.css";
import { useAuth } from "../../context/useAuth.js";
import { useBlindDateStore } from "../../store/blindDateStore";
import { useBlindDateSessionStore } from "../../store/blindDateSessionStore";

const STATUS_REQUEST_TIMEOUT_MS = 10000;

const BlindDatePage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [session, setSession] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef(null);
  const sessionSettersRef = useRef({ setSession, setIsSearching });

  useEffect(() => {
    sessionSettersRef.current = { setSession, setIsSearching };
  }, []);

  const accessStatus = useBlindDateStore((s) => s.accessStatus);
  const statusLoading = useBlindDateStore((s) => s.statusLoading);
  const fetchStatus = useBlindDateStore((s) => s.fetchStatus);
  const isCacheValid = useBlindDateStore((s) => s.isCacheValid);
  const setStatusLoading = useBlindDateStore((s) => s.setStatusLoading);

  const [showSubModal, setShowSubModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const userId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (!userId) {
      setStatusLoading(false);
      return;
    }

    const valid = isCacheValid(userId);

    if (valid) {
      setStatusLoading(false);
      const ac = new AbortController();
      fetchStatus(API_URL, userId, true, ac.signal);
      return () => ac.abort();
    }

    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), STATUS_REQUEST_TIMEOUT_MS);
    fetchStatus(API_URL, userId, false, ac.signal);
    return () => {
      clearTimeout(timeoutId);
      ac.abort();
    };
  }, [userId, API_URL, isCacheValid, fetchStatus, setStatusLoading]);

  // --- 2. Timer Logic (Countdown) ---
  useEffect(() => {
    if (
      accessStatus?.reason === "cooldown" &&
      accessStatus?.nextAvailableTime
    ) {
      const interval = setInterval(() => {
        const now = new Date();
        const end = new Date(accessStatus.nextAvailableTime);
        const diff = end - now;

        if (diff <= 0) {
          clearInterval(interval);
          if (userId) fetchStatus(API_URL, userId, false);
          setTimeLeft("");
        } else {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${h}h ${m}m ${s}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [accessStatus, API_URL, userId, fetchStatus]);

  useEffect(() => {
    if (!API_URL) return;
    const socket = io(API_URL, { withCredentials: true });
    socketRef.current = socket;

    const onConnect = () => {
      setSocketReady(true);
      const uid = currentUser?._id ?? currentUser?.id;
      if (uid)
        socket.emit("join_room", typeof uid === "string" ? uid : String(uid));
    };
    const onMatchFound = async (newSession) => {
      const { setSession: setS, setIsSearching: setSearching } =
        sessionSettersRef.current;
      if (import.meta.env.DEV)
        console.log(
          "[Blind Date] match_found received",
          newSession?.id ?? newSession?._id
        );
      setSearching(false);
      if (newSession && (newSession._id || newSession.id)) {
        setS(newSession);
        try {
          await fetch(`${API_URL}/api/blind-date/record-usage`, {
            method: "POST",
            credentials: "include",
          });
        } catch { /* ignore */ }
      }
    };
    const onSessionUpdate = (updatedSession) => setSession(updatedSession);
    const onSessionCancelled = () =>
      setSession((prev) => (prev ? { ...prev, status: "cancelled" } : null));
    const onError = (err) => {
      if (import.meta.env.DEV) console.warn("[Blind Date] socket error", err);
    };
    const onQueueStatus = (data) => {
      if (import.meta.env.DEV) console.log("[Blind Date] queue_status", data);
    };

    socket.on("connect", onConnect);
    socket.on("match_found", onMatchFound);
    socket.on("session_update", onSessionUpdate);
    socket.on("session_cancelled", onSessionCancelled);
    socket.on("error", onError);
    socket.on("queue_status", onQueueStatus);

    return () => {
      socket.off("connect", onConnect);
      socket.off("match_found", onMatchFound);
      socket.off("session_update", onSessionUpdate);
      socket.off("session_cancelled", onSessionCancelled);
      socket.off("error", onError);
      socket.off("queue_status", onQueueStatus);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser?._id, currentUser?.id, API_URL]);

  const getCachedSession = useBlindDateSessionStore((s) => s.getCached);
  const fetchActiveSession = useBlindDateSessionStore((s) => s.fetchActiveSession);

  // Polling fallback: if socket match_found is missed (e.g. load balancer), still advance when session exists
  useEffect(() => {
    if (!isSearching || !API_URL) return;
    const poll = async () => {
      try {
        const cached = getCachedSession();
        const silent = !!cached;
        if (cached?.session && (cached.session._id || cached.session.id)) {
          if (import.meta.env.DEV)
            console.log(
              "[Blind Date] active-session poll: session found (cached)",
              cached.session._id ?? cached.session.id
            );
          setIsSearching(false);
          setSession(cached.session);
          try {
            await fetch(`${API_URL}/api/blind-date/record-usage`, {
              method: "POST",
              credentials: "include",
            });
          } catch { /* ignore */ }
        }
        await fetchActiveSession(API_URL, silent);
        const fresh = getCachedSession();
        if (fresh?.session && (fresh.session._id || fresh.session.id)) {
          if (import.meta.env.DEV)
            console.log(
              "[Blind Date] active-session poll: session found (fresh)",
              fresh.session._id ?? fresh.session.id
            );
          setIsSearching(false);
          setSession(fresh.session);
          try {
            await fetch(`${API_URL}/api/blind-date/record-usage`, {
              method: "POST",
              credentials: "include",
            });
          } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
    };
    const interval = setInterval(poll, 2500);
    poll();
    return () => clearInterval(interval);
  }, [isSearching, API_URL, getCachedSession, fetchActiveSession]);

  const calculateAge = (birthday) => {
    if (!birthday || !birthday.year) return 0;
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthday.year);
  };

  const handleStartMatching = useCallback(() => {
    if (!socketReady || !currentUser) return;
    if (!accessStatus?.isAllowed) {
      setShowSubModal(true);
      return;
    }
    const userAge = calculateAge(currentUser.birthday);
    setIsSearching(true);
    socketRef.current?.emit("join_blind_queue", {
      userId: currentUser._id,
      criteria: {
        age: userAge,
        gender: currentUser.gender,
        lookingFor: currentUser.lookingFor,
        location: currentUser.location,
      },
    });
  }, [socketReady, currentUser, accessStatus?.isAllowed]);

  const handleInstructionConfirm = useCallback(() => {
    if (socketRef.current && session?._id) {
      socketRef.current.emit("confirm_instructions", {
        sessionId: session._id,
      });
    }
  }, [session]);

  const handleProceed = useCallback(() => {
    if (socketRef.current && session?._id) {
      socketRef.current.emit("proceed_to_next_stage", {
        sessionId: session._id,
      });
    }
  }, [session]);

  const getCancelReason = useCallback(() => {
    if (!session?.participants?.length || !currentUser?._id)
      return "disconnected";
    const p0 = session.participants[0];
    const p1Id = p0?._id ?? p0;
    if (!p1Id) return "disconnected";
    const isUser1 = String(p1Id) === String(currentUser._id);
    const partnerDecision = isUser1
      ? session.u2RevealDecision
      : session.u1RevealDecision;
    return partnerDecision === "no" ? "partner_rejected" : "disconnected";
  }, [session, currentUser]);

  const totalMatchPercentage = useMemo(() => {
    if (!session || !session.questions || session.questions.length === 0)
      return 0;
    const answeredQs = session.questions.filter(
      (q) => q.u1Answer !== null && q.u2Answer !== null
    );
    if (answeredQs.length === 0) return 0;
    const matches = answeredQs.filter((q) => q.u1Answer === q.u2Answer).length;
    return Math.round((matches / answeredQs.length) * 100);
  }, [session]);

  if (!currentUser || statusLoading)
    return (
      <div className="blind-date-page__loading">{t("blindDate.loading")}</div>
    );

  if (isSearching) {
    return (
      <BlindQueue
        socketRef={socketRef}
        onCancel={() => setIsSearching(false)}
      />
    );
  }

  const getButtonText = () => {
    if (!socketReady) return t("blindDate.connecting");
    if (accessStatus?.isAllowed) return t("blindDate.enterBlindDate");
    if (accessStatus?.reason === "limit_reached")
      return t("blindDate.dailyLimitReached");
    if (accessStatus?.reason === "cooldown")
      return t("blindDate.nextDateIn", { time: timeLeft });
    return t("blindDate.enterBlindDate");
  };

  const isButtonDisabled =
    !socketReady ||
    (!accessStatus?.isAllowed && accessStatus?.reason === "cooldown");

  return (
    <div className="blind-date-page">
      {!session ? (
        <div className="blind-date-page__intro">
          <span className="blind-date-page__product-label" aria-hidden="true">
            UNLOCK-ME
          </span>
          <div className="blind-date-page__icon-box">
            <img
              src={loveIsBlindImg}
              alt=""
              className="blind-date-page__icon blind-date-page__icon--img"
              aria-hidden="true"
            />
          </div>
          <h1 className="blind-date-page__title">{t("blindDate.title")}</h1>
          <p className="blind-date-page__text">{t("blindDate.subtitle")}</p>

          {!accessStatus?.isAllowed &&
            accessStatus?.reason === "limit_reached" && (
              <p className="blind-date-page__status-msg">
                {t("blindDate.usedFreeToday")}{" "}
                <span onClick={() => setShowSubModal(true)}>
                  {t("blindDate.upgradeUnlimited")}
                </span>
              </p>
            )}

          <button
            className={`blind-date-page__btn ${
              isButtonDisabled ? "blind-date-page__btn--disabled" : ""
            }`}
            onClick={handleStartMatching}
            disabled={isButtonDisabled}
          >
            {getButtonText()}
          </button>
        </div>
      ) : (
        <div className="blind-date-page__session-container">
          {session.status === "instructions" && (
            <BlindInstructions onConfirm={handleInstructionConfirm} />
          )}

          {["active", "waiting_for_stage_2", "waiting_for_stage_3"].includes(
            session.status
          ) && (
            <BlindProgressBar
              currentStage={session.currentStage}
              currentIndex={
                session.currentStage === 3
                  ? session.messages?.filter(
                      (m) => m.sender === currentUser._id
                    )?.length ?? 0
                  : session.currentQuestionIndex ?? 0
              }
            />
          )}

          {session.status === "active" &&
            (session.currentStage === 1 || session.currentStage === 2) && (
              <div className="blind-date-page__game-layout">
                <BlindGameCard
                  session={session}
                  currentUser={currentUser}
                  socketRef={socketRef}
                />
              </div>
            )}

          {session.status === "waiting_for_stage_2" && (
            <BlindInterestsModal
              session={session}
              currentUser={currentUser}
              onContinue={handleProceed}
              stage={1}
            />
          )}

          {session.status === "waiting_for_stage_3" && (
            <BlindInterestsModal
              session={session}
              currentUser={currentUser}
              onContinue={handleProceed}
              stage={2}
            />
          )}

          {session.currentStage === 3 && session.status === "active" && (
            <div className="blind-date-page__final-chat-container">
              <h2 className="blind-date-page__stage-title">
                {t("blindDate.deepDiveTitle")}
              </h2>
              <BlindChatSection
                session={session}
                currentUser={currentUser}
                socketRef={socketRef}
              />
            </div>
          )}

          {(session.status === "waiting_for_stage_3" ||
            (session.status === "active" &&
              session.currentStage === 3 &&
              (session.messages?.filter((m) => m.sender === currentUser._id)
                ?.length ?? 0) >= 5)) && (
            <div className="blind-date-page__transition-card">
              {(() => {
                const p0 = session.participants?.[0];
                const p1Id = p0?._id ?? p0;
                const isUser1 =
                  p1Id != null && String(p1Id) === String(currentUser._id);
                const amIReady = isUser1
                  ? session.stageProgress.u1ReadyNext
                  : session.stageProgress.u2ReadyNext;

                if (amIReady) {
                  return (
                    <div className="blind-date-page__waiting-status">
                      <div className="blind-date-page__spinner-small"></div>
                      <p className="blind-date-page__spinner-small_message">
                        {t("blindDate.waitingPartnerFinish")}
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <>
                      <p className="blind-date-page__transition-msg">
                        {t("blindDate.chatLimitProceed")}
                      </p>
                      <button
                        className="blind-date-page__proceed-btn"
                        onClick={handleProceed}
                      >
                        {t("blindDate.readyForReveal")}
                      </button>
                    </>
                  );
                }
              })()}
            </div>
          )}

          {(session.currentStage === 4 ||
            session.status === "waiting_for_reveal") &&
            session.status !== "cancelled" &&
            session.status !== "completed" && (
              <BlindRevealZone
                session={session}
                currentUser={currentUser}
                socketRef={socketRef}
                matchPercentage={totalMatchPercentage}
              />
            )}

          {session.status === "completed" && (
            <BlindFinalReveal session={session} currentUser={currentUser} />
          )}

          {session.status === "cancelled" && (
            <>
              {getCancelReason() === "partner_rejected" ? (
                <BlindRejected onRetry={() => window.location.reload()} />
              ) : (
                <div className="blind-date-page__error-state">
                  <div className="blind-date-page__error-icon">🔌</div>
                  <h2 className="blind-date-page__error-title">
                    {t("blindDate.connectionLost")}
                  </h2>
                  <p className="blind-date-page__error-desc">
                    {t("blindDate.matchDisconnected")}
                  </p>
                  <button
                    className="blind-date-page__retry-btn"
                    onClick={() => window.location.reload()}
                  >
                    {t("blindDate.tryAgain")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {showSubModal && (
        <SubscriptionModal
          onClose={() => setShowSubModal(false)}
          message={t("blindDate.dailyLimitModal")}
        />
      )}
    </div>
  );
};

export default BlindDatePage;
