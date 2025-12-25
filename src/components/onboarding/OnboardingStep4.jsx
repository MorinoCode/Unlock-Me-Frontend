import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import "./onboardingSteps.css";

const OnboardingStep4 = ({ formData, setFormData, onNext, onBack, loading }) => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

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

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));
    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
      0, 0, pixelCrop.width, pixelCrop.height
    );
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg"));
  };

  const handleConfirmCrop = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      setFormData({ ...formData, avatar: croppedImageBlob });
      setShowCropper(false);
    } catch (e) {
      console.error(e);
    }
  };

  const isNextDisabled = !formData.avatar;

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">Upload profile picture</h2>
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
              onChange={(e) => setZoom(e.target.value)} 
              className="onboarding-step__range-input"
            />
            <button className="onboarding-step__btn onboarding-step__btn--confirm" onClick={handleConfirmCrop}>Confirm Crop</button>
          </div>
        </div>
      ) : (
        <label className="onboarding-step__upload-wrapper">
          <input type="file" accept="image/*" onChange={onFileChange} hidden className="onboarding-step__file-input" />
          {!formData.avatar ? (
            <span className="onboarding-step__upload-placeholder">Choose Photo</span>
          ) : (
            <div className="onboarding-step__preview-wrapper">
              <img src={URL.createObjectURL(formData.avatar)} alt="Preview" className="onboarding-step__preview-image" />
              <span className="onboarding-step__change-text">Change Photo</span>
            </div>
          )}
        </label>
      )}

      {!showCropper && (
        <div className="onboarding-step__actions">
          <button className="onboarding-step__btn onboarding-step__btn--secondary" onClick={onBack}>Back</button>
          <button 
            onClick={onNext} 
            disabled={isNextDisabled || loading} 
            className="onboarding-step__btn onboarding-step__btn--primary"
          >
            {loading ? "Saving..." : "Finish"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingStep4;