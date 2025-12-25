import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { Country, City } from 'country-state-city';
import Cropper from "react-easy-crop"; 
import "./ProfilePage.css";

const ProfilePage = () => {
  const { currentUser, checkAuth } = useAuth();
  const navigate = useNavigate();
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

  const countries = Country.getAllCountries();
  const [cities, setCities] = useState([]);

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

  useEffect(() => {
    const fetchFullProfile = async () => {
      if (!currentUser?._id) return;
      try {
        const res = await fetch(`${API_URL}/api/user/user/${currentUser._id}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const serverCountry = data.location?.country || data.country || "";
          const serverCity = data.location?.city || data.city || "";
          const countryObj = countries.find(c => c.name === serverCountry);
          setFormData({
            name: data.name || "",
            bio: data.bio || "",
            phone: data.phone || "",
            country: serverCountry,
            countryCode: countryObj?.isoCode || "",
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

  useEffect(() => {
    if (formData.countryCode) setCities(City.getCitiesOfCountry(formData.countryCode));
  }, [formData.countryCode]);

  const fetchAllInterestOptions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/onboarding/interests-options`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAllInterestOptions(data);
        setIsAddingInterest(true);
      }
    } catch (err) { console.error(err); }
  };

  const handleCategorySelect = async (categoryName) => {
    setSelectedNewCat(categoryName);
    if (!categoryName) return setNewCatQuestions([]);
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
        setNewAnswers({});
      }
    } catch (err) { console.error(err); }
  };

  const submitNewInterest = async () => {
    const quizResults = Object.values(newAnswers).map(ans => ({
      category: selectedNewCat,
      questionText: ans.questionText,
      selectedText: ans.selectedText,
      trait: ans.trait
    }));
    const totalQuestions = newCatQuestions[0]?.questions?.length || 0;
    if (quizResults.length < totalQuestions) return alert("Please answer all questions first!");

    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/user/onboarding/saveUserInterestCategoriesQuestinsAnswer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quizResults })
      });
      if (res.ok) {
        alert("Interest added successfully! ✨");
        window.location.reload(); 
      }
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const handleBirthdayChange = (e) => {
    const { name, value } = e.target;
    if (value !== "" && !/^\d+$/.test(value)) return;
    setFormData(prev => ({ ...prev, birthday: { ...prev.birthday, [name]: value } }));
  };

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/user/profile/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      if (res.ok) { alert("Profile updated! ✨"); checkAuth(); }
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const handleSaveGallery = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/user/profile/gallery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ images: formData.gallery })
      });
      if (res.ok) alert("Gallery updated! 🖼️");
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return alert("Passwords do not match.");
    try {
      const res = await fetch(`${API_URL}/api/user/profile/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(passwordData),
      });
      if (res.ok) {
        alert("Password changed successfully! 🔒");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update password.");
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="profile-page__loading">
      <div className="profile-page__spinner"></div>
    </div>
  );

  return (
    <div className="profile-page">
      {showCropper && (
        <div className="crop-modal">
          <div className="crop-modal__content">
            <div className="crop-modal__area">
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div className="crop-modal__controls">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="crop-modal__slider" />
              <div className="crop-modal__actions">
                <button className="crop-modal__btn crop-modal__btn--cancel" onClick={closeCropper}>Cancel</button>
                <button className="crop-modal__btn crop-modal__btn--confirm" onClick={handleConfirmCrop}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="profile-page__layout">
        <aside className="profile-sidebar">
          <div className="profile-sidebar__avatar-wrapper">
            <img src={formData.avatar || "/default-avatar.png"} alt="User" className="profile-sidebar__avatar-img" />
            <label className="profile-sidebar__upload-label">
              📷 <input type="file" hidden accept="image/*" onChange={onFileChange} className="profile-sidebar__file-input" />
            </label>
          </div>
          <h3 className="profile-sidebar__name">{formData.name}</h3>
          <span className={`profile-sidebar__badge profile-sidebar__badge--${formData.subscription.plan.toLowerCase()}`}>
            {formData.subscription.plan}
          </span>
          <div className="profile-nav">
             <button className={`profile-nav__btn ${activeTab === "general" ? "profile-nav__btn--active" : ""}`} onClick={() => setActiveTab("general")}>👤 General Info</button>
             <button className={`profile-nav__btn ${activeTab === "gallery" ? "profile-nav__btn--active" : ""}`} onClick={() => setActiveTab("gallery")}>🖼️ Photo Gallery</button>
             <button className={`profile-nav__btn ${activeTab === "categories" ? "profile-nav__btn--active" : ""}`} onClick={() => setActiveTab("categories")}>📋 Interests</button>
             <button className={`profile-nav__btn ${activeTab === "security" ? "profile-nav__btn--active" : ""}`} onClick={() => setActiveTab("security")}>🔒 Security</button>
          </div>
        </aside>

        <main className="profile-page__content">
          {activeTab === "general" && (
            <div className="profile-card">
              <h2 className="profile-card__title">Matching & Personal Info</h2>
              <div className="profile-form">
                <div className="profile-form__group">
                  <label className="profile-form__label">Full Name*</label>
                  <input className="profile-form__input" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} />
                </div>
                <div className="profile-form__group">
                  <label className="profile-form__label">Phone</label>
                  <input className="profile-form__input" value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} />
                </div>
                <div className="profile-form__group">
                  <label className="profile-form__label">Country*</label>
                  <select className="profile-form__select" value={formData.country} onChange={(e)=> {
                    const selected = countries.find(c => c.name === e.target.value);
                    setFormData({...formData, country: e.target.value, countryCode: selected?.isoCode || "", city: ""});
                  }}>
                    {countries.map(c => <option key={c.isoCode} value={c.name} className="profile-form__option">{c.flag} {c.name}</option>)}
                  </select>
                </div>
                <div className="profile-form__group">
                  <label className="profile-form__label">City*</label>
                  <select className="profile-form__select" value={formData.city} onChange={(e)=>setFormData({...formData, city: e.target.value})}>
                    {cities.map((c, i) => <option key={i} value={c.name} className="profile-form__option">{c.name}</option>)}
                  </select>
                </div>
                <div className="profile-form__group profile-form__group--full">
                  <label className="profile-form__label">Birthday*</label>
                  <div className="profile-form__row">
                    <input className="profile-form__input profile-form__input--small" placeholder="DD" name="day" value={formData.birthday.day} onChange={handleBirthdayChange} />
                    <input className="profile-form__input profile-form__input--small" placeholder="MM" name="month" value={formData.birthday.month} onChange={handleBirthdayChange} />
                    <input className="profile-form__input profile-form__input--small" placeholder="YYYY" name="year" value={formData.birthday.year} onChange={handleBirthdayChange} />
                  </div>
                </div>
                <div className="profile-form__group profile-form__group--full">
                  <label className="profile-form__label">Bio</label>
                  <textarea className="profile-form__textarea" rows="4" value={formData.bio} onChange={(e)=>setFormData({...formData, bio:e.target.value})} />
                </div>
              </div>
              <button className="profile-card__save-btn" onClick={handleSaveGeneral} disabled={isSaving}>Save Changes</button>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="profile-card">
              <h2 className="profile-card__title">Photo Gallery</h2>
              <div className="profile-gallery">
                {formData.gallery.map((img, i) => (
                  <div key={i} className="profile-gallery__item">
                    <img src={img} alt="" className="profile-gallery__img" />
                    <button className="profile-gallery__remove-btn" onClick={() => setFormData({...formData, gallery: formData.gallery.filter((_, idx) => idx !== i)})}>×</button>
                  </div>
                ))}
                {formData.gallery.length < 6 && (
                  <label className="profile-gallery__add-card">
                    <span className="profile-gallery__add-text">+ Add Photo</span>
                    <input type="file" hidden accept="image/*" onChange={(e) => {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({...formData, gallery: [...formData.gallery, reader.result]});
                      reader.readAsDataURL(e.target.files[0]);
                    }} className="profile-gallery__file-input" />
                  </label>
                )}
              </div>
              <button className="profile-card__save-btn" onClick={handleSaveGallery}>Update Gallery</button>
            </div>
          )}

          {activeTab === "security" && (
            <form className="profile-card" onSubmit={handleUpdatePassword}>
              <h2 className="profile-card__title">Change Password</h2>
              <div className="profile-form">
                <div className="profile-form__group profile-form__group--full">
                  <label className="profile-form__label">Current Password</label>
                  <input className="profile-form__input" type="password" value={passwordData.currentPassword} onChange={(e)=>setPasswordData({...passwordData, currentPassword: e.target.value})} required />
                </div>
                <div className="profile-form__group">
                  <label className="profile-form__label">New Password</label>
                  <input className="profile-form__input" type="password" placeholder="8+ chars, A-Z, 0-9" value={passwordData.newPassword} onChange={(e)=>setPasswordData({...passwordData, newPassword: e.target.value})} required />
                </div>
                <div className="profile-form__group">
                  <label className="profile-form__label">Confirm New Password</label>
                  <input className="profile-form__input" type="password" value={passwordData.confirmPassword} onChange={(e)=>setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="profile-card__save-btn">Update Password</button>
            </form>
          )}

          {activeTab === "categories" && (
            <div className="profile-card">
              <h2 className="profile-card__title">My Interests</h2>
              <div className="profile-interests">
                {Object.keys(formData.categories).map(cat => (
                  <div key={cat} className="profile-interests__row">
                      <div className="profile-interests__info">
                        <h4 className="profile-interests__name">{cat}</h4>
                        <span className="profile-interests__status">{formData.categories[cat].length} Answers</span>
                      </div>
                      <button className="profile-interests__edit-btn" onClick={()=>navigate(`/onboarding?category=${cat}`)}>Edit</button>
                  </div>
                ))}

                <div className="profile-interests__add-section">
                  {!isAddingInterest ? (
                    <button className="profile-card__save-btn profile-card__save-btn--full" onClick={fetchAllInterestOptions}>+ Add New Interest</button>
                  ) : (
                    <div className="interest-form">
                      <div className="interest-form__group">
                        <label className="interest-form__label">Select Category</label>
                        <select className="interest-form__select" value={selectedNewCat} onChange={(e) => handleCategorySelect(e.target.value)}>
                          <option value="" className="interest-form__option">-- Choose Category --</option>
                          {allInterestOptions.filter(c => !formData.categories[c.label]).map(c => (
                            <option key={c._id} value={c.label} className="interest-form__option">{c.icon} {c.label}</option>
                          ))}
                        </select>
                      </div>

                      {newCatQuestions[0]?.questions?.map((q) => (
                        <div key={q._id} className="interest-form__question-block">
                          <p className="interest-form__question-text">{q.questionText}</p>
                          <div className="interest-form__options">
                            {q.options.map((opt) => (
                              <button key={opt._id} type="button" onClick={() => setNewAnswers(prev => ({
                                ...prev, [q._id]: { category: selectedNewCat, questionText: q.questionText, selectedText: opt.text, trait: opt.trait }
                              }))}
                              className={`interest-form__option-btn ${newAnswers[q._id]?.selectedText === opt.text ? "interest-form__option-btn--active" : ""}`}>
                                {opt.text}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {selectedNewCat && <button className="profile-card__save-btn profile-card__save-btn--full" onClick={submitNewInterest} disabled={isSaving}>{isSaving ? "Saving..." : "Confirm & Add"}</button>}
                      <button className="interest-form__cancel-btn" onClick={() => { setIsAddingInterest(false); setSelectedNewCat(""); }}>Cancel</button>
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