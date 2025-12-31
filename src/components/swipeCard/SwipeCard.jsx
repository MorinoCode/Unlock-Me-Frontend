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
import "./SwipeCard.css";

const SwipeCard = React.forwardRef(
  ({ userSwipe, onSwipe, onCardLeftScreen, actionFeedback, index }, ref) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const audioRef = useRef(null);

    const photos = useMemo(() => {
      return [userSwipe.avatar, ...(userSwipe.gallery || [])].filter(Boolean);
    }, [userSwipe]);

    const displayPhotos = photos.length > 0 ? photos : ["/default-avatar.png"];
    const matchPercentage = userSwipe.matchScore || 0;

    const getTraitDisplay = (textTrait, numericTrait, fallback) => {
      if (textTrait) return textTrait;
      if (numericTrait !== undefined && numericTrait !== null)
        return `${numericTrait}/100`;
      return fallback;
    };

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
        if (onSwipe) onSwipe(dir, userSwipe, index);
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

    useEffect(() => {
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
      };
    }, [userSwipe._id]);

    const handleDragEnd = async (event, info) => {
      const offsetX = info.offset.x;
      const offsetY = info.offset.y;
      const velocity = info.velocity.x;
      const swipeThreshold = 100;

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
        if (onSwipe) onSwipe(dir, userSwipe, index);
        if (onCardLeftScreen) onCardLeftScreen(index);
      } else if (offsetY < -swipeThreshold) {
        await controls.start({
          y: -1000,
          opacity: 0,
          transition: { duration: 0.2 },
        });
        if (onSwipe) onSwipe("up", userSwipe, index);
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
    };

    const handleAudioToggle = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!userSwipe.voiceIntro || !audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    };

    const handleNextPhoto = (e) => {
      e.stopPropagation();
      if (currentPhotoIndex < displayPhotos.length - 1) {
        setCurrentPhotoIndex((prev) => prev + 1);
      }
    };

    const handlePrevPhoto = (e) => {
      e.stopPropagation();
      if (currentPhotoIndex > 0) {
        setCurrentPhotoIndex((prev) => prev - 1);
      }
    };

    return (
      <Motion.div
        className="swipe-card"
        drag={!isFlipped}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
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
            </div>

            <div
              className="swipe-card__touch-zone swipe-card__touch-zone--left"
              onPointerUp={handlePrevPhoto}
              style={{ display: currentPhotoIndex === 0 ? "none" : "block" }}
            ></div>
            <div
              className="swipe-card__touch-zone swipe-card__touch-zone--right"
              onPointerUp={handleNextPhoto}
              style={{
                display:
                  currentPhotoIndex === displayPhotos.length - 1
                    ? "none"
                    : "block",
              }}
            ></div>

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
              🧬 DNA
            </button>

            {/* Info Area */}
            <div className="swipe-card__info">
              <div className="swipe-card__details-overlay">
                <h2 className="swipe-card__name">
                  {userSwipe.username ? userSwipe.usernam : userSwipe.name}{" "}
                  <span className="swipe-card__age">{userSwipe.age}</span>
                </h2>
                {/* ✅ ردیف لوکیشن و ویس روبروی هم */}
                <div className="swipe-card__meta-row">
                  <div className="swipe-card__location">
                    📍 {userSwipe.location?.city || "Unknown"},{" "}
                    {userSwipe.location?.country || "Unknown"}
                  </div>

                  {/* دکمه ویس سمت راست قرار گرفت */}
                  <button
                    className={`swipe-card__voice-btn ${
                      isPlaying ? "swipe-card__voice-btn--playing" : ""
                    }`}
                    onPointerUp={handleAudioToggle}
                    disabled={!userSwipe.voiceIntro}
                  >
                    {isPlaying
                      ? "⏸"
                      : userSwipe.voiceIntro
                      ? "🎤 Voice"
                      : "🎤 No Voice"}
                  </button>
                </div>

                {userSwipe.voiceIntro && (
                  <audio
                    ref={audioRef}
                    src={userSwipe.voiceIntro}
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
              <div className="swipe-card__match-circle">
                <span className="swipe-card__match-percent">
                  {matchPercentage}%
                </span>
                <span className="swipe-card__match-label">Match</span>
              </div>
              <div className="swipe-card__synergy-desc">
                "Strong Synergy with {userSwipe.name}."
              </div>
            </div>

            <div className="swipe-card__dna-grid">
              <div className="swipe-card__dna-item">
                <span className="swipe-card__dna-label">
                  <span className="swipe-card__icon--purple">✦</span> Logic
                </span>
                <span className="swipe-card__dna-value">
                  {getTraitDisplay(
                    userSwipe.dna?.personalityType,
                    userSwipe.dna?.Logic,
                    "Intuitive"
                  )}
                </span>
              </div>
              <div className="swipe-card__dna-item">
                <span className="swipe-card__dna-label">
                  <span className="swipe-card__icon--pink">✦</span> Emotion
                </span>
                <span className="swipe-card__dna-value">
                  {getTraitDisplay(
                    userSwipe.dna?.emotionalType,
                    userSwipe.dna?.Emotion,
                    "High EQ"
                  )}
                </span>
              </div>
              <div className="swipe-card__dna-item">
                <span className="swipe-card__dna-label">
                  <span className="swipe-card__icon--blue">✦</span> Energy
                </span>
                <span className="swipe-card__dna-value">
                  {getTraitDisplay(
                    userSwipe.dna?.dominantTrait,
                    userSwipe.dna?.Energy,
                    "Calm"
                  )}
                </span>
              </div>
              <div className="swipe-card__dna-item">
                <span className="swipe-card__dna-label">
                  <span className="swipe-card__icon--green">✦</span> Passion
                </span>
                <span className="swipe-card__dna-value">
                  {userSwipe.interests?.[0] ||
                    (userSwipe.dna?.Creativity
                      ? `${userSwipe.dna.Creativity}/100`
                      : "General")}
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
