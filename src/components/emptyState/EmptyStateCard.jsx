import React from "react";
import "./EmptyStateCard.css";

const EmptyStateCard = ({ type }) => {
  const isFullWidth = type === "cityMatches";

  const content = {
    soulmates: {
      emoji: "💎",
      title: "No Soulmates Yet?",
      desc: "True love is rare! Invite your friends to join UnlockMe.",
      btnText: "Invite Friends",
      shareText: "Join me on UnlockMe to find our soulmates! 💎"
    },
    cityMatches: { 
      emoji: "🏙️",
      title: "Quiet in Your City?",
      desc: "Be the trendsetter! Tell people in your city about us and fill this space with matches.",
      btnText: "Share with Locals",
      shareText: "Join UnlockMe and let's meet new people in our city! 🏙️"
    },
    interestMatches: {
      emoji: "🎨",
      title: "Unique Vibe?",
      desc: "Your interests are special. Share the app to find your tribe.",
      btnText: "Invite Your Tribe",
      shareText: "I'm using UnlockMe to find people with cool interests. 🎨"
    },
    default: {
      emoji: "🌍",
      title: "Expand the Circle",
      desc: "More users = More matches. Help us grow the community!",
      btnText: "Spread the Word",
      shareText: "Check out UnlockMe! 🌍"
    }
  };

  const data = content[type] || content.default;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
            title: "Join UnlockMe",
            text: data.shareText,
            url: window.location.origin
        });
      } catch (err) { console.log(err); }
    } else {
      alert("Link copied!");
    }
  };

  return (
    <div className={`empty-state-card ${isFullWidth ? "is-full-width" : ""}`}>
      <div className="empty-icon-circle">
        <span className="empty-emoji">{data.emoji}</span>
      </div>
      <h3>{data.title}</h3>
      <p>{data.desc}</p>
      <button className="empty-action-btn" onClick={handleShare}>
        {data.btnText}
      </button>
    </div>
  );
};

export default EmptyStateCard;