import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import ExploreBackgroundLayout from '../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout';
import SwipeCard from '../../components/swipeCard/SwipeCard';
import PromoBanner from '../../components/promoBanner/PromoBanner'; 
import './SwipePage.css';
import HeartbeatLoader from '../../components/heartbeatLoader/HeartbeatLoader';
import { useNavigate } from 'react-router-dom';

const SwipePage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);
  const [matchModal, setMatchModal] = useState(null); 
  const [feedback, setFeedback] = useState(null); 
  const [icebreakerUser, setIcebreakerUser] = useState(null);

  const [topIndex, setTopIndex] = useState(-1);
  const topIndexRef = useRef(-1); 
  const childRefs = useMemo(
    () => Array(users.length).fill(0).map(() => React.createRef()),
    [users.length]
  );

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { currentUser } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => { topIndexRef.current = topIndex; }, [topIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showUpsell || matchModal || icebreakerUser) return;
      switch(e.key) {
        case 'ArrowLeft': triggerSwipe('left'); break;
        case 'ArrowRight': triggerSwipe('right'); break;
        case 'ArrowUp': triggerSwipe('up'); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUpsell, matchModal, icebreakerUser, users]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/swipe/cards`, { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
        setTopIndex(data.length - 1);
        topIndexRef.current = data.length - 1;
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCards(); }, []);

  const handleSwipe = async (direction, user, index) => {
    setFeedback(direction);
    setTimeout(() => setFeedback(null), 450);

    const userPlan = currentUser?.subscription?.plan || "free";
    const isPositive = direction === 'right' || direction === 'up';
    if (isPositive && user.isPremiumCandidate && userPlan === 'free') {
      if(childRefs[index]?.current?.restoreCard) {
        await childRefs[index].current.restoreCard();
      }
      setShowUpsell(true);
      return; 
    }

    try {
      const res = await fetch(`${API_URL}/api/swipe/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user._id, action: direction }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.isMatch) setMatchModal(data.matchDetails);
    } catch (err) { console.error(err); }
  };

  const handleCardLeftScreen = (index) => {
    setUsers(prev => {
      const next = prev.filter((_, i) => i !== index);
      const newTop = next.length - 1;
      setTopIndex(newTop);
      topIndexRef.current = newTop;
      return next;
    });
  };

  const triggerSwipe = async (dir) => {
    const idx = topIndexRef.current;
    if (idx >= 0 && idx < users.length) {
       if (childRefs[idx]?.current?.swipe) await childRefs[idx].current.swipe(dir);
    }
  };

  const handleChatClick = () => {
    const idx = topIndexRef.current;
    if (idx >= 0 && idx < users.length) {
        setIcebreakerUser(users[idx]);
    }
  };

  const proceedToChat = () => {
    if (icebreakerUser) {
        navigate(`/chat/${icebreakerUser._id}`);
    }
  };

  if (loading) return <HeartbeatLoader/>;

  return (
    <ExploreBackgroundLayout>
      <div className="swipe-page">
        
        <div className="swipe-page__card-container">
          {users.map((user, index) => (
            <SwipeCard
              ref={childRefs[index]}
              key={user._id}
              user={user}
              index={index}
              actionFeedback={index === topIndex ? feedback : null}
              onSwipe={(dir) => handleSwipe(dir, user, index)}
              onCardLeftScreen={(idx) => handleCardLeftScreen(idx)} 
            />
          ))}

          {users.length === 0 && !loading && (
             <div className="empty-state">
                <h2>That's everyone!</h2>
                <button onClick={fetchCards} style={{padding:'12px 24px', borderRadius:30, marginTop:20, cursor:'pointer', border:'none', background:'#2563eb', color:'white', fontWeight:'bold'}}>Refresh</button>
             </div>
          )}
        </div>

        <div className="swipe-page__actions">
            <button className="action-btn-circle btn-nope" onClick={() => triggerSwipe('left')}>👎</button>
            <button className="action-btn-pill" onClick={() => triggerSwipe('up')}>⭐ Super Like</button>
            <button className="action-btn-circle btn-chat-page" onClick={handleChatClick}>💬</button>
            <button className="action-btn-circle btn-like" onClick={() => triggerSwipe('right')}>❤️</button>
        </div>

        {icebreakerUser && (
            <div className="swipe-page__modal-overlay">
                <div className="icebreaker-modal">
                    <h3>🧊 Icebreaker</h3>
                    <p>"{icebreakerUser.icebreaker || `Ask about ${icebreakerUser.name}'s bio!`}"</p>
                    <div className="icebreaker-modal-actions">
                        <button className="btn-cancel" onClick={() => setIcebreakerUser(null)}>Cancel</button>
                        <button className="btn-proceed" onClick={proceedToChat}>Start Chat</button>
                    </div>
                </div>
            </div>
        )}

        {showUpsell && (
           <div className="swipe-page__modal-overlay">
             <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
               <PromoBanner 
                 title="Premium Match! 💎"
                 desc="Upgrade to Gold to match instantly with this top-tier profile."
                 btnText="Upgrade Now"
                 onClick={() => { window.location.href = '/upgrade'; }}
                 onClose={() => setShowUpsell(false)}
               />
               <button className="swipe-page__modal-close" onClick={() => setShowUpsell(false)}>Maybe later</button>
             </div>
           </div>
        )}
        
        {matchModal && (
          <div className="swipe-page__modal-overlay">
             <div className="match-modal">
                 <h1>It's a Match! 🎉</h1>
                 <p>You matched with {matchModal.name}</p>
                 <button onClick={() => setMatchModal(null)}>Keep Swiping</button>
             </div>
          </div>
        )}

      </div>
    </ExploreBackgroundLayout>
  );
};

export default SwipePage;