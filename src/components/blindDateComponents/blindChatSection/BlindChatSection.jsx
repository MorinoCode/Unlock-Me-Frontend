import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./BlindChatSection.css";

const BlindChatSection = ({ session, currentUser, socketRef }) => {
  const { t } = useTranslation();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    if (socketRef.current) {
      socketRef.current.emit("send_blind_message", {
        sessionId: session._id,
        text: messageText,
      });
      setMessageText("");
    }
  };

  const myMessagesCount = session.messages.filter(
    (m) => m.sender === currentUser._id
  ).length;
  const isLimitReached = session.currentStage === 3 && myMessagesCount >= 5;

  return (
    <div className="blind-chat-section">
      <div className="blind-chat-section__messages">
        {session.messages.length === 0 ? (
          <p className="blind-chat-section__empty">
            {t("blindDate.startConversation")}
          </p>
        ) : (
          session.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`blind-chat-section__bubble ${
                msg.sender === currentUser._id
                  ? "blind-chat-section__bubble--me"
                  : "blind-chat-section__bubble--partner"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="blind-chat-section__form" onSubmit={handleSendMessage}>
        <input
          className="blind-chat-section__input"
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={isLimitReached ? t("chat.limitReached") : t("chat.typeMessage")}
          disabled={isLimitReached}
        />
        <button
          className="blind-chat-section__send-btn"
          type="submit"
          disabled={!messageText.trim() || isLimitReached}
        >
          {t("blindDate.send")}
        </button>
      </form>

      {session.currentStage === 3 && (
        <span className="blind-chat-section__limit-info">
          {t("blindDate.messagesLeft", { count: 5 - myMessagesCount })}
        </span>
      )}
    </div>
  );
};

export default BlindChatSection;
