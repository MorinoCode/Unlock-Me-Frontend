import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import { useInterestsOptionsStore } from "../../store/interestsOptionsStore";

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

  const [submitting, setSubmitting] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const abortControllerRef = useRef(null);
  const submitInProgressRef = useRef(false);

  const interestOptions = useInterestsOptionsStore((state) => state.options ?? []);
  const loading = useInterestsOptionsStore((state) => state.loading);

  const name = useMemo(() => {
    const userName = currentUser?.username;
    return userName
      ? userName.charAt(0).toUpperCase() + userName.slice(1)
      : "User";
  }, [currentUser?.username]);

  // Run only once on mount to avoid React #185 (infinite loop from effect deps)
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    const ac = new AbortController();
    abortControllerRef.current = ac;
    const store = useInterestsOptionsStore.getState();
    const cached = store.getCached();
    const silent = !!cached;
    if (cached) setErrorMessage("");
    store.fetchOptions(API_URL, silent, ac.signal).catch((err) => {
      if (err.name !== "AbortError") {
        setErrorMessage("Failed to load interests. Please refresh.");
      }
    });
    return () => {
      ac.abort();
      abortControllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only to prevent React #185 loop
  }, []);

  const toggleInterest = useCallback((label) => {
    setSelectedInterests((prev) => {
      if (prev.includes(label)) {
        // ✅ Allow deselecting
        return prev.filter((i) => i !== label);
      } else {
        // ✅ Maximum 3 interests allowed
        if (prev.length < 3) {
          return [...prev, label];
        }
        // ✅ Performance: Don't create new array if limit reached
        return prev;
      }
    });
  }, []);

  const handleNext = useCallback(async () => {
    // ✅ Better validation: Must have exactly 3 interests
    if (
      selectedInterests.length !== 3 ||
      submitting ||
      submitInProgressRef.current
    ) {
      if (selectedInterests.length < 3) {
        setErrorMessage(
          `Please select ${3 - selectedInterests.length} more interest${
            3 - selectedInterests.length > 1 ? "s" : ""
          }.`
        );
      }
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Request failed");
      }

      await checkAuth();
      navigate("/initial-quizzes/questionsbycategory");
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage(
        err.message || "Failed to save interests. Please try again."
      );
      setSubmitting(false);
      submitInProgressRef.current = false;
    }
  }, [selectedInterests, submitting, API_URL, checkAuth, navigate]);

  // ✅ Better validation: Must have exactly 3 interests
  const isNextDisabled = useMemo(() => {
    return submitting || selectedInterests.length !== 3;
  }, [submitting, selectedInterests.length]);

  return (
    <BackgroundLayout>
      {(loading || submitting) && (
        <HeartbeatLoader
          text={
            submitting ? "Saving your interests..." : "Loading interests..."
          }
        />
      )}

      <div className="interests-page__card">
        <div className="interests-page__header-wrapper">
          <InterestsHeader name={name} />
        </div>

        {errorMessage && (
          <div
            className="interests-page__error"
            role="alert"
            aria-live="polite"
          >
            {errorMessage}
          </div>
        )}

        {/* ✅ Selection counter for better UX */}
        <div className="interests-page__counter" aria-live="polite">
          {selectedInterests.length} / 3 selected
        </div>

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
