import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/useAuth.js";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";
import { Mic, Square, Trash2, ShieldCheck, User as UserIcon, Image as ImageIcon, LayoutGrid, Plus, X, Heart, Film, Utensils, Trophy } from "lucide-react";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { currentUser, checkAuth } = useAuth();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropTarget, setCropTarget] = useState("avatar"); 

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
    subscription: { plan: "free" }, categories: {},
    voiceIntro: "",
    location: { type: "Point", coordinates: [0, 0] }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  const [availableLocations, setAvailableLocations] = useState([]);
  const [cities, setCities] = useState([]);
  const [initialCityLoaded, setInitialCityLoaded] = useState(false);

  const updateGeoLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              type: "Point",
              coordinates: [position.coords.longitude, position.coords.latitude]
            }
          }));
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

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
      const cityList = selectedLocation ? selectedLocation.cities : [];
      setCities(cityList);

      if (!initialCityLoaded && formData.city && cityList.includes(formData.city)) {
        setInitialCityLoaded(true);
      }
    }
  }, [formData.countryCode, availableLocations, formData.city, initialCityLoaded]);

  useEffect(() => {
    const fetchFullProfile = async () => {
      if (!currentUser?._id) return;
      try {
        const res = await fetch(`${API_URL}/api/user/user/${currentUser._id}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            bio: data.bio || "",
            phone: data.phone || "",
            country: data.location?.country || "",
            countryCode: data.location?.countryCode || "",
            city: data.location?.city || "",
            avatar: data.avatar || "",
            gallery: data.gallery || [],
            gender: data.gender || "Male",
            lookingFor: data.lookingFor || "Female",
            birthday: data.birthday?.year ? data.birthday : { day: "", month: "", year: "" },
            subscription: data.subscription || { plan: "free" },
            categories: data.questionsbycategoriesResults?.categories || {},
            voiceIntro: data.voiceIntro || "",
            location: data.location || { type: "Point", coordinates: [0, 0] }
          });
          if (data.voiceIntro) setAudioURL(data.voiceIntro);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchFullProfile();
  }, [currentUser, API_URL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mpeg" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, voiceIntro: reader.result }));
        };
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 9) {
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      toast.error("Microphone access denied!");
      console.log(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const deleteVoice = () => {
    setAudioURL("");
    setFormData(prev => ({ ...prev, voiceIntro: "" }));
    setRecordingDuration(0);
  };

  const handleSaveVoice = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/user/profile/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ voiceIntro: formData.voiceIntro }),
      });
      if (res.ok) {
        toast.success("Voice Intro saved!");
        checkAuth();
      }
    } catch (err) {
      toast.error("Failed to save voice.");
      console.log(err);
    } finally {
      setIsSaving(false);
    }
  };

  const onFileChange = (e, target) => {
    if (e.target.files && e.target.files.length > 0) {
      setCropTarget(target);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = "";
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
      if (cropTarget === "avatar") {
        setFormData({ ...formData, avatar: croppedImageBase64 });
      } else {
        setFormData({ ...formData, gallery: [...formData.gallery, croppedImageBase64] });
      }
      setShowCropper(false);
    } catch (e) { console.error(e); }
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
        body: JSON.stringify({ selectedCategories: [categoryName] }),
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
    if (editingCategory === catName) { setEditingCategory(null); return; }
    setIsAddingInterest(false);
    setEditingCategory(catName);
    setNewAnswers({});
    const loadingToast = toast.loading("Loading questions...");
    const questionsData = await fetchQuestionsForCategory(catName);
    const existingAnswers = formData.categories[catName] || [];
    const preFilledAnswers = {};
    if (questionsData?.[0]?.questions) {
      questionsData[0].questions.forEach((q) => {
        const found = existingAnswers.find((ans) => ans.questionText === q.questionText);
        if (found) {
          preFilledAnswers[q._id] = {
            category: catName,
            questionText: q.questionText,
            selectedText: found.selectedText || found.answer,
            trait: found.trait,
          };
        }
      });
    }
    setNewAnswers(preFilledAnswers);
    toast.dismiss(loadingToast);
  };

  const submitInterest = async (categoryName) => {
    const quizResults = Object.values(newAnswers).map((ans) => ({
      category: categoryName,
      questionText: ans.questionText,
      selectedText: ans.selectedText,
      trait: ans.trait,
    }));
    const totalQuestions = newCatQuestions[0]?.questions?.length || 0;
    if (quizResults.length < totalQuestions) return toast.error("Please answer all questions first!");
    setIsSaving(true);
    const loadingToast = toast.loading("Saving answers...");
    try {
      const res = await fetch(`${API_URL}/api/user/onboarding/saveUserInterestCategoriesQuestinsAnswer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quizResults }),
      });
      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success("Interest updated!");
        window.location.reload();
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Failed to save.");
      console.log(err);
    } finally { setIsSaving(false); }
  };

  const handleBirthdayChange = (e) => {
    const { name, value } = e.target;
    if (value !== "" && !/^\d+$/.test(value)) return;
    setFormData((prev) => ({ ...prev, birthday: { ...prev.birthday, [name]: value } }));
  };

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading("Updating profile...");
    try {
      const res = await fetch(`${API_URL}/api/user/profile/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          location: {
            ...formData.location,
            country: formData.country,
            city: formData.city,
            countryCode: formData.countryCode
          }
        }),
      });
      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success("Profile updated!");
        await checkAuth();
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Error updating profile.");
      console.log(err);
    } finally { setIsSaving(false); }
  };

  const handleSaveGallery = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading("Updating gallery...");
    try {
      const res = await fetch(`${API_URL}/api/user/profile/gallery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ images: formData.gallery }),
      });
      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success("Gallery updated!");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update gallery.");
      console.log(err);
    } finally { setIsSaving(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error("Passwords do not match.");
    const loadingToast = toast.loading("Changing password...");
    try {
      const res = await fetch(`${API_URL}/api/user/profile/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(passwordData),
      });
      toast.dismiss(loadingToast);
      if (res.ok) {
        toast.success("Password changed!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json();
        toast.error(err.message || "Error.");
      }
    } catch (err) { toast.dismiss(loadingToast); toast.error("Server error."); console.log(err);}
  };

  const getInterestIcon = (label) => {
    switch (label.toLowerCase()) {
      case 'cooking': return <Utensils size={18} />;
      case 'movies': return <Film size={18} />;
      case 'sports': return <Trophy size={18} />;
      default: return <Heart size={18} />;
    }
  };

  if (loading) return <div className="pp-loading"><div className="pp-spinner"></div></div>;

  return (
    <div className="profile-page">
      {showCropper && (
        <div className="pp-cropper">
          <div className="pp-cropper__modal">
            <div className="pp-cropper__area">
              <Cropper 
                image={imageSrc} 
                crop={crop} 
                zoom={zoom} 
                aspect={cropTarget === "avatar" ? 1 : 4/5} 
                onCropChange={setCrop} 
                onCropComplete={onCropComplete} 
                onZoomChange={setZoom} 
              />
            </div>
            <div className="pp-cropper__controls">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="pp-cropper__slider" />
              <div className="pp-cropper__btns">
                <button className="pp-btn pp-btn--secondary" onClick={() => setShowCropper(false)}>Cancel</button>
                <button className="pp-btn pp-btn--primary" onClick={handleConfirmCrop}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pp-container">
        <div className="pp-layout">
          <aside className="pp-sidebar">
            <div className="pp-sidebar__avatar">
              <img src={formData.avatar || "/default-avatar.png"} alt="User" className="pp-sidebar__img" />
              <label className="pp-sidebar__upload">
                <ImageIcon size={16} />
                <input type="file" hidden accept="image/*" onChange={(e) => onFileChange(e, "avatar")} />
              </label>
            </div>
            <h3 className="pp-sidebar__name">{formData.name}</h3>
            <span className={`pp-sidebar__badge pp-sidebar__badge--${formData.subscription.plan.toLowerCase()}`}>{formData.subscription.plan}</span>
            <nav className="pp-nav">
              <button className={`pp-nav__item ${activeTab === "general" ? "active" : ""}`} onClick={() => setActiveTab("general")}><UserIcon size={18} /> General</button>
              <button className={`pp-nav__item ${activeTab === "voice" ? "active" : ""}`} onClick={() => setActiveTab("voice")}><Mic size={18} /> Voice</button>
              <button className={`pp-nav__item ${activeTab === "gallery" ? "active" : ""}`} onClick={() => setActiveTab("gallery")}><ImageIcon size={18} /> Gallery</button>
              <button className={`pp-nav__item ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}><LayoutGrid size={18} /> Interests</button>
              <button className={`pp-nav__item ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}><ShieldCheck size={18} /> Security</button>
            </nav>
          </aside>

          <main className="pp-main">
            {activeTab === "general" && (
              <section className="pp-section">
                <h2 className="pp-title">Personal Information</h2>
                <div className="pp-form-grid">
                  <div className="pp-form-group">
                    <label>Full Name*</label>
                    <input className="pp-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="pp-form-group">
                    <label>Phone</label>
                    <input className="pp-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="pp-form-group">
                    <label>Country*</label>
                    <select className="pp-select" value={formData.country} onChange={(e) => {
                      const selected = availableLocations.find((c) => c.country === e.target.value);
                      const cityList = selected ? selected.cities : [];
                      setCities(cityList);
                      setFormData({ 
                        ...formData, 
                        country: e.target.value, 
                        countryCode: selected?.countryCode || "", 
                        city: cityList.length > 0 ? cityList[0] : "" // انتخاب اولین شهر خودکار
                      });
                      updateGeoLocation();
                    }}>
                      <option value="">Select Country</option>
                      {availableLocations.map((loc) => <option key={loc.countryCode} value={loc.country}>{loc.country}</option>)}
                    </select>
                  </div>
                  <div className="pp-form-group">
                    <label>City*</label>
                    <select className="pp-select" value={formData.city} onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      updateGeoLocation();
                    }} disabled={!formData.countryCode || cities.length === 0}>
                      <option value="">{cities.length === 0 && formData.countryCode ? "Loading..." : "Select City"}</option>
                      {cities.map((cityName, i) => <option key={i} value={cityName}>{cityName}</option>)}
                    </select>
                  </div>
                  <div className="pp-form-group pp-form-group--full">
                    <label>Birthday*</label>
                    <div className="pp-date-row">
                      <input className="pp-input pp-input--center" placeholder="DD" name="day" value={formData.birthday.day} onChange={handleBirthdayChange} />
                      <input className="pp-input pp-input--center" placeholder="MM" name="month" value={formData.birthday.month} onChange={handleBirthdayChange} />
                      <input className="pp-input pp-input--center" placeholder="YYYY" name="year" value={formData.birthday.year} onChange={handleBirthdayChange} />
                    </div>
                  </div>
                  <div className="pp-form-group pp-form-group--full">
                    <label>Bio</label>
                    <textarea className="pp-textarea" rows="4" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
                  </div>
                </div>
                <div className="pp-footer">
                  <button className="pp-btn pp-btn--primary" onClick={handleSaveGeneral} disabled={isSaving}>Save Changes</button>
                </div>
              </section>
            )}

            {activeTab === "voice" && (
              <section className="pp-section">
                <h2 className="pp-title">Voice Introduction</h2>
                <p className="pp-desc">Show your personality in 10 seconds! Share a fun fact, your favorite quote, or just a warm hello.</p>
                <div className="pp-voice-box">
                  <div className={`pp-mic-circle ${isRecording ? 'recording' : ''}`}>
                    <div className="pp-timer">{recordingDuration}s / 10s</div>
                    {!isRecording ? (
                      <button className="pp-mic-btn" onClick={startRecording}><Mic size={36} /></button>
                    ) : (
                      <button className="pp-mic-btn stop" onClick={stopRecording}><Square size={36} /></button>
                    )}
                  </div>
                  {audioURL && (
                    <div className="pp-audio-player">
                      <audio src={audioURL} controls className="pp-audio-el" />
                      <button className="pp-del-btn" onClick={deleteVoice}><Trash2 size={20} /></button>
                    </div>
                  )}
                </div>
                <div className="pp-footer">
                   <button className="pp-btn pp-btn--primary pp-btn--full" onClick={handleSaveVoice} disabled={isSaving || !formData.voiceIntro}>Upload Voice</button>
                </div>
              </section>
            )}

            {activeTab === "gallery" && (
              <section className="pp-section">
                <h2 className="pp-title">Photo Gallery</h2>
                <div className="pp-gallery-grid">
                  {formData.gallery.map((img, i) => (
                    <div key={i} className="pp-gallery-card">
                      <img src={img} alt="" className="pp-gallery-img" />
                      <button className="pp-gallery-del" onClick={() => setFormData({ ...formData, gallery: formData.gallery.filter((_, idx) => idx !== i) })}><X size={16} /></button>
                    </div>
                  ))}
                  {formData.gallery.length < 6 && (
                    <label className="pp-gallery-add">
                      <Plus size={28} />
                      <span>Add Photo</span>
                      <input type="file" hidden accept="image/*" onChange={(e) => onFileChange(e, "gallery")} />
                    </label>
                  )}
                </div>
                <div className="pp-footer">
                  <button className="pp-btn pp-btn--primary" onClick={handleSaveGallery}>Save Gallery</button>
                </div>
              </section>
            )}

            {activeTab === "categories" && (
              <section className="pp-section">
                <h2 className="pp-title">My Interests</h2>
                <div className="pp-interests-list">
                  {Object.keys(formData.categories).map((cat) => (
                    <div key={cat} className={`pp-interest-card ${editingCategory === cat ? 'active' : ''}`}>
                      <div className="pp-int-header">
                        <div className="pp-int-info">
                          <div className="pp-int-icon">{getInterestIcon(cat)}</div>
                          <div>
                            <h4>{cat}</h4>
                            <span>{formData.categories[cat].length} Answers</span>
                          </div>
                        </div>
                        <button className="pp-int-edit" onClick={() => handleStartEdit(cat)}>{editingCategory === cat ? <X size={18} /> : "Edit"}</button>
                      </div>
                      {editingCategory === cat && (
                        <div className="pp-quiz-area">
                          {newCatQuestions[0]?.questions?.map((q) => (
                            <div key={q._id} className="pp-quiz-item">
                              <p>{q.questionText}</p>
                              <div className="pp-quiz-opts">
                                {q.options.map((opt) => (
                                  <button key={opt._id} type="button" onClick={() => setNewAnswers((prev) => ({ ...prev, [q._id]: { category: cat, questionText: q.questionText, selectedText: opt.text, trait: opt.trait } }))} className={`pp-quiz-chip ${newAnswers[q._id]?.selectedText === opt.text ? "selected" : ""}`}>{opt.text}</button>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div className="pp-quiz-actions">
                            <button className="pp-btn pp-btn--primary" onClick={() => submitInterest(cat)} disabled={isSaving}>Save</button>
                            <button className="pp-btn pp-btn--secondary" onClick={() => setEditingCategory(null)}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pp-add-interest-area">
                  {!isAddingInterest ? (
                    <button className="pp-add-new-btn" onClick={fetchAllInterestOptions}><Plus size={20} /> Add New Interest</button>
                  ) : (
                    <div className="pp-new-interest-box">
                      <select className="pp-select" value={selectedNewCat} onChange={(e) => handleCategorySelect(e.target.value)}>
                        <option value="">-- Choose Category --</option>
                        {allInterestOptions.filter((c) => !formData.categories[c.label]).map((c) => <option key={c._id} value={c.label}>{c.icon} {c.label}</option>)}
                      </select>
                      {newCatQuestions[0]?.questions?.map((q) => (
                        <div key={q._id} className="pp-quiz-item">
                          <p>{q.questionText}</p>
                          <div className="pp-quiz-opts">
                            {q.options.map((opt) => (
                              <button key={opt._id} type="button" onClick={() => setNewAnswers((prev) => ({ ...prev, [q._id]: { category: selectedNewCat, questionText: q.questionText, selectedText: opt.text, trait: opt.trait } }))} className={`pp-quiz-chip ${newAnswers[q._id]?.selectedText === opt.text ? "selected" : ""}`}>{opt.text}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="pp-quiz-actions">
                        {selectedNewCat && <button className="pp-btn pp-btn--primary" onClick={() => submitInterest(selectedNewCat)}>Confirm & Add</button>}
                        <button className="pp-btn pp-btn--secondary" onClick={() => setIsAddingInterest(false)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "security" && (
              <form className="pp-section" onSubmit={handleUpdatePassword}>
                <h2 className="pp-title">Change Password</h2>
                <div className="pp-form-grid">
                  <div className="pp-form-group pp-form-group--full">
                    <label>Current Password</label>
                    <input className="pp-input" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
                  </div>
                  <div className="pp-form-group">
                    <label>New Password</label>
                    <input className="pp-input" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />
                  </div>
                  <div className="pp-form-group">
                    <label>Confirm Password</label>
                    <input className="pp-input" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required />
                  </div>
                </div>
                <div className="pp-footer">
                  <button type="submit" className="pp-btn pp-btn--primary">Update Password</button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;