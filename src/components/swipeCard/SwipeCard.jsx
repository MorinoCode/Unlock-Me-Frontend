import React, { useState, useRef, useImperativeHandle, useEffect } from 'react';
import { motion as Motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './SwipeCard.css';

const SwipeCard = React.forwardRef(({ user, onSwipe, onCardLeftScreen, actionFeedback, index }, ref) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Framer Motion Hooks
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

  useImperativeHandle(ref, () => ({
    async swipe(dir) {
      const xTarget = dir === 'right' ? window.innerWidth + 100 : dir === 'left' ? -window.innerWidth - 100 : 0;
      const yTarget = dir === 'up' ? -window.innerHeight - 100 : 0;
      
      await controls.start({
        x: xTarget,
        y: yTarget,
        opacity: 0,
        transition: { duration: 0.3 }
      });
      if (onSwipe) onSwipe(dir, user, index);
      if (onCardLeftScreen) onCardLeftScreen(index);
    },
    async restoreCard() {
      await controls.start({ x: 0, y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
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

  const handleDragEnd = async (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const swipeThreshold = 100;

    if (Math.abs(offset) > swipeThreshold || Math.abs(velocity) > 500) {
      const dir = offset > 0 ? "right" : "left";
      
      if (isFlipped) {
        controls.start({ x: 0, y: 0 });
        return;
      }

      await controls.start({ x: dir === "right" ? 1000 : -1000, opacity: 0 });
      if (onSwipe) onSwipe(dir, user, index);
      if (onCardLeftScreen) onCardLeftScreen(index);
    } else {
      controls.start({ x: 0, y: 0 });
    }
  };

  const handleFlip = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setIsFlipped(!isFlipped);
    console.log("Flipped state:", !isFlipped); // Added console log for verification
  };

  const handleAudioToggle = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
    if (!isFlipped) navigate(`/user-profile/${user._id}`);
  };

  const hasPhotos = user.gallery && user.gallery.length > 0;

  return (
    <Motion.div
      className="swipe-card-wrapper"
      drag={!isFlipped} 
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ x, rotate, opacity }}
      whileTap={{ scale: 1.02 }}
    >
      <div className={`swipe-card__inner ${isFlipped ? 'swipe-card__inner--flipped' : ''}`}>

        {/* --- FRONT SIDE --- */}
        <div className="swipe-card__front" style={{ backgroundImage: `url(${user.avatar || '/default-avatar.png'})` }}>
          
          <div className={`swipe-card__stamp swipe-card__stamp--like ${actionFeedback === 'right' ? 'swipe-card__stamp--visible' : ''}`}>LIKE</div>
          <div className={`swipe-card__stamp swipe-card__stamp--nope ${actionFeedback === 'left' ? 'swipe-card__stamp--visible' : ''}`}>NOPE</div>
          <div className={`swipe-card__stamp swipe-card__stamp--super ${actionFeedback === 'up' ? 'swipe-card__stamp--visible' : ''}`}>SUPER</div>

          <button 
            className="swipe-card__btn-flip" 
            onPointerUp={handleFlip} 
            // Removed onPointerDown to avoid double firing or conflicts
          >
             🧬 DNA Breakdown
          </button>

          <div 
            className="swipe-card__touch-area"
            onClick={handleProfileClick}
          ></div>

          <div className="swipe-card__overlay">
             <h2 className="swipe-card__name">
               {user.name} <span className="swipe-card__age">{user.age}</span>
             </h2>
             <div className="swipe-card__location">
               📍 {user.location?.city || "Unknown"}, {user.location?.country || "Unknown"}
             </div>

             <div style={{ marginTop: '15px' }}>
                <button 
                    className={`swipe-card__btn-audio-inline ${isPlaying ? 'playing' : ''}`}
                    onPointerUp={handleAudioToggle}
                    disabled={!user.voiceIntro}
                >
                  {isPlaying ? '⏸ Pause Voice' : (user.voiceIntro ? '▶ Play Voice Intro' : '🎤 No Voice Intro')}
                </button>
             </div>
             
             {user.voiceIntro && <audio ref={audioRef} src={user.voiceIntro} onEnded={() => setIsPlaying(false)} />}
          </div>
        </div>

        {/* --- BACK SIDE --- */}
        <div className="swipe-card__back">
          <div className="swipe-card__back-header">
             <h3 className="swipe-card__title">DNA Breakdown</h3>
             <button 
                type="button"
                className="swipe-card__btn-close" 
                // Using only onPointerUp for consistent behavior
                onPointerUp={handleFlip}
             >✕</button>
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
               onPointerUp={handleFlip}
               disabled={!hasPhotos}
            >
               {hasPhotos ? "📸 View Photos" : "🚫 No Gallery Photos"}
            </button>
          </div>
        </div>
      </div>
    </Motion.div>
  );
});

export default SwipeCard;