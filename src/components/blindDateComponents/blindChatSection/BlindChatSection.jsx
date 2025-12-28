import React, { useState, useEffect, useRef } from 'react';
import './BlindChatSection.css';

const BlindChatSection = ({ session, currentUser, socketRef }) => {
  const [messageText, setMessageText] = useState('');
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
      socketRef.current.emit('send_blind_message', {
        sessionId: session._id,
        text: messageText
      });
      setMessageText('');
    }
  };

  const myMessagesCount = session.messages.filter(m => m.sender === currentUser._id).length;
  const isLimitReached = session.currentStage === 3 && myMessagesCount >= 10;

  return (
    <div className="blind-chat-section">
      <div className="blind-chat-section__messages">
        {session.messages.length === 0 ? (
          <p className="blind-chat-section__empty">Start the conversation...</p>
        ) : (
          session.messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`blind-chat-section__bubble ${
                msg.sender === currentUser._id ? 'blind-chat-section__bubble--me' : 'blind-chat-section__bubble--partner'
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
          placeholder={isLimitReached ? "Limit reached" : "Type a message..."}
          disabled={isLimitReached}
        />
        <button 
          className="blind-chat-section__send-btn" 
          type="submit"
          disabled={!messageText.trim() || isLimitReached}
        >
          Send
        </button>
      </form>
      
      {session.currentStage === 3 && (
        <span className="blind-chat-section__limit-info">
          {10 - myMessagesCount} messages left
        </span>
      )}
    </div>
  );
};

export default BlindChatSection;