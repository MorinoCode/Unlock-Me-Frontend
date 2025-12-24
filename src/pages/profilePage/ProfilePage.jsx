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
  const [errors, setErrors] = useState({});

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
        const res = await fetch(`${API_URL}/api/users/user/${currentUser._id}`, { credentials: "include" });
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

  if (loading) return <div className="pp-unique-rootContainer"><div className="pp-unique-spinner"></div></div>;

  return (
    <div className="pp-unique-rootContainer">
      {showCropper && (
        <div className="pp-unique-cropperModal">
          <div className="pp-unique-cropperContent">
            <div className="pp-unique-cropArea"><Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} /></div>
            <div className="pp-unique-cropperControls">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="pp-unique-zoomSlider" />
              <div className="pp-unique-cropperButtons">
                <button className="pp-unique-cancelBtn" onClick={closeCropper}>Cancel</button>
                <button className="pp-unique-confirmBtn" onClick={handleConfirmCrop}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pp-unique-layout">
        <aside className="pp-unique-sidebar">
          <div className="pp-unique-avatarContainer">
            <img src={formData.avatar || "/default-avatar.png"} alt="User" className="pp-unique-avatarImage" />
            <label className="pp-unique-avatarUploadOverlay">📷 <input type="file" hidden accept="image/*" onChange={onFileChange} className="pp-unique-hiddenFileInput" /></label>
          </div>
          <h3 className="pp-unique-userNameText">{formData.name}</h3>
          <span className={`pp-unique-subscriptionBadge pp-unique-plan-${formData.subscription.plan.toLowerCase()}`}>{formData.subscription.plan}</span>
          <div className="pp-unique-navMenu">
             <button className={`pp-unique-navBtn ${activeTab === "general" ? "pp-unique-navBtnActive" : ""}`} onClick={() => setActiveTab("general")}>👤 General Info</button>
             <button className={`pp-unique-navBtn ${activeTab === "gallery" ? "pp-unique-navBtnActive" : ""}`} onClick={() => setActiveTab("gallery")}>🖼️ Photo Gallery</button>
             <button className={`pp-unique-navBtn ${activeTab === "categories" ? "pp-unique-navBtnActive" : ""}`} onClick={() => setActiveTab("categories")}>📋 Interests</button>
             <button className={`pp-unique-navBtn ${activeTab === "security" ? "pp-unique-navBtnActive" : ""}`} onClick={() => setActiveTab("security")}>🔒 Security</button>
          </div>
        </aside>

        <main className="pp-unique-contentArea">
          {activeTab === "general" && (
            <div className="pp-unique-card">
              <h2 className="pp-unique-sectionTitleWhite">Matching & Personal Info</h2>
              <div className="pp-unique-formGrid">
                <div className="pp-unique-field"><label className="pp-unique-fieldLabel">Full Name*</label><input className="pp-unique-textInput" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} /></div>
                <div className="pp-unique-field"><label className="pp-unique-fieldLabel">Phone</label><input className="pp-unique-textInput" value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} /></div>
                <div className="pp-unique-field"><label className="pp-unique-fieldLabel">Country*</label>
                  <select className="pp-unique-selectInput" value={formData.country} onChange={(e)=> {
                    const selected = countries.find(c => c.name === e.target.value);
                    setFormData({...formData, country: e.target.value, countryCode: selected?.isoCode || "", city: ""});
                  }}>
                    {countries.map(c => <option key={c.isoCode} value={c.name} className="pp-unique-opt">{c.flag} {c.name}</option>)}
                  </select>
                </div>
                <div className="pp-unique-field"><label className="pp-unique-fieldLabel">City*</label>
                  <select className="pp-unique-selectInput" value={formData.city} onChange={(e)=>setFormData({...formData, city: e.target.value})}>
                    {cities.map((c, i) => <option key={i} value={c.name} className="pp-unique-opt">{c.name}</option>)}
                  </select>
                </div>
                <div className="pp-unique-field pp-unique-fullWidth">
                  <label className="pp-unique-fieldLabel">Birthday*</label>
                  <div className="pp-unique-birthdayRow">
                    <input className="pp-unique-textInput pp-unique-bdayPart" placeholder="DD" name="day" value={formData.birthday.day} onChange={handleBirthdayChange} />
                    <input className="pp-unique-textInput pp-unique-bdayPart" placeholder="MM" name="month" value={formData.birthday.month} onChange={handleBirthdayChange} />
                    <input className="pp-unique-textInput pp-unique-bdayPart" placeholder="YYYY" name="year" value={formData.birthday.year} onChange={handleBirthdayChange} />
                  </div>
                </div>
                <div className="pp-unique-field pp-unique-fullWidth"><label className="pp-unique-fieldLabel">Bio</label><textarea className="pp-unique-textArea" rows="4" value={formData.bio} onChange={(e)=>setFormData({...formData, bio:e.target.value})} /></div>
              </div>
              <button className="pp-unique-saveBtn" onClick={handleSaveGeneral} disabled={isSaving}>Save Changes</button>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="pp-unique-card">
              <h2 className="pp-unique-sectionTitleWhite">Photo Gallery</h2>
              <div className="pp-unique-galleryGrid">
                {formData.gallery.map((img, i) => (
                  <div key={i} className="pp-unique-galleryItem">
                    <img src={img} alt="" className="pp-unique-galleryImg" />
                    <button className="pp-unique-removeBtn" onClick={() => setFormData({...formData, gallery: formData.gallery.filter((_, idx) => idx !== i)})}>×</button>
                  </div>
                ))}
                {formData.gallery.length < 6 && (
                  <label className="pp-unique-addPlaceholder">
                    <span className="pp-unique-addText">+ Add Photo</span>
                    <input type="file" hidden accept="image/*" onChange={(e) => {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({...formData, gallery: [...formData.gallery, reader.result]});
                      reader.readAsDataURL(e.target.files[0]);
                    }} className="pp-unique-hiddenFileInput" />
                  </label>
                )}
              </div>
              <button className="pp-unique-saveBtn" onClick={handleSaveGallery}>Update Gallery</button>
            </div>
          )}

          {activeTab === "security" && (
            <form className="pp-unique-card" onSubmit={handleUpdatePassword}>
              <h2 className="pp-unique-sectionTitleWhite">Change Password</h2>
              <div className="pp-unique-formGrid">
                <div className="pp-unique-field pp-unique-fullWidth"><label className="pp-unique-fieldLabel">Current Password</label><input className="pp-unique-textInput" type="password" value={passwordData.currentPassword} onChange={(e)=>setPasswordData({...passwordData, currentPassword: e.target.value})} required /></div>
                <div className="pp-unique-field"><label className="pp-unique-fieldLabel">New Password</label><input className="pp-unique-textInput" type="password" placeholder="8+ chars, A-Z, 0-9" value={passwordData.newPassword} onChange={(e)=>setPasswordData({...passwordData, newPassword: e.target.value})} required /></div>
                <div className="pp-unique-field"><label className="pp-unique-fieldLabel">Confirm New Password</label><input className="pp-unique-textInput" type="password" value={passwordData.confirmPassword} onChange={(e)=>setPasswordData({...passwordData, confirmPassword: e.target.value})} required /></div>
              </div>
              <button type="submit" className="pp-unique-saveBtn">Update Password</button>
            </form>
          )}

          {activeTab === "categories" && (
            <div className="pp-unique-card">
              <h2 className="pp-unique-sectionTitleWhite">My Interests</h2>
              <div className="pp-unique-categoryContainer">
                {Object.keys(formData.categories).map(cat => (
                  <div key={cat} className="pp-unique-catRow">
                     <div className="pp-unique-catInfo">
                       <h4 className="pp-unique-categoryLabelName">{cat}</h4>
                       <span className="pp-unique-statusBadge">{formData.categories[cat].length} Answers</span>
                     </div>
                     <button className="pp-unique-editTabBtn" onClick={()=>navigate(`/onboarding?category=${cat}`)}>Edit</button>
                  </div>
                ))}

                <div className="pp-unique-addSectionArea">
                  {!isAddingInterest ? (
                    <button className="pp-unique-saveBtn pp-unique-fullWidthBtn" onClick={fetchAllInterestOptions}>+ Add New Interest</button>
                  ) : (
                    <div className="pp-unique-newInterestForm">
                      <div className="pp-unique-field pp-unique-mb20">
                        <label className="pp-unique-fieldLabel">Select Category</label>
                        <select className="pp-unique-selectInput" value={selectedNewCat} onChange={(e) => handleCategorySelect(e.target.value)}>
                          <option value="" className="pp-unique-opt">-- Choose Category --</option>
                          {allInterestOptions.filter(c => !formData.categories[c.label]).map(c => (
                            <option key={c._id} value={c.label} className="pp-unique-opt">{c.icon} {c.label}</option>
                          ))}
                        </select>
                      </div>

                      {newCatQuestions[0]?.questions?.map((q) => (
                        <div key={q._id} className="pp-unique-questionItem">
                          <p className="pp-unique-qText">{q.questionText}</p>
                          <div className="pp-unique-optionsWrap">
                            {q.options.map((opt) => (
                              <button key={opt._id} type="button" onClick={() => setNewAnswers(prev => ({
                                ...prev, [q._id]: { category: selectedNewCat, questionText: q.questionText, selectedText: opt.text, trait: opt.trait }
                              }))}
                              className={`pp-unique-optBtn ${newAnswers[q._id]?.selectedText === opt.text ? "pp-unique-optBtnActive" : ""}`}>
                                {opt.text}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {selectedNewCat && <button className="pp-unique-saveBtn pp-unique-fullWidthBtn" onClick={submitNewInterest} disabled={isSaving}>{isSaving ? "Saving..." : "Confirm & Add"}</button>}
                      <button className="pp-unique-cancelBtn pp-unique-fullWidthBtn" onClick={() => { setIsAddingInterest(false); setSelectedNewCat(""); }}>Cancel</button>
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