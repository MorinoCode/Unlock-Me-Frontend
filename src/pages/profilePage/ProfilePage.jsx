import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth.js";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";
import { Mic, Square, Trash2, ShieldCheck, User as UserIcon, Image as ImageIcon, LayoutGrid, Plus, X, Heart, Film, Utensils, Trophy, AlertTriangle } from "lucide-react";
import { useProfileStore } from "../../store/profileStore";
import { useLocationsStore } from "../../store/locationsStore";
import { usePlansStore } from "../../store/plansStore";
import { useInterestsOptionsStore } from "../../store/interestsOptionsStore";
import { useQuestionsStore } from "../../store/questionsStore";
import { useUserInterestsStore } from "../../store/userInterestsStore";
import "./ProfilePage.css";
import { useNavigate } from "react-router-dom";

const mapProfileToFormData = (data) => {
  if (!data) return null;
  const loadedLocation = data.location || { type: "Point", coordinates: [0, 0] };
  return {
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
    subscription: data.subscription || { plan: "free", status: "active", expiresAt: null },
    categories: data.questionsbycategoriesResults?.categories || {},
    voiceIntro: data.voiceIntro || "",
    location: loadedLocation,
  };
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const { currentUser, checkAuth } = useAuth();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate()
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

  const interestsOptionsList = useInterestsOptionsStore((s) => s.list);
  const allInterestOptions = Array.isArray(interestsOptionsList) ? interestsOptionsList : [];
  const getInterestsCached = useInterestsOptionsStore((s) => s.getCached);
  const fetchInterestsOptions = useInterestsOptionsStore((s) => s.fetchInterestsOptions);
  const [isAddingInterest, setIsAddingInterest] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedNewCat, setSelectedNewCat] = useState("");
  const getQuestionsCached = useQuestionsStore((s) => s.getCached);
  const fetchQuestions = useQuestionsStore((s) => s.fetchQuestions);
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

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const getPlansCached = usePlansStore((s) => s.getCached);
  const fetchPlans = usePlansStore((s) => s.fetchPlans);

  const locationsList = useLocationsStore((s) => s.list);
  const availableLocations = Array.isArray(locationsList) ? locationsList : [];
  const getLocationsCached = useLocationsStore((s) => s.getCached);
  const fetchLocations = useLocationsStore((s) => s.fetchLocations);
  const getGeocodeCached = useLocationsStore((s) => s.getGeocodeCached);
  const fetchGeocode = useLocationsStore((s) => s.fetchGeocode);
  const [cities, setCities] = useState([]);
  const [initialCityLoaded, setInitialCityLoaded] = useState(false);
  const fetchFullProfileRef = useRef(null);

  const getCoordinatesFromCityCountry = useCallback(async (city, country) => {
    if (!city || !country) return null;
    const cached = getGeocodeCached(city, country);
    if (cached) return cached;
    return fetchGeocode(API_URL, city, country, true) ?? null;
  }, [API_URL, getGeocodeCached, fetchGeocode]);

  /* Update GPS location when country or city changes */
  const updateGeoLocationFromCityCountry = useCallback(async (city, country) => {
    if (!city || !country) return;
    
    const coords = await getCoordinatesFromCityCountry(city, country);
    if (coords) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          type: "Point",
          coordinates: [coords.longitude, coords.latitude]
        }
      }));
    } else {
      // Fallback: try browser geolocation if geocoding fails
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
          (error) => console.error("Geolocation error:", error),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    }
  }, [getCoordinatesFromCityCountry]);

  useEffect(() => {
    const cached = getLocationsCached();
    if (cached) return;
    fetchLocations(API_URL, true);
  }, [API_URL, getLocationsCached, fetchLocations]);

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

  const applyProfileToState = useCallback((data) => {
    const next = mapProfileToFormData(data);
    if (next) setFormData(next);
    if (data?.voiceIntro?.trim()) setAudioURL(data.voiceIntro);
    else setAudioURL("");
    const loc = data?.location || { coordinates: [0, 0] };
    const hasInvalidCoords = !loc.coordinates || loc.coordinates[0] === 0 || loc.coordinates[1] === 0;
    if (hasInvalidCoords && data?.location?.country && data?.location?.city) {
      setTimeout(() => updateGeoLocationFromCityCountry(data.location.city, data.location.country), 500);
    }
  }, [updateGeoLocationFromCityCountry]);

  useEffect(() => {
    const userId = currentUser?._id;
    if (!userId) return;

    const { getCached, fetchProfile, getState } = useProfileStore.getState();
    const key = `profile:${userId}`;
    const cached = getCached(userId);

    const applyFromStore = () => {
      const entry = getState().cache[key];
      if (entry?.profile) applyProfileToState(entry.profile);
    };

    if (cached) {
      applyProfileToState(cached.profile);
      setLoading(false);
      fetchProfile(API_URL, userId, true).then(applyFromStore);
    } else {
      setLoading(true);
      fetchProfile(API_URL, userId, false).then(() => {
        applyFromStore();
        setLoading(false);
      }).catch(() => setLoading(false));
    }

    fetchFullProfileRef.current = async () => {
      useProfileStore.getState().invalidate(userId);
      await useProfileStore.getState().fetchProfile(API_URL, userId, false);
      applyFromStore();
    };
  }, [currentUser?._id, API_URL, applyProfileToState]);

  // Detect best-supported audio mime type for cross-browser recording
  const getSupportedAudioMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4",
      "audio/mpeg"
    ];

    if (typeof window !== "undefined" && window.MediaRecorder && typeof MediaRecorder.isTypeSupported === "function") {
      for (const type of candidates) {
        if (MediaRecorder.isTypeSupported(type)) return type;
      }
    }
    return "";
  };

  const startRecording = async () => {
    try {
      // Basic feature detection for older browsers / iOS
      if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === "undefined") {
        toast.error(t("profile.voiceIntro.micDenied"));
        return;
      }

      // Clear previous voice if it exists (from Cloudinary, not blob URLs)
      // The backend will handle deleting the old voice from Cloudinary when we save the new one
      setAudioURL((prevUrl) => {
        // Only clear if it's a Cloudinary URL (not a blob URL from previous recording)
        if (prevUrl && !prevUrl.startsWith("blob:")) {
          // This is a Cloudinary URL - clear it as we're recording a new voice
          return "";
        }
        // If it's a blob URL, revoke it to avoid memory leaks
        if (prevUrl && prevUrl.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(prevUrl);
          } catch {
            // ignore revoke errors
          }
        }
        return "";
      });
      
      // Clear formData voiceIntro to prepare for new recording
      setFormData(prev => ({ ...prev, voiceIntro: "" }));

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      const recorderOptions = mimeType ? { mimeType } : undefined;

      mediaRecorderRef.current = new MediaRecorder(stream, recorderOptions);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blobType = mimeType || mediaRecorderRef.current?.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });

        const newUrl = URL.createObjectURL(audioBlob);
        setAudioURL(newUrl);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, voiceIntro: reader.result }));
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // 10-second recording limit
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
      toast.error(t("profile.voiceIntro.micDenied"));
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

  const deleteVoice = async () => {
    // Revoke blob URL if it exists
    if (audioURL && audioURL.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(audioURL);
      } catch {
        // ignore revoke errors
      }
    }
    
    setAudioURL("");
    setFormData(prev => ({ ...prev, voiceIntro: "" }));
    setRecordingDuration(0);
    
    // Delete voice from backend
    try {
      const res = await fetch(`${API_URL}/api/user/profile/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ voiceIntro: "" }),
      });
      
      if (res.ok) {
        // Refresh profile to ensure state is synced
        if (fetchFullProfileRef.current) {
          await fetchFullProfileRef.current();
        }
      }
    } catch (err) {
      console.error("Voice delete error:", err);
    }
  };

  const handleSaveVoice = async () => {
    if (!formData.voiceIntro) {
      toast.error(t("profile.voiceIntro.failedToSave"));
      return;
    }
    
    setIsSaving(true);
    const loadingToast = toast.loading(t("profile.voiceIntro.uploading"));
    
    try {
      const res = await fetch(`${API_URL}/api/user/profile/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ voiceIntro: formData.voiceIntro }),
      });
      
      toast.dismiss(loadingToast);
      
      if (res.ok) {
        toast.success(t("profile.voiceIntro.saved"));
        
        // Revoke blob URL if it exists (we'll get the Cloudinary URL from fetchFullProfile)
        if (audioURL && audioURL.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(audioURL);
          } catch {
            // ignore revoke errors
          }
        }
        
        // Refresh profile to get the new Cloudinary URL
        await checkAuth();
        if (fetchFullProfileRef.current) {
          await fetchFullProfileRef.current();
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || t("profile.voiceIntro.failedToSave"));
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(t("profile.voiceIntro.failedToSave"));
      console.error("Voice save error:", err);
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
        const newFormData = { ...formData, avatar: croppedImageBase64 };
        setFormData(newFormData);
        setShowCropper(false);
        /* Auto-save avatar – no need to click Save Changes */
        setIsSaving(true);
        const loadingToast = toast.loading(t("profile.toasts.updatingPhoto"));
        try {
          const res = await fetch(`${API_URL}/api/user/profile/info`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              ...newFormData,
              location: {
                ...newFormData.location,
                country: newFormData.country,
                city: newFormData.city,
                countryCode: newFormData.countryCode
              }
            }),
          });
          if (res.ok) {
            toast.dismiss(loadingToast);
            toast.success(t("profile.toasts.avatarUpdated"));
            await checkAuth();
          } else {
            toast.dismiss(loadingToast);
            toast.error(t("profile.toasts.errorUpdating"));
          }
        } catch (err) {
          toast.dismiss(loadingToast);
          toast.error(t("profile.toasts.errorUpdating"));
          console.error(err);
        } finally {
          setIsSaving(false);
        }
      } else {
        setFormData({ ...formData, gallery: [...formData.gallery, croppedImageBase64] });
        setShowCropper(false);
      }
    } catch (e) { console.error(e); }
  };

  const fetchAllInterestOptions = async () => {
    setEditingCategory(null);
    const cached = getInterestsCached();
    if (!cached) await fetchInterestsOptions(API_URL, false);
    setIsAddingInterest(true);
    setSelectedNewCat("");
    setNewCatQuestions([]);
    setNewAnswers({});
  };

  const handleCategorySelect = async (categoryName) => {
    setSelectedNewCat(categoryName);
    if (!categoryName) return setNewCatQuestions([]);
    fetchQuestionsForCategory(categoryName);
  };

  const fetchQuestionsForCategory = async (categoryName) => {
    const categories = [categoryName];
    const cached = getQuestionsCached(categories);
    if (cached) {
      setNewCatQuestions(cached);
      return cached;
    }
    await fetchQuestions(API_URL, categories, true);
    const fresh = getQuestionsCached(categories);
    if (fresh) {
      setNewCatQuestions(fresh);
      return fresh;
    }
    return [];
  };

  const handleStartEdit = async (catName) => {
    if (editingCategory === catName) { setEditingCategory(null); return; }
    setIsAddingInterest(false);
    setEditingCategory(catName);
    setNewAnswers({});
    const loadingToast = toast.loading(t("profile.interests.loadingQuestions"));
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
    if (quizResults.length < totalQuestions) return toast.error(t("profile.interests.answerAll"));
    setIsSaving(true);
    const loadingToast = toast.loading(t("profile.interests.saving"));
    try {
      const res = await fetch(`${API_URL}/api/user/onboarding/saveUserInterestCategoriesQuestinsAnswer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quizResults }),
      });
      if (res.ok) {
        useUserInterestsStore.getState().invalidate();
        toast.dismiss(loadingToast);
        toast.success(t("profile.interests.updated"));
        window.location.reload();
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(t("profile.interests.failedToSave"));
      console.log(err);
    } finally { setIsSaving(false); }
  };

  const handleBirthdayChange = (e) => {
    const { name, value } = e.target;
    if (value !== "" && !/^\d+$/.test(value)) return;
    setFormData((prev) => ({ ...prev, birthday: { ...prev.birthday, [name]: value } }));
  };

  const handleSaveGeneral = async () => {
    // Validate required fields
    if (!formData.country || !formData.city) {
      toast.error(t("profile.toasts.errorUpdating"));
      return;
    }

    setIsSaving(true);
    const loadingToast = toast.loading(t("profile.toasts.updatingProfile"));
    try {
      // Ensure location object includes all required fields
      const locationData = {
        type: formData.location?.type || "Point",
        coordinates: formData.location?.coordinates || [0, 0],
        country: formData.country,
        city: formData.city,
        countryCode: formData.countryCode || ""
      };

      const res = await fetch(`${API_URL}/api/user/profile/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          phone: formData.phone,
          gender: formData.gender,
          lookingFor: formData.lookingFor,
          birthday: formData.birthday,
          country: formData.country,
          city: formData.city,
          countryCode: formData.countryCode,
          location: locationData
        }),
      });
      
      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success(t("profile.toasts.profileUpdated"));
        // Refresh user data to ensure location is updated in context
        await checkAuth();
        // Also refresh profile to sync formData
        if (fetchFullProfileRef.current) {
          await fetchFullProfileRef.current();
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.dismiss(loadingToast);
        toast.error(errorData.message || t("profile.toasts.errorUpdating"));
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(t("profile.toasts.errorUpdating"));
      console.error("Save profile error:", err);
    } finally { setIsSaving(false); }
  };

  const handleSaveGallery = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading(t("profile.gallery.updating"));
    try {
      const res = await fetch(`${API_URL}/api/user/profile/gallery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ images: formData.gallery }),
      });
      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success(t("profile.gallery.updated"));
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(t("profile.gallery.failedToUpdate"));
      console.log(err);
    } finally { setIsSaving(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error(t("profile.security.changePassword.passwordsDoNotMatch"));
    const loadingToast = toast.loading(t("profile.security.changePassword.changing"));
    try {
      const res = await fetch(`${API_URL}/api/user/profile/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(passwordData),
      });
      toast.dismiss(loadingToast);
      if (res.ok) {
        toast.success(t("profile.security.changePassword.changed"));
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json();
        toast.error(err.message || t("common.error"));
      }
    } catch (err) { toast.dismiss(loadingToast); toast.error(t("errors.serverError")); console.log(err);}
  };
  
  

  useEffect(() => {
    if (activeTab !== "security") return;
    if (getPlansCached("")) return;
    fetchPlans(API_URL, "", true);
  }, [activeTab, API_URL, getPlansCached, fetchPlans]);

  // Cancel subscription
  const handleCancelSubscription = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading(t("profile.security.subscription.canceling"));
    try {
      const res = await fetch(`${API_URL}/api/payment/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      toast.dismiss(loadingToast);
      
      if (res.ok) {
        toast.success(t("profile.security.subscription.canceledSuccess"));
        setShowCancelConfirm(false);
        await checkAuth();
        if (fetchFullProfileRef.current) {
          await fetchFullProfileRef.current();
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || t("profile.security.subscription.cancelFailed"));
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(t("profile.security.subscription.cancelFailed"));
      console.error("Cancel subscription error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Change plan
  const handleChangePlan = async (priceId, planName) => {
    setIsSaving(true);
    const loadingToast = toast.loading(t("profile.security.subscription.loading"));
    try {
      const res = await fetch(`${API_URL}/api/payment/change-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ priceId, planName }),
      });
      
      toast.dismiss(loadingToast);
      
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || t("common.error"));
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(t("common.error"));
      console.error("Change plan error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading(t("profile.security.dangerZone.deleting"));
    try {
      const res = await fetch(`${API_URL}/api/user/profile/delete-account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success(t("profile.security.dangerZone.deleted"));
        navigate("/");
      } else {
        const err = await res.json();
        toast.dismiss(loadingToast);
        toast.error(err.message || t("profile.security.dangerZone.failedToDelete"));
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(t("profile.security.dangerZone.serverError"));
      console.error(err);
    } finally {
      setIsSaving(false);
      setShowDeleteConfirm(false);
    }
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
                <button className="pp-btn pp-btn--secondary" onClick={() => setShowCropper(false)}>{t("profile.cropper.cancel")}</button>
                <button className="pp-btn pp-btn--primary" onClick={handleConfirmCrop}>{t("profile.cropper.confirm")}</button>
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
              <button className={`pp-nav__item ${activeTab === "general" ? "active" : ""}`} onClick={() => setActiveTab("general")}><UserIcon size={18} /> {t("profile.tabs.general")}</button>
              <button className={`pp-nav__item ${activeTab === "voice" ? "active" : ""}`} onClick={() => setActiveTab("voice")}><Mic size={18} /> {t("profile.tabs.voice")}</button>
              <button className={`pp-nav__item ${activeTab === "gallery" ? "active" : ""}`} onClick={() => setActiveTab("gallery")}><ImageIcon size={18} /> {t("profile.tabs.gallery")}</button>
              <button className={`pp-nav__item ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}><LayoutGrid size={18} /> {t("profile.tabs.interests")}</button>
              <button className={`pp-nav__item ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}><ShieldCheck size={18} /> {t("profile.tabs.security")}</button>
            </nav>
          </aside>

          <main className="pp-main">
            {activeTab === "general" && (
              <section className="pp-section">
                <h2 className="pp-title">{t("profile.personalInfo.title")}</h2>
                <div className="pp-form-grid">
                  <div className="pp-form-group">
                    <label>{t("profile.personalInfo.fullName")}*</label>
                    <input className="pp-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="pp-form-group">
                    <label>{t("profile.personalInfo.phone")}</label>
                    <input className="pp-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="pp-form-group">
                    <label>{t("profile.personalInfo.country")}*</label>
                    <select className="pp-select" value={formData.country} onChange={async (e) => {
                      const selected = availableLocations.find((c) => c.country === e.target.value);
                      const cityList = selected ? selected.cities : [];
                      const newCity = cityList.length > 0 ? cityList[0] : "";
                      setCities(cityList);
                      const newFormData = { 
                        ...formData, 
                        country: e.target.value, 
                        countryCode: selected?.countryCode || "", 
                        city: newCity
                      };
                      setFormData(newFormData);
                      // Auto-update GPS location when country changes
                      if (e.target.value && newCity) {
                        await updateGeoLocationFromCityCountry(newCity, e.target.value);
                      }
                    }}>
                      <option value="">{t("profile.personalInfo.selectCountry")}</option>
                      {availableLocations.map((loc) => <option key={loc.countryCode} value={loc.country}>{loc.country}</option>)}
                    </select>
                  </div>
                  <div className="pp-form-group">
                    <label>{t("profile.personalInfo.city")}*</label>
                    <select className="pp-select" value={formData.city} onChange={async (e) => {
                      const newCity = e.target.value;
                      const newFormData = { ...formData, city: newCity };
                      setFormData(newFormData);
                      // Auto-update GPS location when city changes
                      if (newCity && formData.country) {
                        await updateGeoLocationFromCityCountry(newCity, formData.country);
                      }
                    }} disabled={!formData.countryCode || cities.length === 0}>
                      <option value="">{cities.length === 0 && formData.countryCode ? t("common.loading") : t("profile.personalInfo.selectCity")}</option>
                      {cities.map((cityName, i) => <option key={i} value={cityName}>{cityName}</option>)}
                    </select>
                  </div>
                  <div className="pp-form-group pp-form-group--full">
                    <label>{t("profile.personalInfo.birthday")}*</label>
                    <div className="pp-date-row">
                      <input className="pp-input pp-input--center" placeholder={t("placeholders.birthdayDD")} name="day" value={formData.birthday.day} onChange={handleBirthdayChange} />
                      <input className="pp-input pp-input--center" placeholder={t("placeholders.birthdayMM")} name="month" value={formData.birthday.month} onChange={handleBirthdayChange} />
                      <input className="pp-input pp-input--center" placeholder={t("placeholders.birthdayYYYY")} name="year" value={formData.birthday.year} onChange={handleBirthdayChange} />
                    </div>
                  </div>
                  <div className="pp-form-group pp-form-group--full">
                    <label>{t("profile.personalInfo.bio")}</label>
                    <textarea className="pp-textarea" rows="4" placeholder={t("placeholders.bioPlaceholder")} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
                  </div>
                </div>
                <div className="pp-footer">
                  <button className="pp-btn pp-btn--primary" onClick={handleSaveGeneral} disabled={isSaving}>{t("profile.personalInfo.saveChanges")}</button>
                </div>
              </section>
            )}

            {activeTab === "voice" && (
              <section className="pp-section">
                <h2 className="pp-title">{t("profile.voiceIntro.title")}</h2>
                <p className="pp-desc">{t("profile.voiceIntro.description")}</p>
                <div className="pp-voice-box">
                  <div className={`pp-mic-circle ${isRecording ? 'recording' : ''}`}>
                    {!isRecording ? (
                      <button className="pp-mic-btn" onClick={startRecording}><Mic size={36} /></button>
                    ) : (
                      <button className="pp-mic-btn stop" onClick={stopRecording}><Square size={36} /></button>
                    )}
                  </div>
                  <div className="pp-timer">{recordingDuration}{t("profile.voiceIntro.timer")}</div>
                  {audioURL && (
                    <div className="pp-audio-player">
                      <audio src={audioURL} controls className="pp-audio-el" />
                      <button className="pp-del-btn" onClick={deleteVoice}><Trash2 size={20} /></button>
                    </div>
                  )}
                </div>
                <div className="pp-footer">
                   <button className="pp-btn pp-btn--primary pp-btn--full" onClick={handleSaveVoice} disabled={isSaving || !formData.voiceIntro}>{t("profile.voiceIntro.uploadVoice")}</button>
                </div>
              </section>
            )}

            {activeTab === "gallery" && (
              <section className="pp-section">
                <h2 className="pp-title">{t("profile.gallery.title")}</h2>
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
                      <span>{t("profile.gallery.addPhoto")}</span>
                      <input type="file" hidden accept="image/*" onChange={(e) => onFileChange(e, "gallery")} />
                    </label>
                  )}
                </div>
                <div className="pp-footer">
                  <button className="pp-btn pp-btn--primary" onClick={handleSaveGallery}>{t("profile.gallery.saveGallery")}</button>
                </div>
              </section>
            )}

            {activeTab === "categories" && (
              <section className="pp-section">
                <h2 className="pp-title">{t("profile.interests.title")}</h2>
                <div className="pp-interests-list">
                  {Object.keys(formData.categories).map((cat) => (
                    <div key={cat} className={`pp-interest-card ${editingCategory === cat ? 'active' : ''}`}>
                      <div className="pp-int-header">
                        <div className="pp-int-info">
                          <div className="pp-int-icon">{getInterestIcon(cat)}</div>
                          <div>
                            <h4>{cat}</h4>
                            <span>{formData.categories[cat].length} {t("profile.interests.answers")}</span>
                          </div>
                        </div>
                        <button className="pp-int-edit" onClick={() => handleStartEdit(cat)}>{editingCategory === cat ? <X size={18} /> : t("profile.interests.edit")}</button>
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
                            <button className="pp-btn pp-btn--primary" onClick={() => submitInterest(cat)} disabled={isSaving}>{t("common.save")}</button>
                            <button className="pp-btn pp-btn--secondary" onClick={() => setEditingCategory(null)}>{t("common.cancel")}</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pp-add-interest-area">
                  {!isAddingInterest ? (
                    <button className="pp-add-new-btn" onClick={fetchAllInterestOptions}><Plus size={20} /> {t("profile.interests.addNew")}</button>
                  ) : (
                    <div className="pp-new-interest-box">
                      <select className="pp-select" value={selectedNewCat} onChange={(e) => handleCategorySelect(e.target.value)}>
                        <option value="">-- {t("profile.interests.chooseCategory")} --</option>
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
                        {selectedNewCat && <button className="pp-btn pp-btn--primary" onClick={() => submitInterest(selectedNewCat)}>{t("profile.interests.confirmAndAdd")}</button>}
                        <button className="pp-btn pp-btn--secondary" onClick={() => setIsAddingInterest(false)}>{t("common.cancel")}</button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "security" && (
              <div className="pp-security-container">
                {/* Manage Subscription Section */}
                <section className="pp-section">
                  <h2 className="pp-title">{t("profile.security.subscription.title")}</h2>
                  {formData.subscription?.plan && formData.subscription.plan !== "free" ? (
                    <div className="pp-subscription-info">
                      <div className="pp-subscription-row">
                        <span className="pp-subscription-label">{t("profile.security.subscription.currentPlan")}:</span>
                        <span className="pp-subscription-value pp-subscription-value--plan">{formData.subscription.plan.toUpperCase()}</span>
                      </div>
                      <div className="pp-subscription-row">
                        <span className="pp-subscription-label">{t("profile.security.subscription.planStatus")}:</span>
                        <span className={`pp-subscription-value pp-subscription-value--${formData.subscription.status || "active"}`}>
                          {formData.subscription.status === "canceled" 
                            ? t("profile.security.subscription.canceled")
                            : formData.subscription.status === "expired"
                            ? t("profile.security.subscription.expired")
                            : t("profile.security.subscription.active")}
                        </span>
                      </div>
                      {formData.subscription.expiresAt && (
                        <div className="pp-subscription-row">
                          <span className="pp-subscription-label">{t("profile.security.subscription.expiresAt")}:</span>
                          <span className="pp-subscription-value">
                            {new Date(formData.subscription.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {formData.subscription.expiresAt && (
                        <div className="pp-subscription-row">
                          <span className="pp-subscription-label">{t("profile.security.subscription.renewedAt")}:</span>
                          <span className="pp-subscription-value">
                            {formData.subscription.expiresAt 
                              ? new Date(new Date(formData.subscription.expiresAt).getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                              : t("profile.security.subscription.never")}
                          </span>
                        </div>
                      )}
                      <div className="pp-subscription-actions">
                        {formData.subscription.status === "active" && (
                          <button 
                            className="pp-btn pp-btn--secondary" 
                            onClick={() => setShowCancelConfirm(true)}
                            disabled={isSaving}
                          >
                            {t("profile.security.subscription.cancelSubscription")}
                          </button>
                        )}
                        <button 
                          className="pp-btn pp-btn--primary" 
                          onClick={() => navigate("/upgrade")}
                          disabled={isSaving}
                        >
                          {t("profile.security.subscription.changePlan")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pp-subscription-info">
                      <p className="pp-desc">{t("profile.security.subscription.noActiveSubscription")}</p>
                      <div className="pp-footer">
                        <button 
                          className="pp-btn pp-btn--primary" 
                          onClick={() => navigate("/upgrade")}
                        >
                          {t("profile.security.subscription.upgrade")}
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* Change Password Section */}
                <form className="pp-section" onSubmit={handleUpdatePassword}>
                  <h2 className="pp-title">{t("profile.security.changePassword.title")}</h2>
                  <div className="pp-form-grid">
                    <div className="pp-form-group pp-form-group--full">
                      <label>{t("profile.security.changePassword.currentPassword")}</label>
                      <input className="pp-input" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
                    </div>
                    <div className="pp-form-group">
                      <label>{t("profile.security.changePassword.newPassword")}</label>
                      <input className="pp-input" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />
                    </div>
                    <div className="pp-form-group">
                      <label>{t("profile.security.changePassword.confirmPassword")}</label>
                      <input className="pp-input" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required />
                    </div>
                  </div>
                  <div className="pp-footer">
                    <button type="submit" className="pp-btn pp-btn--primary">{t("profile.security.changePassword.updatePassword")}</button>
                  </div>
                </form>

                {/* Danger Zone Section */}
                <section className="pp-section pp-section--danger">
                  <div className="pp-danger-header">
                    <AlertTriangle className="pp-danger-icon" size={24} />
                    <h2 className="pp-title">{t("profile.security.dangerZone.title")}</h2>
                  </div>
                  <p className="pp-desc">
                    {t("profile.security.dangerZone.description")}
                  </p>
                  {showDeleteConfirm ? (
                    <div className="pp-delete-confirm">
                      <h3 className="pp-delete-confirm-title">{t("profile.security.dangerZone.confirmTitle")}</h3>
                      <p className="pp-delete-confirm-message">{t("profile.security.dangerZone.confirmMessage")}</p>
                      <p className="pp-delete-confirm-submessage">{t("profile.security.dangerZone.confirmSubMessage")}</p>
                      <div className="pp-delete-confirm-actions">
                        <button 
                          type="button" 
                          className="pp-btn pp-btn--danger" 
                          onClick={confirmDeleteAccount}
                          disabled={isSaving}
                        >
                          {t("profile.security.dangerZone.yesDelete")}
                        </button>
                        <button 
                          type="button" 
                          className="pp-btn pp-btn--secondary" 
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isSaving}
                        >
                          {t("profile.security.dangerZone.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pp-footer">
                      <button 
                        type="button" 
                        className="pp-btn pp-btn--danger" 
                        onClick={handleDeleteAccount}
                        disabled={isSaving}
                      >
                        {t("profile.security.dangerZone.deleteAccount")}
                      </button>
                    </div>
                  )}
                </section>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Cancel Subscription Confirmation Modal */}
      {showCancelConfirm && (
        <div className="pp-modal-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="pp-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="pp-modal-title">{t("profile.security.subscription.cancelConfirmTitle")}</h3>
            <p className="pp-modal-message">{t("profile.security.subscription.cancelConfirmMessage")}</p>
            <div className="pp-modal-actions">
              <button 
                className="pp-btn pp-btn--danger" 
                onClick={handleCancelSubscription}
                disabled={isSaving}
              >
                {t("profile.security.subscription.cancelConfirm")}
              </button>
              <button 
                className="pp-btn pp-btn--secondary" 
                onClick={() => setShowCancelConfirm(false)}
                disabled={isSaving}
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;