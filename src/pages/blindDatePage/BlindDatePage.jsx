import React, { useState, useEffect, useRef, useMemo } from "react";
import { io } from "socket.io-client";
import BlindQueue from "../../components/blindDateComponents/blindQueue/BlindQueue";
import BlindProgressBar from "../../components/blindDateComponents/blindProgressBar/BlindProgressBar";
import BlindGameCard from "../../components/blindDateComponents/blindGameCard/BlindGameCard";
import BlindChatSection from "../../components/blindDateComponents/blindChatSection/BlindChatSection";
import BlindInterestsModal from "../../components/blindDateComponents/blindInterestsModal/BlindInterestsModal";
import BlindRevealZone from "../../components/blindDateComponents/blindRevealZone/BlindRevealZone";
import BlindFinalReveal from "../../components/blindDateComponents/blindFinalReveal/BlindFinalReveal";
import BlindInstructions from "../../components/blindDateComponents/blindInstructions/BlindInstructions";
import "./BlindDatePage.css";
import { useAuth } from "../../context/useAuth.js";
import BlindRejected from "../../components/blindDateComponents/blindRejected/BlindRejected.jsx";

const BlindDatePage = () => {
  const { currentUser } = useAuth();
  const [session, setSession] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef(null);

  // --- Socket Connection & Listeners ---
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      setSocketReady(true);
      if (currentUser?._id) {
        socketRef.current.emit("join_room", currentUser._id);
      }
    });

    socketRef.current.on("match_found", (newSession) => {
      setSession(newSession);
      setIsSearching(false);
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
  }, [currentUser]);

  // --- Helper Functions ---

  const calculateAge = (birthday) => {
    if (!birthday || !birthday.year) return 0;
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthday.year);
  };

  const handleStartMatching = () => {
    if (!socketReady || !currentUser) return;

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

  // Logic to determine why the session was cancelled (Partner rejection vs. technical issue)
  const getCancelReason = () => {
    if (!session) return null;
    
    const p1Id = session.participants[0]._id || session.participants[0];
    const isUser1 = p1Id.toString() === currentUser._id.toString();

    // const myDecision = isUser1 ? session.u1RevealDecision : session.u2RevealDecision;
    const partnerDecision = isUser1 ? session.u2RevealDecision : session.u1RevealDecision;

    if (partnerDecision === 'no') {
      return "partner_rejected";
    }
    return "disconnected";
  };

  // --- Calculations ---

  // Calculate Total Match Percentage based on all answered questions
  const totalMatchPercentage = useMemo(() => {
    if (!session || !session.questions || session.questions.length === 0) return 0;
    
    // Filter questions where BOTH participants have answered
    const answeredQs = session.questions.filter(q => q.u1Answer !== null && q.u2Answer !== null);
    
    if (answeredQs.length === 0) return 0;

    const matches = answeredQs.filter(q => q.u1Answer === q.u2Answer).length;
    return Math.round((matches / answeredQs.length) * 100);
  }, [session]);


  // --- Render ---

  if (!currentUser)
    return <div className="blind-date-page__loading">Loading...</div>;

  if (isSearching) {
    return (
      <BlindQueue
        socketRef={socketRef}
        onCancel={() => setIsSearching(false)}
      />
    );
  }

  return (
    <div className="blind-date-page">
      {!session ? (
        // 1. Intro Screen
        <div className="blind-date-page__intro">
          <div className="blind-date-page__icon-box">
            <span className="blind-date-page__icon">🎭</span>
          </div>
          <h1 className="blind-date-page__title">Love is Blind</h1>
          <p className="blind-date-page__text">
            Discover connection through conversation. Personalities revealed
            first, faces later.
          </p>
          <button
            className={`blind-date-page__btn ${
              !socketReady ? "blind-date-page__btn--disabled" : ""
            }`}
            onClick={handleStartMatching}
            disabled={!socketReady}
          >
            {socketReady ? "Enter Blind Date" : "Connecting..."}
          </button>
        </div>
      ) : (
        <div className="blind-date-page__session-container">
          
          {/* 2. Instructions (Before Game Starts) */}
          {session.status === "instructions" && (
            <BlindInstructions onConfirm={handleInstructionConfirm} />
          )}

          {/* 3. Progress Bar (Hidden in Reveal Phase) */}
          {["active", "waiting_for_stage_2", "waiting_for_stage_3"].includes(session.status) && (
            <BlindProgressBar
              currentStage={session.currentStage}
              // Smart index: Message count for Stage 3, Question index for others
              currentIndex={
                session.currentStage === 3 
                  ? session.messages.filter(m => m.sender === currentUser._id).length 
                  : session.currentQuestionIndex
              }
            />
          )}

          {/* 4. Game Area (Stages 1 & 2 - Questions Only) */}
          {session.status === "active" &&
            (session.currentStage === 1 || session.currentStage === 2) && (
              <div className="blind-date-page__game-layout">
                <BlindGameCard
                  session={session}
                  currentUser={currentUser}
                  socketRef={socketRef}
                />
                {/* Note: Chat section removed for Stage 2 based on requirements */}
              </div>
            )}

          {/* 5. Stage Results Modals */}
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

          {/* 6. Stage 3 (Deep Dive Chat) */}
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

          {/* 7. Transition to Reveal (After 10 Messages) */}
          {(session.status === "waiting_for_stage_3" ||
            (session.status === "active" &&
              session.currentStage === 3 &&
              session.messages.filter((m) => m.sender === currentUser._id)
                .length >= 10)) && (
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
                      <p>Waiting for partner to finish...</p>
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

          {/* 8. Reveal Decision Zone */}
         {/* 8. Reveal Decision Zone */}
          {/* ✅ FIX: اضافه کردن شرط که اگر کنسل یا تمام شده بود، این باکس دیگر نشان داده نشود */}
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

          {/* 9. Final Match Success */}
          {session.status === "completed" && (
            <BlindFinalReveal session={session} currentUser={currentUser} />
          )}

          {/* 10. Cancelled / Rejected State */}
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
    </div>
  );
};

export default BlindDatePage;