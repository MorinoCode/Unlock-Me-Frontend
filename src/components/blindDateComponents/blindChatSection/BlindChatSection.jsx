import React, { useState, useRef, useEffect } from 'react';
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

  const myMessagesCount = session.messages.filter(m => m.sender === currentUser._id).length;
  const isLimitReached = session.currentStage === 3 && myMessagesCount >= 10;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || isLimitReached) return;

    if (socketRef.current) {
      socketRef.current.emit('send_blind_message', {
        sessionId: session._id,
        text: messageText
      });
      setMessageText('');
    }
  };

  return (
    <div className="blind-chat-section">
      <div className="blind-chat-section__messages-container">
        {session.messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`blind-chat-section__message-bubble ${msg.sender === currentUser._id ? 'blind-chat-section__message-bubble--me' : 'blind-chat-section__message-bubble--partner'}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="blind-chat-section__input-area" onSubmit={handleSendMessage}>
        {session.currentStage === 3 && (
          <div className="blind-chat-section__counter">
            {10 - myMessagesCount} messages left
          </div>
        )}
        <input 
          type="text" 
          className="blind-chat-section__input"
          placeholder={isLimitReached ? "Limit reached" : "Type a message..."}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={isLimitReached}
        />
        <button 
          type="submit" 
          className="blind-chat-section__send-btn"
          disabled={!messageText.trim() || isLimitReached}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default BlindChatSection;