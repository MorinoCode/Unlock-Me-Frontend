import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { Country, City } from 'country-state-city';
import Cropper from "react-easy-crop"; 
import styles from "./ProfilePage.module.css";

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
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
    return canvas.toDataURL("image/jpeg"); 
  };

  const handleConfirmCrop = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      setFormData({ ...formData, avatar: croppedImageBase64 }); // ست کردن عکس برش‌خورده
      setShowCropper(false); // بستن مودال
    } catch (e) {
      console.error(e);
    }
  };

  const closeCropper = () => {
    setShowCropper(false);
    setImageSrc(null);
  };
  // ------------------------------------

  const validateBirthday = (birthday) => {
    const { day, month, year } = birthday;
    const newErrors = {};
    if (!/^\d+$/.test(day) || Number(day) < 1 || Number(day) > 31) newErrors.day = "Invalid Day";
    if (!/^\d+$/.test(month) || Number(month) < 1 || Number(month) > 12) newErrors.month = "Invalid Month";
    if (!/^\d{4}$/.test(year)) newErrors.year = "Invalid Year";

    if (Object.keys(newErrors).length === 0) {
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 12 || age > 100) newErrors.age = "Age must be between 12 and 100";
    }
    return newErrors;
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullProfile();
  }, [currentUser, API_URL]);

  useEffect(() => {
    if (formData.countryCode) {
      setCities(City.getCitiesOfCountry(formData.countryCode));
    }
  }, [formData.countryCode]);

  const handleBirthdayChange = (e) => {
    const { name, value } = e.target;
    if (value !== "" && !/^\d+$/.test(value)) return;
    const updatedBirthday = { ...formData.birthday, [name]: value };
    setFormData({ ...formData, birthday: updatedBirthday });
    setErrors(validateBirthday(updatedBirthday));
  };

  const handleSaveGeneral = async () => {
    const bdayErrors = validateBirthday(formData.birthday);
    if (Object.keys(bdayErrors).length > 0) return alert("Please enter a valid birthday.");
    if (!formData.name?.trim() || !formData.country || !formData.city) return alert("Name, Country, and City are required.");

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        gender: formData.gender,
        lookingFor: formData.lookingFor,
        birthday: formData.birthday,
        avatar: formData.avatar,
        country: formData.country,
        city: formData.city
      };

      const res = await fetch(`${API_URL}/api/user/profile/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Profile updated successfully! ✨");
        if (checkAuth) checkAuth();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save profile.");
      }
    } catch (err) {
      alert("Network error. Please try again.",err);
    } finally {
      setIsSaving(false);
    }
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
      if (res.ok) alert("Gallery updated successfully! 🖼️");
    } catch (err) { alert("Failed to update gallery.",err) } 
    finally { setIsSaving(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return alert("New passwords do not match.");
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regex.test(passwordData.newPassword)) return alert("Password must be at least 8 characters long and include uppercase, lowercase, and a number.");

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
        alert(err.message || "Incorrect current password.");
      }
    } catch (err) { alert("Server error.",err) }
  };

  if (loading) return <div className={styles.rootContainer}><div className={styles.spinner}></div></div>;

  return (
    <div className={styles.rootContainer}>
      {/* --- مودال برش عکس --- */}
      {showCropper && (
        <div className={styles.cropperModal}>
          <div className={styles.cropperContent}>
            <div className={styles.cropArea}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className={styles.cropperControls}>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(e.target.value)}
                className={styles.zoomSlider}
              />
              <div className={styles.cropperButtons}>
                <button className={styles.cancelBtn} onClick={closeCropper}>Cancel</button>
                <button className={styles.confirmBtn} onClick={handleConfirmCrop}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.avatarContainer}>
            <img src={formData.avatar || "/default-avatar.png"} alt="User" />
            <label className={styles.avatarUploadOverlay}>
              📷 <input type="file" hidden accept="image/*" onChange={onFileChange} />
            </label>
          </div>
          <h3 className={styles.userName}>{formData.name}</h3>
          
          <span className={`${styles.subscriptionBadge} ${styles[`plan-${formData.subscription.plan.toLowerCase()}`] || styles['plan-free']}`}>
            {formData.subscription.plan}
          </span>

          <div className={styles.navMenu}>
             <button className={`${styles.navBtn} ${activeTab === "general" ? styles.navBtnActive : ""}`} onClick={() => setActiveTab("general")}>👤 General Info</button>
             <button className={`${styles.navBtn} ${activeTab === "gallery" ? styles.navBtnActive : ""}`} onClick={() => setActiveTab("gallery")}>🖼️ Photo Gallery</button>
             <button className={`${styles.navBtn} ${activeTab === "categories" ? styles.navBtnActive : ""}`} onClick={() => setActiveTab("categories")}>📋 Interests</button>
             <button className={`${styles.navBtn} ${activeTab === "security" ? styles.navBtnActive : ""}`} onClick={() => setActiveTab("security")}>🔒 Security</button>
          </div>
        </aside>

        <main className={styles.contentArea}>
          {activeTab === "general" && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitleWhite}>Matching & Personal Info</h2>
              <div className={styles.formGrid}>
                <div className={styles.field}><label>Full Name*</label><input value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} /></div>
                <div className={styles.field}><label>Phone</label><input value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} /></div>
                
                <div className={styles.field}><label>Country*</label>
                  <select value={formData.country} onChange={(e)=> {
                    const selected = countries.find(c => c.name === e.target.value);
                    setFormData({...formData, country: e.target.value, countryCode: selected?.isoCode || "", city: ""});
                  }}>
                    <option value="">Select Country</option>
                    {countries.map(c => <option key={c.isoCode} value={c.name}>{c.flag} {c.name}</option>)}
                  </select>
                </div>

                <div className={styles.field}><label>City*</label>
                  <select value={formData.city} onChange={(e)=>setFormData({...formData, city: e.target.value})}>
                    <option value="">Select City</option>
                    {cities.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Birthday*</label>
                  <div className={styles.birthdayRow}>
                    <input placeholder="DD" name="day" value={formData.birthday.day} onChange={handleBirthdayChange} />
                    <input placeholder="MM" name="month" value={formData.birthday.month} onChange={handleBirthdayChange} />
                    <input placeholder="YYYY" name="year" value={formData.birthday.year} onChange={handleBirthdayChange} />
                  </div>
                  {(errors.day || errors.month || errors.year || errors.age) && (
                     <span className={styles.errorText}>{errors.day || errors.month || errors.year || errors.age}</span>
                  )}
                </div>

                <div className={styles.field}><label>Gender*</label>
                   <select value={formData.gender} onChange={(e)=>setFormData({...formData, gender: e.target.value})}><option value="Male">Male</option><option value="Female">Female</option></select>
                </div>
                <div className={styles.field}><label>Looking For*</label>
                   <select value={formData.lookingFor} onChange={(e)=>setFormData({...formData, lookingFor: e.target.value})}><option value="Male">Male</option><option value="Female">Female</option></select>
                </div>
                
                <div className={`${styles.field} ${styles.fullWidth}`}><label>Bio</label>
                  <textarea rows="4" value={formData.bio} onChange={(e)=>setFormData({...formData, bio:e.target.value})} />
                </div>
              </div>
              <button className={styles.saveBtn} onClick={handleSaveGeneral} disabled={isSaving || Object.keys(errors).length > 0}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitleWhite}>Photo Gallery</h2>
              <div className={styles.galleryGrid}>
                {formData.gallery.map((img, i) => (
                  <div key={i} className={styles.galleryItem}>
                    <img src={img} alt="" />
                    <button className={styles.removeBtn} onClick={() => setFormData({...formData, gallery: formData.gallery.filter((_, idx) => idx !== i)})}>×</button>
                  </div>
                ))}
                {formData.gallery.length < 6 && (
                  <label className={styles.addPlaceholder}>
                    <span>+ Add Photo</span>
                    <input type="file" hidden accept="image/*" onChange={(e) => {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({...formData, gallery: [...formData.gallery, reader.result]});
                      reader.readAsDataURL(e.target.files[0]);
                    }} />
                  </label>
                )}
              </div>
              <button className={styles.saveBtn} onClick={handleSaveGallery}>Update Gallery</button>
            </div>
          )}

          {activeTab === "security" && (
            <form className={styles.card} onSubmit={handleUpdatePassword}>
              <h2 className={styles.sectionTitleWhite}>Change Password</h2>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fullWidth}`}><label>Current Password</label><input type="password" value={passwordData.currentPassword} onChange={(e)=>setPasswordData({...passwordData, currentPassword: e.target.value})} required /></div>
                <div className={styles.field}><label>New Password</label><input type="password" placeholder="8+ chars, A-Z, 0-9" value={passwordData.newPassword} onChange={(e)=>setPasswordData({...passwordData, newPassword: e.target.value})} required /></div>
                <div className={styles.field}><label>Confirm New Password</label><input type="password" value={passwordData.confirmPassword} onChange={(e)=>setPasswordData({...passwordData, confirmPassword: e.target.value})} required /></div>
              </div>
              <button type="submit" className={styles.saveBtn}>Update Password</button>
            </form>
          )}

          {activeTab === "categories" && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitleWhite}>My Interests</h2>
              <div className={styles.categoryContainer}>
                {Object.keys(formData.categories).length > 0 ? Object.keys(formData.categories).map(cat => (
                  <div key={cat} className={styles.catRow}>
                     <div className={styles.catInfo}>
                       <h4>{cat}</h4>
                       <span className={styles.statusBadge}>{formData.categories[cat].length} Answers</span>
                     </div>
                     <button className={styles.editBtn} onClick={()=>navigate(`/onboarding?category=${cat}`)}>Edit</button>
                  </div>
                )) : <p style={{color:'#94a3b8', textAlign:'center', padding:'20px'}}>No interests found.</p>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;