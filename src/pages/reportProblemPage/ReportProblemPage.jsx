import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoArrowBack, IoBug, IoWallet, IoPerson, IoAlertCircle, IoCheckmarkCircle } from "react-icons/io5";
import SEO from '../../components/seo/SEO';
import './ReportProblemPage.css';

const ReportProblemPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const categories = [
    { id: 'technical', label: 'Technical Issue', icon: <IoBug /> },
    { id: 'billing', label: 'Billing/Payment', icon: <IoWallet /> },
    { id: 'user', label: 'Report a User', icon: <IoPerson /> },
    { id: 'other', label: 'Something Else', icon: <IoAlertCircle /> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !description) return;

    setIsSubmitting(true);
    setError('');

    const reportData = {
      category,
      description,
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(reportData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setIsSuccess(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        <SEO
          title="Report Submitted | Unlock Me"
          description="Your report has been successfully submitted. We'll look into it shortly."
          keywords="report submitted, problem reported, support"
        />
        <div className="report-problem-page">
          <div className="report-problem-page__container report-problem-page__container--success">
            <span className="report-problem-page__success-icon-wrapper" aria-hidden="true">
              <IoCheckmarkCircle className="report-problem-page__icon-svg" />
            </span>
            <h2 className="report-problem-page__success-title">Thanks for your feedback!</h2>
            <p className="report-problem-page__success-message">We've received your report and will look into it shortly.</p>
            <button 
              className="report-problem-page__button report-problem-page__button--primary" 
              onClick={() => navigate("/")}
              aria-label="Go back to home page"
            >
              <span className="report-problem-page__button-text">Go Back</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Report a Problem | Unlock Me - Get Help"
        description="Report technical issues, billing problems, or user concerns. We're here to help and will address your issue promptly."
        keywords="report problem, technical support, customer service, help, bug report, billing issue, report user"
      />
      <div className="report-problem-page">
        <div className="report-problem-page__container">
          <button 
            className="report-problem-page__back-btn" 
            onClick={() => navigate(-1)}
            aria-label="Go back to previous page"
          >
            <span className="report-problem-page__back-icon-wrapper" aria-hidden="true">
              <IoArrowBack className="report-problem-page__icon-svg" />
            </span>
            <span className="report-problem-page__back-text">Back</span>
          </button>

          <h1 className="report-problem-page__title">Report a Problem</h1>
          <p className="report-problem-page__subtitle">We're sorry you're having trouble. Please tell us what happened.</p>

          <form className="report-problem-page__form" onSubmit={handleSubmit} aria-label="Report a problem form">
            
            <fieldset className="report-problem-page__fieldset">
              <legend className="report-problem-page__label">What kind of issue is it?</legend>
              <div className="report-problem-page__grid" role="radiogroup" aria-label="Issue category">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`report-problem-page__card ${category === cat.id ? 'report-problem-page__card--active' : ''}`}
                    onClick={() => setCategory(cat.id)}
                    aria-pressed={category === cat.id}
                    aria-label={`Select ${cat.label} as issue category`}
                  >
                    <div className="report-problem-page__card-icon-wrapper" aria-hidden="true">{cat.icon}</div>
                    <span className="report-problem-page__card-text">{cat.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="report-problem-page__form-group">
              <label htmlFor="description" className="report-problem-page__label">
                Describe the details <span className="report-problem-page__required" aria-label="required">*</span>
              </label>
              <textarea 
                id="description"
                className="report-problem-page__textarea" 
                placeholder={t("placeholders.reportDetail")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
                aria-required="true"
                aria-label="Describe the problem in detail"
              />
            </div>

            {error && (
              <div className="report-problem-page__error-message" role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <div className="report-problem-page__actions">
              <button 
                type="submit" 
                className="report-problem-page__button report-problem-page__button--primary" 
                disabled={!category || !description || isSubmitting}
                aria-label={isSubmitting ? 'Submitting report' : 'Submit report'}
              >
                <span className="report-problem-page__button-text">
                  {isSubmitting ? 'Sending...' : 'Submit Report'}
                </span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default ReportProblemPage;