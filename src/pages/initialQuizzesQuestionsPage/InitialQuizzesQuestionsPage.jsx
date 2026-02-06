import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
import QuizProgressBar from "../../components/quizProgressBar/QuizProgressBar.jsx";
import QuizCard from "../../components/quizCard/QuizCard.jsx";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader.jsx";
import "./InitialQuizzesQuestionsPage.css";
import { useAuth } from "../../context/useAuth.js";

const InitialQuizzesQuestionsPage = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { checkAuth } = useAuth();
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [_answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const submitInProgressRef = useRef(false);
  const abortControllerRef = useRef(null);
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    const ac = new AbortController();
    abortControllerRef.current = ac;

    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setErrorMessage("Request timeout. Please refresh the page.");
        setLoading(false);
      }
    }, 20000);
    timeoutIdRef.current = timeoutId;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const interestsRes = await fetch(
          `${API_URL}/api/user/onboarding/get-user-interests`,
          { credentials: "include", signal: ac.signal }
        );
        const interestsData = await interestsRes.json();
        const categories = interestsData?.userInterestedCategories;

        if (!categories || !Array.isArray(categories) || categories.length === 0) {
          navigate("/initial-quizzes/interests", { replace: true });
          return;
        }

        const questionsRes = await fetch(
          `${API_URL}/api/user/onboarding/questions-by-category`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ selectedCategories: categories }),
            credentials: "include",
            signal: ac.signal,
          }
        );

        if (!questionsRes.ok) {
          throw new Error("Failed to fetch questions");
        }

        const questionsData = await questionsRes.json();
        const list = Array.isArray(questionsData) ? questionsData : [];
        const flattened = list.flatMap((cat) =>
          (cat.questions || []).map((q) => ({
            ...q,
            category: cat.categoryLabel || cat.category || "",
          }))
        );

        if (flattened.length === 0) {
          setErrorMessage(
            "No questions available. Please select different interests."
          );
        } else {
          setAllQuestions(flattened);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching quiz data:", err);
          setErrorMessage(
            err.message || "Failed to load questions. Please refresh the page."
          );
        }
      } finally {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      ac.abort();
      abortControllerRef.current = null;
    };
  }, [API_URL, navigate]);

  const submitFinalResults = useCallback(
    async (finalAnswers) => {
      if (submitInProgressRef.current) return;

      submitInProgressRef.current = true;
      setSubmitting(true);
      setErrorMessage("");

      try {
        const res = await fetch(
          `${API_URL}/api/user/onboarding/saveUserInterestCategoriesQuestinsAnswer`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quizResults: finalAnswers }),
            credentials: "include",
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to save results");
        }

        await checkAuth();
        navigate("/explore", { replace: true });
      } catch (err) {
        console.error("Final submit error:", err);
        setErrorMessage(
          err.message ||
            "Something went wrong saving your answers. Please try again."
        );
        setSubmitting(false);
        submitInProgressRef.current = false;
      }
    },
    [API_URL, checkAuth, navigate]
  );

  const handleAnswer = useCallback(
    (option) => {
      if (!allQuestions[currentIndex] || !option) return;

      const currentQuestion = allQuestions[currentIndex];
      const currentIdx = currentIndex;
      const totalQuestions = allQuestions.length;

      const newAnswer = {
        category: currentQuestion.category,
        questionText: currentQuestion.questionText,
        selectedText: option.text,
        trait: option.trait,
      };

      setAnswers((prevAnswers) => {
        const updatedAnswers = [...prevAnswers, newAnswer];

        if (currentIdx < totalQuestions - 1) {
          setCurrentIndex((prevIndex) => prevIndex + 1);
        } else {
          setTimeout(() => {
            submitFinalResults(updatedAnswers);
          }, 0);
        }

        return updatedAnswers;
      });
    },
    [allQuestions, currentIndex, submitFinalResults]
  );

  const currentQuestion = useMemo(() => {
    return allQuestions[currentIndex] || null;
  }, [allQuestions, currentIndex]);

  const progress = useMemo(() => {
    return allQuestions.length > 0
      ? ((currentIndex + 1) / allQuestions.length) * 100
      : 0;
  }, [currentIndex, allQuestions.length]);

  if (loading || submitting) {
    return (
      <BackgroundLayout>
        <HeartbeatLoader
          text={
            submitting
              ? "Saving your answers..."
              : "Preparing your personal quiz..."
          }
        />
      </BackgroundLayout>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <BackgroundLayout>
        <div className="quiz-page">
          {errorMessage && (
            <div className="quiz-page__error" role="alert" aria-live="polite">
              {errorMessage}
            </div>
          )}
          <button
            className="quiz-page__retry-btn"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </BackgroundLayout>
    );
  }

  return (
    <BackgroundLayout>
      <div className="quiz-page">
        {errorMessage && (
          <div className="quiz-page__error" role="alert" aria-live="polite">
            {errorMessage}
          </div>
        )}

        <div className="quiz-page__progress-section">
          <QuizProgressBar progress={progress} />
        </div>

        <div className="quiz-page__card-section">
          {currentQuestion && (
            <QuizCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              currentIndex={currentIndex}
              totalQuestions={allQuestions.length}
            />
          )}
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default InitialQuizzesQuestionsPage;
