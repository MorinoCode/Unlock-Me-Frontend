import React, { useState } from "react";
import { MapPin, Calendar, DollarSign, Trash2 } from "lucide-react"; // آیکون Trash2
import { useNavigate } from "react-router-dom"; // برای نویگیشن

const GoDateCard = ({ date, isOwner, onApply, onAccept, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'coffee': return '☕';
      case 'food': return '🍽️';
      case 'drink': return '🍷';
      case 'movie': return '🎬';
      case 'activity': return '🏃';
      default: return '📅';
    }
  };

  const handleApplyClick = async () => {
    setLoading(true);
    await onApply(date._id);
    setLoading(false);
  };

  const handleAcceptClick = async (applicantId) => {
    if(!window.confirm("Accept this person? A chat will be opened.")) return;
    setLoading(true);
    await onAccept(date._id, applicantId);
    setLoading(false);
  };

  // ✅ Profile Navigation Handler
  const handleProfileClick = (userId) => {
      navigate(`/user-profile/${userId}`);
  };

  return (
    <div className="go-date-card">
      <div 
        className={`go-date-card__header ${!date.image ? 'go-date-card__header--no-img' : ''}`}
        style={date.image ? { backgroundImage: `url(${date.image})` } : {}}
      >
        <div className="go-date-card__category-badge">
          {getCategoryIcon(date.category)} {date.category}
        </div>
        
        {/* ✅ DELETE BUTTON (Only for Owner) */}
        {isOwner && (
            <button 
                className="go-date-card__delete-btn"
                onClick={(e) => { e.stopPropagation(); onDelete(date._id); }}
                title="Delete Date"
            >
                <Trash2 size={16} color="white" />
            </button>
        )}
      </div>

      <div className="go-date-card__body">
        <h3 className="go-date-card__title">{date.title}</h3>
        
        <div className="go-date-card__info-row">
          <Calendar size={14} /> {formatDate(date.dateTime)}
        </div>
        <div className="go-date-card__info-row">
          <MapPin size={14} /> {date.location?.city} - {date.location?.generalArea}
        </div>
        
        <div className="go-date-card__payment-pill">
          <DollarSign size={12} style={{display:'inline'}}/> 
          {date.paymentType === 'me' ? 'I pay' : date.paymentType === 'you' ? 'You pay' : 'Split 50/50'}
        </div>

        {!isOwner && (
            <div 
                style={{marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}
                onClick={() => handleProfileClick(date.creator?._id)} // ✅ Clickable Creator
            >
                <img src={date.creator?.avatar || '/default-avatar.png'} alt="creator" style={{width: 24, height: 24, borderRadius: '50%'}} />
                <span style={{fontSize: '0.85rem', color: '#64748b'}}>{date.creator?.name}, {date.creator?.age}</span>
            </div>
        )}
      </div>

      <div className="go-date-card__footer">
        {isOwner ? (
            <div style={{width: '100%'}}>
                <div style={{fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px'}}>
                    Applicants ({date.applicants?.length || 0})
                </div>
                {date.applicants?.length > 0 ? (
                    <div className="go-date-card__applicants">
                        {date.applicants.map(app => (
                            <div key={app._id} className="go-date-card__applicant-item">
                                <div 
                                    className="go-date-card__user-info"
                                    onClick={() => handleProfileClick(app._id)} // ✅ Clickable Applicant
                                    style={{cursor: 'pointer'}}
                                >
                                    <img src={app.avatar} className="go-date-card__avatar" alt={app.name}/>
                                    <div>
                                        <div style={{fontWeight: 'bold', fontSize: '0.9rem'}}>{app.name}, {app.age}</div>
                                    </div>
                                </div>
                                <button 
                                    className="go-date-card__accept-btn"
                                    onClick={() => handleAcceptClick(app._id)}
                                    disabled={loading}
                                >
                                    Accept
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <span style={{color: '#94a3b8', fontSize: '0.85rem'}}>No requests yet.</span>
                )}
            </div>
        ) : (
            <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <span style={{fontSize: '0.8rem', color: '#94a3b8'}}>
                  {date.hasApplied ? "Request Sent" : "Interested?"}
               </span>
               <button 
                 className="go-date-card__btn"
                 onClick={handleApplyClick}
                 disabled={date.hasApplied || loading}
               >
                 {date.hasApplied ? "Pending..." : "I'm In! ✋"}
               </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default GoDateCard;