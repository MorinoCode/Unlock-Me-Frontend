import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Calendar, DollarSign, MapPin, Image as ImageIcon, AlignLeft } from "lucide-react";
import "./CreateDateModal.css";

const CreateDateModal = ({ onClose, onCreate, loading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    category: "coffee",
    dateTime: "",
    city: "",
    generalArea: "",
    exactAddress: "",
    paymentType: "split",
    genderPref: "other", // Changed default
    minAge: 18,
    maxAge: 50,
    description: "" // Added description
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setImageFile(file);
          setPreviewUrl(URL.createObjectURL(file));
      }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = { ...formData };
    if (imageFile) submissionData.image = imageFile;
    onCreate(submissionData);
  };

  return (
    <div className="create-date-overlay" onClick={onClose}>
      <div className="create-date-modal" onClick={e => e.stopPropagation()}>
        <div className="create-date-header">
            <h2>{t("createDate.title")}</h2>
            <button type="button" className="create-date-close-btn" onClick={onClose} aria-label={t("common.close")}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="create-date-form">
            
            <div className="create-date-group">
                <label className="image-upload-label">
                    {previewUrl ? (
                        <div className="image-preview-wrapper">
                            <img src={previewUrl} alt="Preview" className="date-image-preview"/>
                            <div className="image-preview-overlay">
                                <span>{t("createDate.changePhoto")}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="image-upload-placeholder">
                            <ImageIcon size={28} />
                            <span>{t("createDate.addCoverPhoto")}</span>
                        </div>
                    )}
                    <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                </label>
            </div>

            <div className="create-date-group">
                <label>{t("createDate.iWantToGoFor")}</label>
                <div className="select-wrapper">
                    <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="coffee">☕ Coffee</option>
                        <option value="food">🍽️ Food</option>
                        <option value="drink">🍷 Drinks</option>
                        <option value="movie">🎬 Movie</option>
                        <option value="activity">🏃 Activity</option>
                    </select>
                </div>
            </div>

            <div className="create-date-group">
                <label>{t("createDate.titleLabel")}</label>
                <input required name="title" placeholder={t("createDate.titlePlaceholder")} value={formData.title} onChange={handleChange}/>
            </div>

            <div className="create-date-group">
                <label>{t("createDate.when")}</label>
                <div className="input-with-icon">
                    <Calendar size={18} />
                    <input required type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleChange}/>
                </div>
            </div>

            <div className="create-date-row">
                <div className="create-date-group">
                    <label>{t("createDate.city")}</label>
                    <input required name="city" placeholder={t("createDate.cityPlaceholder")} value={formData.city} onChange={handleChange}/>
                </div>
                <div className="create-date-group">
                    <label>{t("createDate.areaPublic")}</label>
                    <input required name="generalArea" placeholder={t("createDate.areaPlaceholder")} value={formData.generalArea} onChange={handleChange}/>
                </div>
            </div>

            <div className="create-date-group">
                <label>{t("createDate.exactAddress")}</label>
                <input required name="exactAddress" placeholder={t("createDate.exactAddressPlaceholder")} value={formData.exactAddress} onChange={handleChange}/>
            </div>

            <div className="create-date-row">
                <div className="create-date-group">
                    <label>{t("createDate.payment")}</label>
                    <select name="paymentType" value={formData.paymentType} onChange={handleChange}>
                        <option value="split">{t("createDate.split5050")}</option>
                        <option value="me">{t("createDate.illPay")}</option>
                        <option value="you">{t("createDate.youPay")}</option>
                    </select>
                </div>
                <div className="create-date-group">
                    <label>{t("createDate.lookingFor")}</label>
                    <select name="genderPref" value={formData.genderPref} onChange={handleChange}>
                        <option value="other">{t("createDate.everyoneOther")}</option>
                        <option value="male">{t("createDate.men")}</option>
                        <option value="female">{t("createDate.women")}</option>
                    </select>
                </div>
            </div>

            <div className="create-date-group">
                <label>{t("createDate.descriptionOptional")}</label>
                <div className="textarea-wrapper">
                    <AlignLeft size={18} className="textarea-icon" />
                    <textarea 
                        name="description" 
                        placeholder={t("createDate.descriptionPlaceholder")} 
                        value={formData.description} 
                        onChange={handleChange}
                        className="create-date-textarea"
                        rows={3}
                    />
                </div>
            </div>

            <button type="submit" className="create-date-submit-btn" disabled={loading}>
                {loading ? t("createDate.publishing") : t("createDate.postInvite")}
            </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDateModal;