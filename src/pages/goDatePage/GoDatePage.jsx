import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GoDateCard from "../../components/goDateComponents/goDateCard/GoDateCard";
import CreateDateModal from "../../components/goDateComponents/createDateModal/CreateDateModal";
import SubscriptionModal from "../../components/modals/subscriptionModal/SubscriptionModal";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
// import { getGoDateConfig } from "../../utils/subscriptionRules";
import { useAuth } from "../../context/useAuth.js";
import toast from "react-hot-toast";
import "./GoDatePage.css";

const GoDatePage = () => {
  const [activeTab, setActiveTab] = useState("browse"); // 'browse' or 'mine'
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  // Subscription Limit States
  const [showSubModal, setShowSubModal] = useState(false);
  const [limitMsg, setLimitMsg] = useState("");

  const { currentUser } = useAuth();
  console.log(currentUser);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // --- 1. Fetch Dates ---
  const fetchDates = useCallback(async () => {
    setLoading(true);
    try {
        const endpoint = activeTab === 'browse' ? '/api/go-date/all' : '/api/go-date/mine';
        const res = await fetch(`${API_URL}${endpoint}`, { credentials: 'include' });
        const data = await res.json();
        if (Array.isArray(data)) setDates(data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  }, [activeTab, API_URL]);

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
            setActiveTab('mine'); // Switch to see my new date
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
            // Update local state to show 'Pending'
            setDates(prev => prev.map(d => d._id === dateId ? {...d, hasApplied: true} : d));
        } else {
            const data = await res.json();
            toast.error(data.error || "Error applying");
        }
    } catch (err) {
        toast.error("Connection error")
        console.log(err);;
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
            // Redirect to the new chat
            if (data.chatRuleId) {
                navigate(`/chat/${applicantId}`); // Or verify if chat ID or User ID is needed for route
            }
        } else {
            toast.error("Failed to accept");
        }
    } catch (err) {
        console.error(err);
    }
  };

  // Check plan for FAB label (optional)
//   const config = getGoDateConfig(currentUser?.subscription?.plan);

  return (
    <ExploreBackgroundLayout>
      <div className="go-date-page">
        
        {/* Header */}
        <div className="go-date-header">
            <h1 className="go-date-title">Go Date 📅</h1>
            <div className="go-date-tabs">
                <button 
                    className={`go-date-tab ${activeTab === 'browse' ? 'go-date-tab--active' : ''}`}
                    onClick={() => setActiveTab('browse')}
                >
                    Browse Dates
                </button>
                <button 
                    className={`go-date-tab ${activeTab === 'mine' ? 'go-date-tab--active' : ''}`}
                    onClick={() => setActiveTab('mine')}
                >
                    My Plans
                </button>
            </div>
        </div>

        {/* Content Grid */}
        <div className="go-date-grid">
            {loading ? (
                <p>Loading dates...</p>
            ) : dates.length === 0 ? (
                <div style={{gridColumn:'1/-1', textAlign:'center', marginTop:'50px', color:'#64748b'}}>
                    {activeTab === 'browse' ? (
                        <p>No open dates found in your area. Be the first to create one!</p>
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
                    />
                ))
            )}
        </div>

        {/* Floating Create Button */}
        <button className="go-date-fab" onClick={() => setShowCreate(true)}>
            <Plus />
        </button>

        {/* Modals */}
        {showCreate && (
            <CreateDateModal 
                onClose={() => setShowCreate(false)}
                onCreate={handleCreateDate}
                loading={loading && showCreate} // simple loading logic
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