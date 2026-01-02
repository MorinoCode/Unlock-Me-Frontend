import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";

import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
import InterestsHeader from "../../components/interestsHeader/InterestsHeader";
import InterestsGrid from "../../components/interestsGrid/InterestsGrid";
import InterestsActions from "../../components/interestsActions/InterestsActions";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";
import "./InitialQuizzesInterestsPage.css";

const InitialQuizzesInterestsPage = () => {
  const navigate = useNavigate();
  const { currentUser, checkAuth } = useAuth();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [interestOptions, setInterestOptions] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  
  const abortControllerRef = useRef(null);
  const submitInProgressRef = useRef(false);

  const name = useMemo(() => {
    const userName = currentUser?.username;
    return userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : "User";
  }, [currentUser?.name]);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setErrorMessage("Request timeout. Please refresh the page.");
        setLoading(false);
      }
    }, 15000);

    fetch(`${API_URL}/api/user/onboarding/interests-options`, {
      credentials: "include",
      signal: abortControllerRef.current.signal,
    })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error("Failed to fetch interests");
        return res.json();
      })
      .then((data) => {
        const options = data;
        setInterestOptions(Array.isArray(options) ? options : []);
        setErrorMessage("");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
          setErrorMessage("Failed to load interests. Please refresh.");
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [API_URL]);

  const toggleInterest = useCallback((label) => {
    setSelectedInterests((prev) => {
      if (prev.includes(label)) {
        return prev.filter((i) => i !== label);
      } else {
        if (prev.length < 3) {
          return [...prev, label];
        }
        return prev;
      }
    });
  }, []);

  const handleNext = useCallback(async () => {
    if (selectedInterests.length === 0 || submitting || submitInProgressRef.current) {
      return;
    }

    submitInProgressRef.current = true;
    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${API_URL}/api/user/onboarding/interests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selectedInterests }),
      });

      if (!res.ok) throw new Error("Request failed");
      
      await checkAuth();
      navigate("/initial-quizzes/questionsbycategory");
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage("Failed to save interests. Please try again.");
      setSubmitting(false);
      submitInProgressRef.current = false;
    }
  }, [selectedInterests, submitting, API_URL, checkAuth, navigate]);

  const isNextDisabled = submitting || selectedInterests.length < 3;

  return (
    <BackgroundLayout>
      {(loading || submitting) && (
        <HeartbeatLoader 
          text={submitting ? "Saving your interests..." : "Loading interests..."} 
        />
      )}

      <div className="interests-page__card">
        <div className="interests-page__header-wrapper">
          <InterestsHeader name={name} />
        </div>

        {errorMessage && (
          <div className="interests-page__error">
            {errorMessage}
          </div>
        )}

        <div className="interests-page__grid-wrapper">
          <InterestsGrid
            options={interestOptions}
            selectedInterests={selectedInterests}
            onToggle={toggleInterest}
          />
        </div>

        <div className="interests-page__actions-wrapper">
          <InterestsActions
            loading={submitting}
            disabled={isNextDisabled}
            onNext={handleNext}
          />
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default InitialQuizzesInterestsPage;