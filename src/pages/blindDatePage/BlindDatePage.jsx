import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import BlindQueue from '../../components/blindDateComponents/blindQueue/BlindQueue';
import BlindProgressBar from "../../components/blindDateComponents/blindProgressBar/BlindProgressBar";
import BlindGameCard from '../../components/blindDateComponents/blindGameCard/BlindGameCard';
import BlindChatSection from '../../components/blindDateComponents/blindChatSection/BlindChatSection';
import BlindInterestsModal from '../../components/blindDateComponents/blindInterestsModal/BlindInterestsModal';
import BlindRevealZone from '../../components/blindDateComponents/blindRevealZone/BlindRevealZone';
import BlindFinalReveal from '../../components/blindDateComponents/blindFinalReveal/BlindFinalReveal';
import './BlindDatePage.css';
import { useAuth } from '../../context/useAuth';

const BlindDatePage = () => {
    const { currentUser } = useAuth();
    const [session, setSession] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [socketReady, setSocketReady] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });
        
        socketRef.current.on('connect', () => setSocketReady(true));

        socketRef.current.on('match_found', (newSession) => {
            setSession(newSession);
            setIsSearching(false);
        });

        socketRef.current.on('session_update', (updatedSession) => {
            setSession(updatedSession);
        });

        socketRef.current.on('session_cancelled', () => {
            setSession(prev => ({ ...prev, status: 'cancelled' }));
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const calculateAge = (birthday) => {
        if (!birthday || !birthday.year) return 0;
        const currentYear = new Date().getFullYear();
        return currentYear - parseInt(birthday.year);
    };

    const handleStartMatching = () => {
        if (!socketReady || !currentUser) return;
        
        const userAge = calculateAge(currentUser.birthday);

        setIsSearching(true);
        socketRef.current.emit('join_blind_queue', {
            criteria: {
                age: userAge,
                gender: currentUser.gender,
                lookingFor: currentUser.lookingFor
            }
        });
    };

    const handleProceed = () => {
        if (socketRef.current && session) {
            socketRef.current.emit('proceed_to_next_stage', { sessionId: session._id });
        }
    };

    if (!currentUser) return <div className="blind-date-page__loading">Loading...</div>;

    if (isSearching) {
        return <BlindQueue socketRef={socketRef} onCancel={() => setIsSearching(false)} />;
    }

    return (
        <div className="blind-date-page">
            {!session ? (
                <div className="blind-date-page__intro">
                    <div className="blind-date-page__icon-box">
                        <span className="blind-date-page__icon">🎭</span>
                    </div>
                    <h1 className="blind-date-page__title">Love is Blind</h1>
                    <p className="blind-date-page__text">
                        Discover connection through conversation. Personalities revealed first, faces later.
                    </p>
                    <button 
                        className={`blind-date-page__btn ${!socketReady ? 'blind-date-page__btn--disabled' : ''}`} 
                        onClick={handleStartMatching}
                        disabled={!socketReady}
                    >
                        {socketReady ? 'Enter Blind Date' : 'Connecting...'}
                    </button>
                </div>
            ) : (
                <div className="blind-date-page__session-container">
                    
                    {['active', 'waiting_for_stage_2', 'waiting_for_stage_3', 'waiting_for_reveal'].includes(session.status) && (
                        <BlindProgressBar 
                            currentStage={session.currentStage} 
                            currentIndex={session.currentQuestionIndex} 
                        />
                    )}

                    {session.status === 'active' && (session.currentStage === 1 || session.currentStage === 2) && (
                        <div className="blind-date-page__game-layout">
                            <BlindGameCard session={session} currentUser={currentUser} socketRef={socketRef} />
                            {session.currentStage === 2 && (
                                <div className="blind-date-page__chat-wrapper">
                                    <BlindChatSection session={session} currentUser={currentUser} socketRef={socketRef} />
                                </div>
                            )}
                        </div>
                    )}

                    {session.status === 'waiting_for_stage_2' && (
                        <BlindInterestsModal session={session} onContinue={handleProceed} />
                    )}

                    {session.currentStage === 3 && session.status === 'active' && (
                        <div className="blind-date-page__final-chat-container">
                            <h2 className="blind-date-page__stage-title">Deep Dive Conversation</h2>
                            <BlindChatSection session={session} currentUser={currentUser} socketRef={socketRef} />
                        </div>
                    )}

                    {(session.status === 'waiting_for_stage_3' || (session.status === 'active' && session.currentStage === 3 && session.messages.filter(m => m.sender === currentUser._id).length >= 10)) && (
                        <div className="blind-date-page__transition-card">
                            <p className="blind-date-page__transition-msg">Stage completed. Proceed to the reveal decision?</p>
                            <button className="blind-date-page__proceed-btn" onClick={handleProceed}>
                                Ready for Reveal
                            </button>
                        </div>
                    )}

                    {session.status === 'waiting_for_reveal' && (
                        <BlindRevealZone session={session} currentUser={currentUser} socketRef={socketRef} />
                    )}

                    {session.status === 'completed' && (
                        <BlindFinalReveal session={session} currentUser={currentUser} />
                    )}

                    {session.status === 'cancelled' && (
                        <div className="blind-date-page__error-state">
                            <div className="blind-date-page__error-icon">💔</div>
                            <h2 className="blind-date-page__error-title">Session Ended</h2>
                            <p className="blind-date-page__error-desc">The match was disconnected or the session was closed.</p>
                            <button className="blind-date-page__retry-btn" onClick={() => window.location.reload()}>Return Home</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlindDatePage;