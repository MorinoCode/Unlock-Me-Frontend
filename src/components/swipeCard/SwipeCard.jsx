import React, {
  useState,
  useRef,
  useImperativeHandle,
  useEffect,
  useMemo,
} from "react";
import {
  motion as Motion,
  useMotionValue,
  useTransform,
  useAnimation,
} from "framer-motion";
import { Dna } from "lucide-react";
import "./SwipeCard.css";

const SwipeCard = React.forwardRef(
  ({ user, onSwipe, onCardLeftScreen, actionFeedback, index }, ref) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const audioRef = useRef(null);
    const touchZoneRef = useRef({ 
      isDragging: false, 
      startX: 0, 
      startY: 0, 
      startTime: 0,
      isInTouchZone: false 
    });
    const dragStartPosRef = useRef({ x: 0, y: 0 });

    const photos = useMemo(() => {
      return [user.avatar, ...(user.gallery || [])].filter(Boolean);
    }, [user]);

    const displayPhotos = photos.length > 0 ? photos : ["/default-avatar.png"];
    const matchPercentage = user.matchScore || 0;

    const controls = useAnimation();
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const likeOpacity = useTransform(x, [20, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-20, -150], [0, 1]);
    const superOpacity = useTransform(y, [-20, -150], [0, 1]);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

    useImperativeHandle(ref, () => ({
      async swipe(dir) {
        const xTarget =
          dir === "right"
            ? window.innerWidth + 100
            : dir === "left"
            ? -window.innerWidth - 100
            : 0;
        const yTarget = dir === "up" ? -window.innerHeight - 100 : 0;

        await controls.start({
          x: xTarget,
          y: yTarget,
          opacity: 0,
          transition: { duration: 0.2 },
        });
        if (onSwipe) onSwipe(dir, user, index);
        if (onCardLeftScreen) onCardLeftScreen(index);
      },
      async restoreCard() {
        await controls.start({
          x: 0,
          y: 0,
          opacity: 1,
          transition: { type: "spring", stiffness: 300, damping: 20 },
        });
      },
      flip() {
        setIsFlipped((prev) => !prev);
      },
    }));

    // ✅ FIX: Capture ref value in effect for cleanup
    useEffect(() => {
      const audioNode = audioRef.current;
      return () => {
        if (audioNode) {
          audioNode.pause();
          audioNode.currentTime = 0;
        }
        setIsPlaying(false);
      };
    }, [user._id]);

    const handleDragStart = (event, info) => {
      // Check if drag started in a touch zone
      const x = event.clientX || event.touches?.[0]?.clientX || 0;
      const cardRect = event.currentTarget?.getBoundingClientRect();
      if (cardRect && displayPhotos.length > 1) {
        const relativeX = x - cardRect.left;
        const cardWidth = cardRect.width;
        const isInLeftZone = relativeX < cardWidth * 0.5;
        const isInRightZone = relativeX > cardWidth * 0.5;
        
        if (isInLeftZone || isInRightZone) {
          dragStartPosRef.current = { 
            x: info.point.x, 
            y: info.point.y,
            isInTouchZone: true,
            side: isInLeftZone ? 'left' : 'right'
          };
        } else {
          dragStartPosRef.current = { 
            x: info.point.x, 
            y: info.point.y,
            isInTouchZone: false 
          };
        }
      } else {
        dragStartPosRef.current = { 
          x: info.point.x, 
          y: info.point.y,
          isInTouchZone: false 
        };
      }
    };
    
    const handleDrag = (event, info) => {
      // If drag started in touch zone and movement is small, limit the drag
      if (dragStartPosRef.current.isInTouchZone) {
        const deltaX = Math.abs(info.point.x - dragStartPosRef.current.x);
        const deltaY = Math.abs(info.point.y - dragStartPosRef.current.y);
        
        // If horizontal movement is small (< 30px), limit vertical drag
        if (deltaX < 30 && deltaY < 20) {
          // Allow small movement but prevent large drags
          return;
        }
      }
    };

    const handleDragEnd = async (event, info) => {
      const offsetX = info.offset.x;
      const offsetY = info.offset.y;
      const velocity = info.velocity.x;
      const swipeThreshold = 100;
      
      // Check if drag started in touch zone
      if (dragStartPosRef.current.isInTouchZone) {
        const dragDeltaX = Math.abs(info.point.x - dragStartPosRef.current.x);
        const dragDeltaY = Math.abs(info.point.y - dragStartPosRef.current.y);
        
        // If it was a small drag (< 50px horizontal, < 30px vertical), don't swipe card
        // This allows photo change on tap/click but prevents card drag on small movements
        if (dragDeltaX < 50 && dragDeltaY < 30 && Math.abs(offsetX) < swipeThreshold && Math.abs(offsetY) < swipeThreshold) {
          controls.start({ x: 0, y: 0 });
          dragStartPosRef.current = { x: 0, y: 0, isInTouchZone: false };
          return;
        }
      }

      if (Math.abs(offsetX) > swipeThreshold || Math.abs(velocity) > 500) {
        const dir = offsetX > 0 ? "right" : "left";
        if (isFlipped) {
          controls.start({ x: 0, y: 0 });
          return;
        }
        await controls.start({
          x: dir === "right" ? 1000 : -1000,
          opacity: 0,
          transition: { duration: 0.2 },
        });
        if (onSwipe) onSwipe(dir, user, index);
        if (onCardLeftScreen) onCardLeftScreen(index);
      } else if (offsetY < -swipeThreshold) {
        await controls.start({
          y: -1000,
          opacity: 0,
          transition: { duration: 0.2 },
        });
        if (onSwipe) onSwipe("up", user, index);
        if (onCardLeftScreen) onCardLeftScreen(index);
      } else {
        controls.start({ x: 0, y: 0 });
      }
      
      dragStartPosRef.current = { x: 0, y: 0, isInTouchZone: false };
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

    const handleTouchZoneStart = (e, side) => {
      touchZoneRef.current = {
        isDragging: false,
        startX: e.clientX || e.touches?.[0]?.clientX || 0,
        startY: e.clientY || e.touches?.[0]?.clientY || 0,
        side: side,
        startTime: Date.now(),
        isInTouchZone: true,
      };
    };

    const handleTouchZoneMove = (e) => {
      if (!touchZoneRef.current.startX && !touchZoneRef.current.startY) return;
      
      const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
      const currentY = e.clientY || e.touches?.[0]?.clientY || 0;
      const deltaX = Math.abs(currentX - touchZoneRef.current.startX);
      const deltaY = Math.abs(currentY - touchZoneRef.current.startY);
      
      // If moved more than 10px horizontally or 5px vertically, consider it a drag
      if (deltaX > 10 || deltaY > 5) {
        touchZoneRef.current.isDragging = true;
      }
    };

    const handleTouchZoneEnd = (e, side) => {
      const timeElapsed = Date.now() - (touchZoneRef.current.startTime || 0);
      
      // If it was a drag (moved significantly) or took too long, don't change photo
      if (touchZoneRef.current.isDragging || timeElapsed > 300) {
        touchZoneRef.current = { 
          isDragging: false, 
          startX: 0, 
          startY: 0, 
          startTime: 0,
          isInTouchZone: false 
        };
        return;
      }

      // It was a quick tap/click, change photo
      e.stopPropagation();
      e.preventDefault();
      
      if (side === 'left' && currentPhotoIndex > 0) {
        setCurrentPhotoIndex((prev) => prev - 1);
      } else if (side === 'right' && currentPhotoIndex < displayPhotos.length - 1) {
        setCurrentPhotoIndex((prev) => prev + 1);
      }
      
      touchZoneRef.current = { 
        isDragging: false, 
        startX: 0, 
        startY: 0, 
        startTime: 0,
        isInTouchZone: false 
      };
    };

    return (
      <Motion.div
        className="swipe-card"
        drag={!isFlipped}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, y, rotate, opacity }}
        whileTap={{ scale: 1.02 }}
      >
        <div
          className={`swipe-card__inner ${
            isFlipped ? "swipe-card__inner--flipped" : ""
          }`}
        >
          {/* --- FRONT SIDE --- */}
          <div
            className="swipe-card__face swipe-card__face--front"
            style={{
              backgroundImage: `url(${displayPhotos[currentPhotoIndex]})`,
            }}
          >
            {displayPhotos.length > 1 && (
              <div className="swipe-card__stories">
                {displayPhotos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`swipe-card__story-bar ${
                      idx === currentPhotoIndex
                        ? "swipe-card__story-bar--active"
                        : ""
                    } ${
                      idx < currentPhotoIndex ? "swipe-card__story-bar--seen" : ""
                    }`}
                  ></div>
                ))}
                <div className="swipe-card__photo-counter">
                  {currentPhotoIndex + 1} / {displayPhotos.length}
                </div>
              </div>
            )}

            {displayPhotos.length > 1 && (
              <>
                <div
                  className="swipe-card__touch-zone swipe-card__touch-zone--left"
                  onPointerDown={(e) => handleTouchZoneStart(e, 'left')}
                  onPointerMove={handleTouchZoneMove}
                  onPointerUp={(e) => handleTouchZoneEnd(e, 'left')}
                  onTouchStart={(e) => handleTouchZoneStart(e, 'left')}
                  onTouchMove={handleTouchZoneMove}
                  onTouchEnd={(e) => handleTouchZoneEnd(e, 'left')}
                  style={{ display: currentPhotoIndex === 0 ? "none" : "flex" }}
                  aria-label="Previous photo"
                ></div>
                <div
                  className="swipe-card__touch-zone swipe-card__touch-zone--right"
                  onPointerDown={(e) => handleTouchZoneStart(e, 'right')}
                  onPointerMove={handleTouchZoneMove}
                  onPointerUp={(e) => handleTouchZoneEnd(e, 'right')}
                  onTouchStart={(e) => handleTouchZoneStart(e, 'right')}
                  onTouchMove={handleTouchZoneMove}
                  onTouchEnd={(e) => handleTouchZoneEnd(e, 'right')}
                  style={{
                    display:
                      currentPhotoIndex === displayPhotos.length - 1
                        ? "none"
                        : "flex",
                  }}
                  aria-label="Next photo"
                ></div>
              </>
            )}

            <Motion.div
              style={{ opacity: likeOpacity }}
              className={`swipe-card__stamp swipe-card__stamp--like ${
                actionFeedback === "right"
                  ? "swipe-card__stamp--force-visible"
                  : ""
              }`}
            >
              LIKE
            </Motion.div>
            <Motion.div
              style={{ opacity: nopeOpacity }}
              className={`swipe-card__stamp swipe-card__stamp--nope ${
                actionFeedback === "left"
                  ? "swipe-card__stamp--force-visible"
                  : ""
              }`}
            >
              NOPE
            </Motion.div>
            <Motion.div
              style={{ opacity: superOpacity }}
              className={`swipe-card__stamp swipe-card__stamp--super ${
                actionFeedback === "up"
                  ? "swipe-card__stamp--force-visible"
                  : ""
              }`}
            >
              SUPER
            </Motion.div>

            <button
              className="swipe-card__action-btn swipe-card__action-btn--dna"
              onPointerUp={handleFlip}
            >
              {" "}
              <span>DNA</span> <Dna size={20} />
            </button>

            {/* Info Area */}
            <div className="swipe-card__info">
              <div className="swipe-card__details-overlay">
                <h2 className="swipe-card__name">
                  {user.name}{" "}
                  <span className="swipe-card__age">{user.age}</span>
                </h2>

                <div className="swipe-card__meta-row">
                  <div className="swipe-card__location">
                    📍 {user.location?.city || "Unknown"},{" "}
                    {user.location?.country || "Unknown"}
                  </div>

                  <button
                    className={`swipe-card__voice-btn ${
                      isPlaying ? "swipe-card__voice-btn--playing" : ""
                    }`}
                    onPointerUp={handleAudioToggle}
                    disabled={!user.voiceIntro}
                  >
                    {isPlaying
                      ? "⏸"
                      : user.voiceIntro
                      ? "🎤 Voice"
                      : "🎤 No Voice"}
                  </button>
                </div>

                {user.voiceIntro && (
                  <audio
                    ref={audioRef}
                    src={user.voiceIntro}
                    onEnded={() => setIsPlaying(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* --- BACK SIDE (DNA) --- */}
          <div className="swipe-card__face swipe-card__face--back">
            <div className="swipe-card__back-header">
              <h3 className="swipe-card__back-title">DNA Analysis</h3>
              <button
                type="button"
                className="swipe-card__action-btn swipe-card__action-btn--close"
                onPointerUp={handleFlip}
              >
                ✕
              </button>
            </div>

            <div className="swipe-card__match-stats">
              <div 
                className="swipe-card__match-circle"
                style={{ '--match-percent': `${matchPercentage}%` }}
              >
                <span className="swipe-card__match-percent">
                  {matchPercentage}%
                </span>
                <span className="swipe-card__match-label">Match</span>
              </div>
              <div className="swipe-card__synergy-desc">
                "Strong Synergy with {user.name}."
              </div>
            </div>

            <div className="swipe-card__dna-grid">
              <div className="swipe-card__dna-item">
                <div className="swipe-card__dna-label-wrapper">
                  <span className="swipe-card__dna-icon swipe-card__icon--purple">✦</span>
                  <span className="swipe-card__dna-label">Logic</span>
                </div>
                <span className="swipe-card__dna-value">
                  {typeof user.dna?.Logic === 'number' 
                    ? `${user.dna.Logic}/100` 
                    : 'N/A'}
                </span>
              </div>
              <div className="swipe-card__dna-item">
                <div className="swipe-card__dna-label-wrapper">
                  <span className="swipe-card__dna-icon swipe-card__icon--pink">✦</span>
                  <span className="swipe-card__dna-label">Emotion</span>
                </div>
                <span className="swipe-card__dna-value">
                  {typeof user.dna?.Emotion === 'number' 
                    ? `${user.dna.Emotion}/100` 
                    : 'N/A'}
                </span>
              </div>
              <div className="swipe-card__dna-item">
                <div className="swipe-card__dna-label-wrapper">
                  <span className="swipe-card__dna-icon swipe-card__icon--blue">✦</span>
                  <span className="swipe-card__dna-label">Energy</span>
                </div>
                <span className="swipe-card__dna-value">
                  {typeof user.dna?.Energy === 'number' 
                    ? `${user.dna.Energy}/100` 
                    : 'N/A'}
                </span>
              </div>
              <div className="swipe-card__dna-item">
                <div className="swipe-card__dna-label-wrapper">
                  <span className="swipe-card__dna-icon swipe-card__icon--green">✦</span>
                  <span className="swipe-card__dna-label">Passion</span>
                </div>
                <span className="swipe-card__dna-value">
                  {typeof user.dna?.Creativity === 'number' 
                    ? `${user.dna.Creativity}/100` 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Motion.div>
    );
  }
);

export default SwipeCard;
