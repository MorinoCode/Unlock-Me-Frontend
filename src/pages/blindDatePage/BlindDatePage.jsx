import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import "./BlindDatePage.css";
import { useAuth } from "../../context/useAuth.js";

const BlindDatePage = () => {
  const { currentUser } = useAuth();
  const [session, setSession] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef(null);
  
  // --- New States for Limits ---
  const [statusLoading, setStatusLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(""); 

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // --- 1. Fix: Wrap fetchStatus in useCallback ---
  const fetchStatus = useCallback(async () => {
    try {
        const res = await fetch(`${API_URL}/api/blind-date/status`, {
            credentials: 'include'
        });
        const data = await res.json();
        setAccessStatus(data);
    } catch (err) {
        console.error("Status fetch error", err);
    } finally {
        setStatusLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // --- 2. Timer Logic (Countdown) ---
  useEffect(() => {
    if (accessStatus?.reason === 'cooldown' && accessStatus?.nextAvailableTime) {
        const interval = setInterval(() => {
            const now = new Date();
            const end = new Date(accessStatus.nextAvailableTime);
            const diff = end - now;

            if (diff <= 0) {
                clearInterval(interval);
                fetchStatus(); // Refresh status when timer ends
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
  }, [accessStatus, fetchStatus]);


  // --- Socket Connection ---
  useEffect(() => {
    // Avoid connecting if no API URL
    if (!API_URL) return;

    socketRef.current = io(API_URL, {
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      setSocketReady(true);
      if (currentUser?._id) {
        socketRef.current.emit("join_room", currentUser._id);
      }
    });

    socketRef.current.on("match_found", async (newSession) => {
      setSession(newSession);
      setIsSearching(false);
      
      // Record Usage
      try {
          await fetch(`${API_URL}/api/blind-date/record-usage`, { method: 'POST', credentials: 'include' });
      } catch (e) { console.error("Failed to record usage", e); }
    });

    socketRef.current.on("session_update", (updatedSession) => {
      setSession(updatedSession);
    });

    socketRef.current.on("session_cancelled", () => {
      setSession((prev) => ({ ...prev, status: "cancelled" }));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [currentUser, API_URL]);

  const calculateAge = (birthday) => {
    if (!birthday || !birthday.year) return 0;
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthday.year);
  };

  const handleStartMatching = () => {
    if (!socketReady || !currentUser) return;

    if (!accessStatus?.isAllowed) {
        setShowSubModal(true);
        return;
    }

    const userAge = calculateAge(currentUser.birthday);

    setIsSearching(true);
    socketRef.current.emit("join_blind_queue", {
      criteria: {
        age: userAge,
        gender: currentUser.gender,
        lookingFor: currentUser.lookingFor,
        location: currentUser.location, 
      },
    });
  };

  const handleInstructionConfirm = () => {
    if (socketRef.current && session) {
      socketRef.current.emit("confirm_instructions", { sessionId: session._id });
    }
  };

  const handleProceed = () => {
    if (socketRef.current && session) {
      socketRef.current.emit("proceed_to_next_stage", {
        sessionId: session._id,
      });
    }
  };

  const getCancelReason = () => {
    if (!session) return null;
    const p1Id = session.participants[0]._id || session.participants[0];
    const isUser1 = p1Id.toString() === currentUser._id.toString();
    const partnerDecision = isUser1 ? session.u2RevealDecision : session.u1RevealDecision;

    if (partnerDecision === 'no') {
      return "partner_rejected";
    }
    return "disconnected";
  };

  const totalMatchPercentage = useMemo(() => {
    if (!session || !session.questions || session.questions.length === 0) return 0;
    const answeredQs = session.questions.filter(q => q.u1Answer !== null && q.u2Answer !== null);
    if (answeredQs.length === 0) return 0;
    const matches = answeredQs.filter(q => q.u1Answer === q.u2Answer).length;
    return Math.round((matches / answeredQs.length) * 100);
  }, [session]);


  if (!currentUser || statusLoading)
    return <div className="blind-date-page__loading">Loading...</div>;

  if (isSearching) {
    return (
      <BlindQueue
        socketRef={socketRef}
        onCancel={() => setIsSearching(false)}
      />
    );
  }

  const getButtonText = () => {
      if (!socketReady) return "Connecting...";
      if (accessStatus?.isAllowed) return "Enter Blind Date";
      if (accessStatus?.reason === 'limit_reached') return "Daily Limit Reached";
      if (accessStatus?.reason === 'cooldown') return `Next Date in: ${timeLeft}`;
      return "Enter Blind Date";
  };

  const isButtonDisabled = !socketReady || (!accessStatus?.isAllowed && accessStatus?.reason === 'cooldown');

  return (
    <div className="blind-date-page">
      {!session ? (
        <div className="blind-date-page__intro">
          <div className="blind-date-page__icon-box">
            <span className="blind-date-page__icon">🎭</span>
          </div>
          <h1 className="blind-date-page__title">Love is Blind</h1>
          <p className="blind-date-page__text">
            Discover connection through conversation. Personalities revealed
            first, faces later.
          </p>
          
          {!accessStatus?.isAllowed && accessStatus?.reason === 'limit_reached' && (
              <p className="blind-date-page__status-msg">
                  You've used your free games for today! 
                  <span onClick={() => setShowSubModal(true)}> Upgrade for unlimited.</span>
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

          {["active", "waiting_for_stage_2", "waiting_for_stage_3"].includes(session.status) && (
            <BlindProgressBar
              currentStage={session.currentStage}
              currentIndex={
                session.currentStage === 3 
                  ? session.messages.filter(m => m.sender === currentUser._id).length 
                  : session.currentQuestionIndex
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
                Deep Dive Conversation
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
              session.messages.filter((m) => m.sender === currentUser._id)
                .length >= 5)) && (
            <div className="blind-date-page__transition-card">
              {(() => {
                const p1Id = session.participants[0]._id || session.participants[0];
                const isUser1 = p1Id.toString() === currentUser._id.toString();
                const amIReady = isUser1 
                  ? session.stageProgress.u1ReadyNext 
                  : session.stageProgress.u2ReadyNext;

                if (amIReady) {
                  return (
                    <div className="blind-date-page__waiting-status">
                      <div className="blind-date-page__spinner-small"></div>
                      <p className="blind-date-page__spinner-small_message">Waiting for partner to finish...</p>
                    </div>
                  );
                } else {
                  return (
                    <>
                      <p className="blind-date-page__transition-msg">
                        Chat limit reached. Proceed to the reveal decision?
                      </p>
                      <button
                        className="blind-date-page__proceed-btn"
                        onClick={handleProceed}
                      >
                        Ready for Reveal
                      </button>
                    </>
                  );
                }
              })()}
            </div>
          )}

          {(session.currentStage === 4 || session.status === "waiting_for_reveal") && 
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
                  <h2 className="blind-date-page__error-title">Connection Lost</h2>
                  <p className="blind-date-page__error-desc">
                    The match was disconnected unexpectedly.
                  </p>
                  <button
                    className="blind-date-page__retry-btn"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
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
            message="You've reached your daily Blind Date limit! Upgrade for unlimited games."
        />
      )}
    </div>
  );
};

export default BlindDatePage;