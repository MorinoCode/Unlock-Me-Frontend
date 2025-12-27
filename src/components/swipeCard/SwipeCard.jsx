import React, { useState, useRef, useImperativeHandle, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { useNavigate } from 'react-router-dom';
import './SwipeCard.css';

const SwipeCard = React.forwardRef(({ user, onSwipe, onCardLeftScreen, actionFeedback, index }, ref) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIcebreaker, setShowIcebreaker] = useState(false);
  
  const tinderCardRef = useRef();
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    async swipe(dir) { if (tinderCardRef.current?.swipe) await tinderCardRef.current.swipe(dir); },
    async restoreCard() { if (tinderCardRef.current?.restoreCard) await tinderCardRef.current.restoreCard(); }
  }));

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    };
  }, [user._id]);

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleFlip = (e) => {
    stopPropagation(e);
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setIsFlipped(!isFlipped);
  };

  const handleAudioToggle = (e) => {
    stopPropagation(e);
    if (!user.voiceIntro || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleProfileClick = () => {
    if (!isFlipped && !showIcebreaker) navigate(`/user-profile/${user._id}`);
  };

  const handleChatClick = (e) => {
    stopPropagation(e);
    setShowIcebreaker(true);
  };

  const handleProceedToChat = (e) => {
    stopPropagation(e);
    navigate(`/chat/${user._id}`);
  };

  const handleCloseIcebreaker = (e) => {
    stopPropagation(e);
    setShowIcebreaker(false);
  };

  const hasPhotos = user.gallery && user.gallery.length > 0;

  return (
    <TinderCard
      ref={tinderCardRef}
      className="swipe"
      onSwipe={(dir) => { if (onSwipe) onSwipe(dir, user, index); }}
      onCardLeftScreen={() => { if (onCardLeftScreen) onCardLeftScreen(index); }}
      preventSwipe={['down']}
    >
      <div className={`swipe-card__inner ${isFlipped ? 'swipe-card__inner--flipped' : ''}`}>

        <div className="swipe-card__front" style={{ backgroundImage: `url(${user.avatar || '/default-avatar.png'})` }}>

          <div className={`swipe-card__stamp swipe-card__stamp--like ${actionFeedback === 'right' ? 'swipe-card__stamp--visible' : ''}`}>LIKE</div>
          <div className={`swipe-card__stamp swipe-card__stamp--nope ${actionFeedback === 'left' ? 'swipe-card__stamp--visible' : ''}`}>NOPE</div>
          <div className={`swipe-card__stamp swipe-card__stamp--super ${actionFeedback === 'up' ? 'swipe-card__stamp--visible' : ''}`}>SUPER</div>

          <button 
            className="swipe-card__btn-flip" 
            onClick={handleFlip}
            onTouchStart={stopPropagation}
            onMouseDown={stopPropagation}
          >
             🧬 DNA Breakdown
          </button>

          <div 
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '75%', zIndex: 10, cursor: 'pointer'}}
            onClick={handleProfileClick}
            role="button"
            tabIndex={0}
          ></div>

          <div className="swipe-card__overlay">
             <h2 className="swipe-card__name">
               {user.name} <span className="swipe-card__age">{user.age}</span>
             </h2>
             <div className="swipe-card__location">
               📍 {user.location?.city || "Unknown"}, {user.location?.country || "Unknown"}
             </div>

             <button
               className="swipe-card__btn-chat"
               onClick={handleChatClick}
               onTouchStart={stopPropagation}
               onMouseDown={stopPropagation}
             >
               💬
             </button>

             <button 
                className={`swipe-card__btn-audio ${isPlaying ? 'swipe-card__btn-audio--playing' : ''}`}
                onClick={handleAudioToggle}
                onTouchStart={stopPropagation}
                onMouseDown={stopPropagation}
                disabled={!user.voiceIntro}
             >
               {isPlaying ? '⏸' : '🎤'}
             </button>
             {user.voiceIntro && <audio ref={audioRef} src={user.voiceIntro} onEnded={() => setIsPlaying(false)} />}
          </div>

          {showIcebreaker && (
            <div className="swipe-card__icebreaker-overlay" onClick={stopPropagation} onTouchStart={stopPropagation}>
              <div className="icebreaker-content">
                <h3>🧊 Icebreaker</h3>
                <p>"{user.icebreaker || `Ask about ${user.name}'s bio!`}"</p>
                <div className="icebreaker-actions">
                  <button className="btn-cancel" onClick={handleCloseIcebreaker}>Cancel</button>
                  <button className="btn-proceed" onClick={handleProceedToChat}>Start Chat</button>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="swipe-card__back">
          <div className="swipe-card__back-header">
             <h3 className="swipe-card__title">DNA Breakdown</h3>
             <button className="swipe-card__btn-close" onClick={handleFlip} onTouchStart={stopPropagation}>✕</button>
          </div>

          <div className="swipe-card__synergy">
            <div className="swipe-card__synergy-text">
               "Strong Synergy: Great potential for a balanced partnership based on your shared {user.dna?.dominantTrait || 'traits'}."
            </div>
          </div>

          <div className="swipe-card__dna-list">
             <div className="swipe-card__dna-row">
                <span className="swipe-card__dna-label"><span className="dna-icon--purple">✦</span> Logic</span>
                <span className="swipe-card__dna-value">{user.dna?.personalityType || "Intuitive"}</span>
             </div>
             <div className="swipe-card__dna-row">
                <span className="swipe-card__dna-label"><span className="dna-icon--pink">✦</span> Emotion</span>
                <span className="swipe-card__dna-value">Emotionally Intelligent</span>
             </div>
             <div className="swipe-card__dna-row">
                <span className="swipe-card__dna-label"><span className="dna-icon--blue">✦</span> Energy</span>
                <span className="swipe-card__dna-value">{user.dna?.dominantTrait || "Calm & Steady"}</span>
             </div>
             <div className="swipe-card__dna-row">
                <span className="swipe-card__dna-label"><span className="dna-icon--green">✦</span> Passion</span>
                <span className="swipe-card__dna-value">{user.interests?.[0] || "General"}</span>
             </div>
          </div>

          <div className="swipe-card__back-actions">
            <button 
               className="swipe-card__btn-photos" 
               onClick={handleFlip}
               onTouchStart={stopPropagation}
               disabled={!hasPhotos}
            >
               {hasPhotos ? "📸 View Photos" : "🚫 No Gallery Photos"}
            </button>
          </div>
        </div>

      </div>
    </TinderCard>
  );
});

export default SwipeCard;