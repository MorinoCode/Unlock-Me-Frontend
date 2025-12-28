import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
// import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { currentUser, checkAuth } = useAuth();
  // const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const [allInterestOptions, setAllInterestOptions] = useState([]);
  const [isAddingInterest, setIsAddingInterest] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState(null);

  const [selectedNewCat, setSelectedNewCat] = useState("");
  const [newCatQuestions, setNewCatQuestions] = useState([]);
  const [newAnswers, setNewAnswers] = useState({});

  const [formData, setFormData] = useState({
    name: "", bio: "", phone: "", country: "", city: "", countryCode: "",
    avatar: "", gallery: [], gender: "Male", lookingFor: "Female",
    birthday: { day: "", month: "", year: "" },
    subscription: { plan: "free" },
    categories: {} 
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: ""
  });

  const [availableLocations, setAvailableLocations] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`${API_URL}/api/locations`);
        if (res.ok) {
          const data = await res.json();
          setAvailableLocations(data);
        }
      } catch (err) { console.error(err); }
    };
    fetchLocations();
  }, [API_URL]);

  useEffect(() => {
    if (formData.countryCode && availableLocations.length > 0) {
      const selectedLocation = availableLocations.find(l => l.countryCode === formData.countryCode);
      setCities(selectedLocation ? selectedLocation.cities : []);
    } else {
      setCities([]);
    }
  }, [formData.countryCode, availableLocations]);

  useEffect(() => {
    const fetchFullProfile = async () => {
      if (!currentUser?._id) return;
      try {
        const res = await fetch(`${API_URL}/api/user/user/${currentUser._id}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const serverCountry = data.location?.country || data.country || "";
          const serverCity = data.location?.city || data.city || "";
          
          setFormData({
            name: data.name || "",
            bio: data.bio || "",
            phone: data.phone || "",
            country: serverCountry,
            countryCode: data.location?.countryCode || data.countryCode || "",
            city: serverCity,
            avatar: data.avatar || "",
            gallery: data.gallery || [],
            gender: data.gender || "Male",
            lookingFor: data.lookingFor || "Female",
            birthday: (data.birthday && data.birthday.year) ? data.birthday : { day: "", month: "", year: "" },
            subscription: data.subscription || { plan: "free" },
            categories: data.questionsbycategoriesResults?.categories || {}
          });
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchFullProfile();
  }, [currentUser, API_URL]);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setShowCropper(true); 
      });
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = ''; 
    }
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return canvas.toDataURL("image/jpeg"); 
  };

  const handleConfirmCrop = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      setFormData({ ...formData, avatar: croppedImageBase64 });
      setShowCropper(false);
    } catch (e) { console.error(e); }
  };

  const closeCropper = () => {
    setShowCropper(false);
    setImageSrc(null);
  };

  const fetchAllInterestOptions = async () => {
    setEditingCategory(null);
    try {
      const res = await fetch(`${API_URL}/api/user/onboarding/interests-options`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAllInterestOptions(data);
        setIsAddingInterest(true);
        setSelectedNewCat("");
        setNewCatQuestions([]);
        setNewAnswers({});
      }
    } catch (err) { console.error(err); }
  };

  const handleCategorySelect = async (categoryName) => {
    setSelectedNewCat(categoryName);
    if (!categoryName) return setNewCatQuestions([]);
    fetchQuestionsForCategory(categoryName);
  };

  const fetchQuestionsForCategory = async (categoryName) => {
    try {
      const res = await fetch(`${API_URL}/api/user/onboarding/questions-by-category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ selectedCategories: [categoryName] })
      });
      if (res.ok) {
        const data = await res.json();
        setNewCatQuestions(data);
        return data;
      }
    } catch (err) { console.error(err); }
    return [];
  };

  const handleStartEdit = async (catName) => {
    if (editingCategory === catName) {
      setEditingCategory(null);
      return;
    }
    
    setIsAddingInterest(false);
    setEditingCategory(catName);
    setNewAnswers({});

    const loadingToast = toast.loading('Loading questions...');
    
    const questionsData = await fetchQuestionsForCategory(catName);
    
    const existingAnswers = formData.categories[catName] || [];
    const preFilledAnswers = {};

    if (questionsData && questionsData.length > 0 && questionsData[0].questions) {
      questionsData[0].questions.forEach(q => {
        const found = existingAnswers.find(ans => ans.questionText === q.questionText);
        if (found) {
          preFilledAnswers[q._id] = {
            category: catName,
            questionText: q.questionText,
            selectedText: found.selectedText || found.answer,
            trait: found.trait
          };
        }
      });
    }
    setNewAnswers(preFilledAnswers);
    toast.dismiss(loadingToast);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewAnswers({});
    setNewCatQuestions([]);
  };

  const submitInterest = async (categoryName) => {
    const quizResults = Object.values(newAnswers).map(ans => ({
      category: categoryName,
      questionText: ans.questionText,
      selectedText: ans.selectedText,
      trait: ans.trait
    }));

    const totalQuestions = newCatQuestions[0]?.questions?.length || 0;
    if (quizResults.length < totalQuestions) {
      return toast.error("Please answer all questions first!");
    }

    setIsSaving(true);
    const loadingToast = toast.loading('Saving answers...');

    try {
      const res = await fetch(`${API_URL}/api/user/onboarding/saveUserInterestCategoriesQuestinsAnswer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quizResults })
      });
      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success("Interest updated successfully! ✨");
        window.location.reload(); 
      }
    } catch (err) { 
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Failed to save changes.");
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleBirthdayChange = (e) => {
    const { name, value } = e.target;
    if (value !== "" && !/^\d+$/.test(value)) return;
    setFormData(prev => ({ ...prev, birthday: { ...prev.birthday, [name]: value } }));
  };

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading('Updating profile...');
    try {
      const res = await fetch(`${API_URL}/api/user/profile/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.dismiss(loadingToast); 
        toast.success("Profile updated! ✨"); 
        checkAuth(); 
      }
    } catch (err) { 
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Something went wrong.");
    } finally { setIsSaving(false); }
  };

  const handleSaveGallery = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading('Updating gallery...');
    try {
      const res = await fetch(`${API_URL}/api/user/profile/gallery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ images: formData.gallery })
      });
      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success("Gallery updated! 🖼️");
      }
    } catch (err) { 
      console.error(err); 
      toast.dismiss(loadingToast);
      toast.error("Failed to update gallery.");
    } finally { setIsSaving(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    
    const loadingToast = toast.loading('Changing password...');

    try {
      const res = await fetch(`${API_URL}/api/user/profile/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(passwordData),
      });
      
      toast.dismiss(loadingToast);
      
      if (res.ok) {
        toast.success("Password changed successfully! 🔒");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to update password.");
      }
    } catch (err) { 
      console.error(err); 
      toast.dismiss(loadingToast);
      toast.error("Server error.");
    }
  };

  if (loading) return (
    <div className="profile-page__loading">
      <div className="profile-page__spinner"></div>
    </div>
  );

  return (
    <div className="profile-page">
      {showCropper && (
        <div className="profile-page__cropper-modal">
          <div className="profile-page__cropper-content">
            <div className="profile-page__cropper-area">
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div className="profile-page__cropper-controls">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="profile-page__cropper-slider" />
              <div className="profile-page__cropper-actions">
                <button className="profile-page__btn profile-page__btn--secondary" onClick={closeCropper}>Cancel</button>
                <button className="profile-page__btn profile-page__btn--primary" onClick={handleConfirmCrop}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="profile-page__layout">
        <aside className="profile-page__sidebar">
          <div className="profile-page__avatar-wrapper">
            <img src={formData.avatar || "/default-avatar.png"} alt="User" className="profile-page__avatar-img" />
            <label className="profile-page__upload-label">
              📷 <input type="file" hidden accept="image/*" onChange={onFileChange} />
            </label>
          </div>
          <h3 className="profile-page__name">{formData.name}</h3>
          <span className={`profile-page__badge profile-page__badge--${formData.subscription.plan.toLowerCase()}`}>
            {formData.subscription.plan}
          </span>
          <div className="profile-page__nav">
             <button className={`profile-page__nav-btn ${activeTab === "general" ? "profile-page__nav-btn--active" : ""}`} onClick={() => setActiveTab("general")}>👤 General Info</button>
             <button className={`profile-page__nav-btn ${activeTab === "gallery" ? "profile-page__nav-btn--active" : ""}`} onClick={() => setActiveTab("gallery")}>🖼️ Photo Gallery</button>
             <button className={`profile-page__nav-btn ${activeTab === "categories" ? "profile-page__nav-btn--active" : ""}`} onClick={() => setActiveTab("categories")}>📋 Interests</button>
             <button className={`profile-page__nav-btn ${activeTab === "security" ? "profile-page__nav-btn--active" : ""}`} onClick={() => setActiveTab("security")}>🔒 Security</button>
          </div>
        </aside>

        <main className="profile-page__content">
          {activeTab === "general" && (
            <div className="profile-page__section">
              <h2 className="profile-page__section-title">Matching & Personal Info</h2>
              <div className="profile-page__form">
                <div className="profile-page__form-group">
                  <label className="profile-page__label">Full Name*</label>
                  <input className="profile-page__input" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} />
                </div>
                <div className="profile-page__form-group">
                  <label className="profile-page__label">Phone</label>
                  <input className="profile-page__input" value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} />
                </div>
                
                <div className="profile-page__form-group">
                  <label className="profile-page__label">Country*</label>
                  <select className="profile-page__select" value={formData.country} onChange={(e)=> {
                    const selected = availableLocations.find(c => c.country === e.target.value);
                    setFormData({...formData, country: e.target.value, countryCode: selected?.countryCode || "", city: ""});
                  }}>
                    <option value="">Select Country</option>
                    {availableLocations.map(loc => (
                      <option key={loc.countryCode} value={loc.country}>
                        {loc.countryCode === "SE" ? "🇸🇪" : "🏳️"} {loc.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="profile-page__form-group">
                  <label className="profile-page__label">City*</label>
                  <select className="profile-page__select" value={formData.city} onChange={(e)=>setFormData({...formData, city: e.target.value})} disabled={!formData.countryCode}>
                    <option value="">Select City</option>
                    {cities.map((cityName, i) => (
                      <option key={i} value={cityName}>{cityName}</option>
                    ))}
                  </select>
                </div>

                <div className="profile-page__form-group profile-page__form-group--full">
                  <label className="profile-page__label">Birthday*</label>
                  <div className="profile-page__form-row">
                    <input className="profile-page__input profile-page__input--small" placeholder="DD" name="day" value={formData.birthday.day} onChange={handleBirthdayChange} />
                    <input className="profile-page__input profile-page__input--small" placeholder="MM" name="month" value={formData.birthday.month} onChange={handleBirthdayChange} />
                    <input className="profile-page__input profile-page__input--small" placeholder="YYYY" name="year" value={formData.birthday.year} onChange={handleBirthdayChange} />
                  </div>
                </div>
                <div className="profile-page__form-group profile-page__form-group--full">
                  <label className="profile-page__label">Bio</label>
                  <textarea className="profile-page__textarea" rows="4" value={formData.bio} onChange={(e)=>setFormData({...formData, bio:e.target.value})} />
                </div>
              </div>
              <button className="profile-page__btn profile-page__btn--primary" onClick={handleSaveGeneral} disabled={isSaving}>Save Changes</button>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="profile-page__section">
              <h2 className="profile-page__section-title">Photo Gallery</h2>
              <div className="profile-page__gallery">
                {formData.gallery.map((img, i) => (
                  <div key={i} className="profile-page__gallery-item">
                    <img src={img} alt="" className="profile-page__gallery-img" />
                    <button className="profile-page__gallery-remove" onClick={() => setFormData({...formData, gallery: formData.gallery.filter((_, idx) => idx !== i)})}>×</button>
                  </div>
                ))}
                {formData.gallery.length < 6 && (
                  <label className="profile-page__gallery-add">
                    <span>+ Add Photo</span>
                    <input type="file" hidden accept="image/*" onChange={(e) => {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({...formData, gallery: [...formData.gallery, reader.result]});
                      reader.readAsDataURL(e.target.files[0]);
                    }} />
                  </label>
                )}
              </div>
              <button className="profile-page__btn profile-page__btn--primary" onClick={handleSaveGallery}>Update Gallery</button>
            </div>
          )}

          {activeTab === "security" && (
            <form className="profile-page__section" onSubmit={handleUpdatePassword}>
              <h2 className="profile-page__section-title">Change Password</h2>
              <div className="profile-page__form">
                <div className="profile-page__form-group profile-page__form-group--full">
                  <label className="profile-page__label">Current Password</label>
                  <input className="profile-page__input" type="password" value={passwordData.currentPassword} onChange={(e)=>setPasswordData({...passwordData, currentPassword: e.target.value})} required />
                </div>
                <div className="profile-page__form-group">
                  <label className="profile-page__label">New Password</label>
                  <input className="profile-page__input" type="password" placeholder="8+ chars, A-Z, 0-9" value={passwordData.newPassword} onChange={(e)=>setPasswordData({...passwordData, newPassword: e.target.value})} required />
                </div>
                <div className="profile-page__form-group">
                  <label className="profile-page__label">Confirm New Password</label>
                  <input className="profile-page__input" type="password" value={passwordData.confirmPassword} onChange={(e)=>setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="profile-page__btn profile-page__btn--primary">Update Password</button>
            </form>
          )}

          {activeTab === "categories" && (
            <div className="profile-page__section">
              <h2 className="profile-page__section-title">My Interests</h2>
              <div className="profile-page__interests-list">
                {Object.keys(formData.categories).map(cat => (
                  <div key={cat} className="profile-page__interest-container">
                    <div className="profile-page__interest-row">
                      <div className="profile-page__interest-info">
                        <h4 className="profile-page__interest-name">{cat}</h4>
                        <span className="profile-page__interest-status">{formData.categories[cat].length} Answers</span>
                      </div>
                      <button 
                        className="profile-page__btn profile-page__btn--edit" 
                        onClick={() => handleStartEdit(cat)}
                        disabled={isAddingInterest}
                      >
                        {editingCategory === cat ? "Close" : "Edit"}
                      </button>
                    </div>

                    {editingCategory === cat && (
                      <div className="profile-page__edit-block">
                        <h4 className="profile-page__edit-title">Editing: {cat}</h4>
                        {newCatQuestions[0]?.questions?.map((q) => (
                          <div key={q._id} className="profile-page__quiz-block">
                            <p className="profile-page__quiz-text">{q.questionText}</p>
                            <div className="profile-page__quiz-options">
                              {q.options.map((opt) => (
                                <button key={opt._id} type="button" onClick={() => setNewAnswers(prev => ({
                                  ...prev, [q._id]: { category: cat, questionText: q.questionText, selectedText: opt.text, trait: opt.trait }
                                }))}
                                className={`profile-page__quiz-opt-btn ${newAnswers[q._id]?.selectedText === opt.text ? "profile-page__quiz-opt-btn--active" : ""}`}>
                                  {opt.text}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        <div className="profile-page__edit-actions">
                           <button className="profile-page__btn profile-page__btn--primary" onClick={() => submitInterest(cat)} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</button>
                           <button className="profile-page__btn profile-page__btn--secondary" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="profile-page__add-interest-wrapper">
                  {!isAddingInterest ? (
                    <button className="profile-page__btn profile-page__btn--full" onClick={fetchAllInterestOptions} disabled={!!editingCategory}>+ Add New Interest</button>
                  ) : (
                    <div className="profile-page__interest-form">
                      <div className="profile-page__form-group">
                        <label className="profile-page__label">Select Category</label>
                        <select className="profile-page__select" value={selectedNewCat} onChange={(e) => handleCategorySelect(e.target.value)}>
                          <option value="">-- Choose Category --</option>
                          {allInterestOptions.filter(c => !formData.categories[c.label]).map(c => (
                            <option key={c._id} value={c.label}>{c.icon} {c.label}</option>
                          ))}
                        </select>
                      </div>

                      {newCatQuestions[0]?.questions?.map((q) => (
                        <div key={q._id} className="profile-page__quiz-block">
                          <p className="profile-page__quiz-text">{q.questionText}</p>
                          <div className="profile-page__quiz-options">
                            {q.options.map((opt) => (
                              <button key={opt._id} type="button" onClick={() => setNewAnswers(prev => ({
                                ...prev, [q._id]: { category: selectedNewCat, questionText: q.questionText, selectedText: opt.text, trait: opt.trait }
                              }))}
                              className={`profile-page__quiz-opt-btn ${newAnswers[q._id]?.selectedText === opt.text ? "profile-page__quiz-opt-btn--active" : ""}`}>
                                {opt.text}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {selectedNewCat && <button className="profile-page__btn profile-page__btn--primary profile-page__btn--full" onClick={() => submitInterest(selectedNewCat)} disabled={isSaving}>{isSaving ? "Saving..." : "Confirm & Add"}</button>}
                      <button className="profile-page__btn profile-page__btn--secondary" onClick={() => { setIsAddingInterest(false); setSelectedNewCat(""); }}>Cancel</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;