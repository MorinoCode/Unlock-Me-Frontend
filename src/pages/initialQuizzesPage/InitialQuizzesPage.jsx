import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import "./InitialQuizzesPage.css";

const MultiStepOnboarding = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    birthday: { day: "", month: "", year: "" },
    avatar: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ day: false, month: false, year: false });

  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const storedUser = localStorage.getItem("unlock-me-user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const name = parsedUser?.name ? parsedUser.name.charAt(0).toUpperCase() + parsedUser.name.slice(1) : "User";

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
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg"));
  };

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
      if (age < 12 || age > 100) newErrors.age = "Age must be 12-100";
    }
    return newErrors;
  };

  const handleBirthdayChange = (e) => {
    const { name, value } = e.target;
    if (value !== "" && !/^\d+$/.test(value)) return;
    const updatedBirthday = { ...formData.birthday, [name]: value };
    setFormData({ ...formData, birthday: updatedBirthday });
    setTouched({ ...touched, [name]: true });
    setErrors(validateBirthday(updatedBirthday));
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImage(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      setFormData({ ...formData, avatar: croppedImageBlob });
      setShowCropper(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      let endpoint = step === 1 ? "birthday" : "avatar";
      let body;
      if (step === 1) body = JSON.stringify({ birthday: formData.birthday });
      else {
        body = new FormData();
        body.append("avatar", formData.avatar);
      }

      const res = await fetch(`${API_URL}/api/user/onboarding/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: body instanceof FormData ? {} : { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error("Failed");
      if (step === 1) setStep(2);
      else navigate("/initial-quizzes/interests");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isNextDisabled =
    loading ||
    (step === 1 && Object.keys(validateBirthday(formData.birthday)).length > 0) ||
    (step === 2 && !formData.avatar);

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        {step === 1 && (
          <div className="step-content">
            <h2>{`${name}, When were you born?`}</h2>
            <div className="birthday-inputs">
              {["day", "month", "year"].map((f) => (
                <div key={f}>
                  <input
                    name={f}
                    placeholder={f === "day" ? "DD" : f === "month" ? "MM" : "YYYY"}
                    value={formData.birthday[f]}
                    onChange={handleBirthdayChange}
                    onBlur={() => setTouched({ ...touched, [f]: true })}
                    className="onboarding-input"
                    autoFocus={f === "day"}
                  />
                  {touched[f] && errors[f] && <span className="error-text">{errors[f]}</span>}
                </div>
              ))}
            </div>
            {errors.age && <span className="error-text-age">{errors.age}</span>}
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2>Upload profile picture</h2>
            {showCropper ? (
              <div className="cropper-container">
                <div className="crop-area">
                  <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className="cropper-controls">
                  <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} />
                  <button className="confirm-btn" onClick={handleConfirmCrop}>Confirm Crop</button>
                </div>
              </div>
            ) : (
              <label className="upload-wrapper">
                <input type="file" accept="image/*" onChange={onFileChange} hidden />
                {!formData.avatar ? (
                  <span className="upload-btn">Choose Photo</span>
                ) : (
                  <div className="avatar-preview-wrapper">
                    <img src={URL.createObjectURL(formData.avatar)} alt="Preview" className="avatar-preview" />
                    <span className="change-photo">Change Photo</span>
                  </div>
                )}
              </label>
            )}
          </div>
        )}

        {!showCropper && (
          <div className="onboarding-actions">
            <button onClick={handleNext} disabled={isNextDisabled} className="next-btn">
              {loading ? "Saving..." : step === 2 ? "Finish" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiStepOnboarding;