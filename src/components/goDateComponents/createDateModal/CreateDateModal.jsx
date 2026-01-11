import React, { useState } from "react";
import { X } from "lucide-react";

const CreateDateModal = ({ onClose, onCreate, loading }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "coffee",
    dateTime: "",
    city: "",
    generalArea: "",
    exactAddress: "",
    paymentType: "split",
    description: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="go-date-modal-overlay" onClick={onClose}>
      <div className="go-date-modal" onClick={e => e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom: '20px'}}>
            <h2>Create New Date</h2>
            <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer'}}><X /></button>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="go-date-form-group">
                <label className="go-date-label">I want to go for...</label>
                <select name="category" className="go-date-select" value={formData.category} onChange={handleChange}>
                    <option value="coffee">☕ Coffee</option>
                    <option value="food">🍽️ Food</option>
                    <option value="drink">🍷 Drinks</option>
                    <option value="movie">🎬 Movie</option>
                    <option value="activity">🏃 Activity</option>
                </select>
            </div>

            <div className="go-date-form-group">
                <label className="go-date-label">Title (Keep it short)</label>
                <input required name="title" className="go-date-input" placeholder="e.g. Weekend Coffee at Valiasr" value={formData.title} onChange={handleChange}/>
            </div>

            <div className="go-date-form-group">
                <label className="go-date-label">When?</label>
                <input required type="datetime-local" name="dateTime" className="go-date-input" value={formData.dateTime} onChange={handleChange}/>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <div className="go-date-form-group">
                    <label className="go-date-label">City</label>
                    <input required name="city" className="go-date-input" placeholder="Tehran" value={formData.city} onChange={handleChange}/>
                </div>
                <div className="go-date-form-group">
                    <label className="go-date-label">Area (Public)</label>
                    <input required name="generalArea" className="go-date-input" placeholder="Jordan" value={formData.generalArea} onChange={handleChange}/>
                </div>
            </div>

            <div className="go-date-form-group">
                <label className="go-date-label">Exact Address (Private - Only for match)</label>
                <input required name="exactAddress" className="go-date-input" placeholder="Cafe X, Street Y, No 10" value={formData.exactAddress} onChange={handleChange}/>
            </div>

            <div className="go-date-form-group">
                <label className="go-date-label">Who pays?</label>
                <select name="paymentType" className="go-date-select" value={formData.paymentType} onChange={handleChange}>
                    <option value="split">Split 50/50</option>
                    <option value="me">I'll pay</option>
                    <option value="you">You pay</option>
                </select>
            </div>

            <button type="submit" className="go-date-submit-btn" disabled={loading}>
                {loading ? "Creating..." : "Post Date Invites"}
            </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDateModal;