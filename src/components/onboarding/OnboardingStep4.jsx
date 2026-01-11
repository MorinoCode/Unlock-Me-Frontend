import React, { useState, useCallback, useEffect, useMemo } from "react";
import Cropper from "react-easy-crop";
import "./onboardingSteps.css";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // اجازه انتخاب فایل بزرگ (تا ۱۵ مگ) را بده، چون ما فشرده‌اش می‌کنیم

const OnboardingStep4 = ({ formData, setFormData, onNext, onBack, loading }) => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const previewUrl = useMemo(() => {
    if (formData.avatar) {
      // اگر آواتار قبلاً Blob شده باشد
      if (formData.avatar instanceof Blob) {
          return URL.createObjectURL(formData.avatar);
      }
      return formData.avatar;
    }
    return null;
  }, [formData.avatar]);

  useEffect(() => {
    return () => {
      if (previewUrl && formData.avatar instanceof Blob) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, formData.avatar]);

  const onFileChange = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // چک کردن سایز اولیه (فقط برای فایل‌های خیلی خیلی بزرگ)
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage("File is too large. Please choose a smaller one.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file");
        return;
      }

      setErrorMessage("");
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImage(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  }, []);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // ✅✅✅ بخش مهم: تابع بهینه‌سازی شده برای فشرده‌سازی و تغییر سایز
  const getCroppedImg = useCallback(async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));
    
    // 1. ساخت بوم (Canvas) با سایز فیکس شده (500x500)
    // این کار باعث می‌شود فایل ۱۱ مگابایتی به زیر ۱۰۰ کیلوبایت برسد!
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    
    // 2. رسم عکس برش خورده روی بوم ۵۰۰ پیکسلی
    ctx.drawImage(
      image,
      pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
      0, 0, 500, 500
    );
    
    // 3. خروجی WebP با کیفیت 80%
    return new Promise((resolve) => 
      canvas.toBlob((blob) => resolve(blob), "image/webp", 0.8)
    );
  }, []);

  const handleConfirmCrop = useCallback(async () => {
    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      // الان croppedImageBlob بسیار کم حجم است
      setFormData({ ...formData, avatar: croppedImageBlob });
      setShowCropper(false);
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to process image. Please try again.");
    }
  }, [image, croppedAreaPixels, formData, setFormData, getCroppedImg]);

  const handleZoomChange = useCallback((e) => {
    setZoom(Number(e.target.value));
  }, []);

  const isNextDisabled = !formData.avatar;

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">Upload profile picture</h2>
      
      {errorMessage && (
        <div className="onboarding-step__error-message" role="alert">
          {errorMessage}
        </div>
      )}

      {showCropper ? (
        <div className="onboarding-step__cropper-container">
          <div className="onboarding-step__crop-area">
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
          <div className="onboarding-step__cropper-controls">
            <input 
              type="range" 
              value={zoom} 
              min={1} 
              max={3} 
              step={0.1} 
              onChange={handleZoomChange}
              className="onboarding-step__range-input"
              aria-label="Zoom level"
            />
            <button 
              className="onboarding-step__btn onboarding-step__btn--confirm" 
              onClick={handleConfirmCrop}
            >
              Confirm Crop
            </button>
          </div>
        </div>
      ) : (
        <label className="onboarding-step__upload-wrapper">
          <input 
            type="file" 
            accept="image/*" 
            onChange={onFileChange} 
            hidden 
            className="onboarding-step__file-input"
            aria-label="Upload profile picture"
          />
          {!formData.avatar ? (
            <span className="onboarding-step__upload-placeholder">Choose Photo</span>
          ) : (
            <div className="onboarding-step__preview-wrapper">
              <img 
                src={previewUrl} 
                alt="Profile preview" 
                className="onboarding-step__preview-image" 
              />
              <span className="onboarding-step__change-text">Change Photo</span>
            </div>
          )}
        </label>
      )}

      {!showCropper && (
        <div className="onboarding-step__actions">
          <button 
            className="onboarding-step__btn onboarding-step__btn--secondary" 
            onClick={onBack}
          >
            Back
          </button>
          <button 
            onClick={onNext} 
            disabled={isNextDisabled || loading} 
            className="onboarding-step__btn onboarding-step__btn--primary"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="onboarding-step__spinner" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              "Finish"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingStep4;