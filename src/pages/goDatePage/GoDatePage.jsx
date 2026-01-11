import React, { useState, useEffect, useCallback } from "react";
import { Plus, Filter, X } from "lucide-react"; // آیکون‌های جدید
import { useNavigate } from "react-router-dom";
import GoDateCard from "../../components/goDateComponents/goDateCard/GoDateCard";
import CreateDateModal from "../../components/goDateComponents/createDateModal/CreateDateModal";
import SubscriptionModal from "../../components/modals/subscriptionModal/SubscriptionModal";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import { useAuth } from "../../context/useAuth.js";
import toast from "react-hot-toast";
import "./GoDatePage.css";

const GoDatePage = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  // --- Filters State ✅ ---
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCity, setFilterCity] = useState("");
  
  const [showSubModal, setShowSubModal] = useState(false);
  const [limitMsg, setLimitMsg] = useState("");

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // --- 1. Fetch Dates (With Filters) ---
  const fetchDates = useCallback(async () => {
    setLoading(true);
    try {
        let endpoint = activeTab === 'browse' ? '/api/go-date/all' : '/api/go-date/mine';
        
        // ارسال فیلترها به بک‌اند برای تب Browse
        if (activeTab === 'browse') {
             const params = new URLSearchParams();
             if (filterCity) params.append('city', filterCity);
             if (filterCategory && filterCategory !== 'all') params.append('category', filterCategory);
             endpoint += `?${params.toString()}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, { credentials: 'include' });
        const data = await res.json();
        
        if (Array.isArray(data)) setDates(data);
        else setDates([]);

    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  }, [activeTab, API_URL, filterCity, filterCategory]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  // --- 2. Create Date Handler ---
  const handleCreateDate = async (formData) => {
    try {
        const res = await fetch(`${API_URL}/api/go-date/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });

        if (res.status === 403) {
            const data = await res.json();
            setLimitMsg(data.message || "Limit reached");
            setShowCreate(false);
            setShowSubModal(true);
            return;
        }

        if (res.ok) {
            toast.success("Date Created Successfully!");
            setShowCreate(false);
            setActiveTab('mine'); 
            fetchDates();
        } else {
            toast.error("Failed to create date");
        }
    } catch (err) {
        console.error(err);
    }
  };

  // --- 3. Apply Handler ---
  const handleApply = async (dateId) => {
    try {
        const res = await fetch(`${API_URL}/api/go-date/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dateId }),
            credentials: 'include'
        });
        if (res.ok) {
            toast.success("Request Sent!");
            setDates(prev => prev.map(d => d._id === dateId ? {...d, hasApplied: true} : d));
        } else {
            const data = await res.json();
            toast.error(data.error || "Error applying");
        }
    } catch (err) {
        toast.error("Connection error");
    }
  };

  // --- 4. Accept Handler ---
  const handleAccept = async (dateId, applicantId) => {
    try {
        const res = await fetch(`${API_URL}/api/go-date/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dateId, applicantId }),
            credentials: 'include'
        });
        
        if (res.ok) {
            const data = await res.json();
            toast.success("Match Created! Redirecting to chat...");
            if (data.chatRuleId) {
                navigate(`/chat/${applicantId}`);
            }
        } else {
            toast.error("Failed to accept");
        }
    } catch (err) {
        console.error(err);
    }
  };

  // --- 5. Delete Handler ✅ ---
  const handleDelete = async (dateId) => {
      if(!window.confirm("Are you sure you want to cancel this date?")) return;
      
      try {
        const res = await fetch(`${API_URL}/api/go-date/${dateId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (res.ok) {
            toast.success("Date deleted");
            setDates(prev => prev.filter(d => d._id !== dateId));
        } else {
            toast.error("Failed to delete");
        }
      } catch (err) {
          console.error(err);
      }
  };

  return (
    <ExploreBackgroundLayout>
      <div className="go-date-page">
        
        {/* Header */}
        <div className="go-date-header">
            <div className="go-date-title"><h1 className="go-date-title-heading">Go Date</h1> <span className="go-date-title-icon"> 📅</span></div>
            <div className="go-date-tabs">
                <button 
                    className={`go-date-tab ${activeTab === 'browse' ? 'go-date-tab--active' : ''}`}
                    onClick={() => setActiveTab('browse')}
                >
                    Browse
                </button>
                <button 
                    className={`go-date-tab ${activeTab === 'mine' ? 'go-date-tab--active' : ''}`}
                    onClick={() => setActiveTab('mine')}
                >
                    My Plans
                </button>
            </div>
        </div>

        {/* --- Filters Area (Only on Browse) ✅ --- */}
        {activeTab === 'browse' && (
            <div className="go-date-filters">
                <div className="go-date-filter-item">
                    <Filter size={16} />
                    <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="go-date-filter-select"
                    >
                        <option value="all">All Categories</option>
                        <option value="coffee">☕ Coffee</option>
                        <option value="food">🍽️ Food</option>
                        <option value="drink">🍷 Drink</option>
                        <option value="movie">🎬 Movie</option>
                        <option value="activity">🏃 Activity</option>
                    </select>
                </div>
                
                <div className="go-date-filter-item">
                    <input 
                        type="text" 
                        placeholder="City..." 
                        value={filterCity}
                        onChange={(e) => setFilterCity(e.target.value)}
                        className="go-date-filter-input"
                    />
                    {filterCity && <button onClick={() => setFilterCity("")}><X size={14}/></button>}
                </div>
            </div>
        )}

        {/* Content Grid */}
        <div className="go-date-grid">
            {loading ? (
                <p>Loading dates...</p>
            ) : dates.length === 0 ? (
                <div style={{gridColumn:'1/-1', textAlign:'center', marginTop:'50px', color:'#64748b'}}>
                    {activeTab === 'browse' ? (
                        <p>No open dates found. Try changing filters or create one!</p>
                    ) : (
                        <p>You haven't planned any dates yet.</p>
                    )}
                </div>
            ) : (
                dates.map(date => (
                    <GoDateCard 
                        key={date._id} 
                        date={date} 
                        isOwner={activeTab === 'mine'} 
                        onApply={handleApply}
                        onAccept={handleAccept}
                        onDelete={handleDelete} // پاس دادن تابع حذف
                    />
                ))
            )}
        </div>

        <button className="go-date-fab" onClick={() => setShowCreate(true)}>
            <Plus />
        </button>

        {showCreate && (
            <CreateDateModal 
                onClose={() => setShowCreate(false)}
                onCreate={handleCreateDate}
                loading={loading && showCreate} 
            />
        )}

        {showSubModal && (
            <SubscriptionModal 
                onClose={() => setShowSubModal(false)}
                message={limitMsg}
            />
        )}

      </div>
    </ExploreBackgroundLayout>
  );
};

export default GoDatePage;