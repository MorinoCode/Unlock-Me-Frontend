import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InitialQuizzesQuestionsPage.css";

const InitialQuizzesQuestionsPage = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [allQuestions, setAllQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -------------------- 1. Fetch Categories & Questions -------------------- */
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Step A: Get user's selected interests from DB
        const interestRes = await fetch(`${API_URL}/api/user/onboarding/get-user-interests`, {
          method: "GET",
          credentials: "include",
        });
        const interestData = await interestRes.json();
        const categories = interestData.userInterestedCategories;

        if (!categories || categories.length === 0) {
          // If no interests, redirect back to select interests
          navigate("/initial-quizzes/interests");
          return;
        }

        // Step B: Get questions for those categories
        const questionsRes = await fetch(`${API_URL}/api/user/onboarding/questions-by-category`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedCategories: categories }),
          credentials: "include",
        });
        
        const questionsData = await questionsRes.json();

        // Flatten: Convert [{category, questions:[]}] to a flat array of questions
        const flattened = questionsData.flatMap(cat => 
          cat.questions.map(q => ({
            ...q,
            category: cat.categoryLabel
          }))
        );
        
        setAllQuestions(flattened);
      } catch (err) {
        console.error("Error fetching quiz data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [API_URL, navigate]);

  /* -------------------- 2. Handle Answer Selection -------------------- */
  const handleAnswer = (option) => {
    const currentQuestion = allQuestions[currentIndex];
    
    const newAnswer = {
      category: currentQuestion.category,
      questionText: currentQuestion.questionText,
      selectedText: option.text,
      trait: option.trait
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // If there are more questions, go to next, otherwise Submit
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitFinalResults(updatedAnswers);
    }
  };

  /* -------------------- 3. Final Submit to Backend -------------------- */
  const submitFinalResults = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/onboarding/saveUserInterestCategoriesQuestinsAnswer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizResults: finalAnswers }), // Backend expects 'quizResults' array
        credentials: "include",
      });

      if (res.ok) {
        // Success! Move to Explore or next onboarding step
        navigate("/Explore"); 
      } else {
        throw new Error("Failed to save results");
      }
    } catch (err) {
      console.error("Final submit error:", err);
      alert("Something went wrong saving your answers.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader">Preparing your personal quiz...</div>;
  if (allQuestions.length === 0) return null;

  const currentQuestion = allQuestions[currentIndex];
  const progress = ((currentIndex + 1) / allQuestions.length) * 100;

  return (
    <div className="quiz-container">
      {/* Progress tracking at the top */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="question-card">
        <span className="category-tag">{currentQuestion.category}</span>
        
        <h2>{currentQuestion.questionText}</h2>
        
        <div className="options-list">
          {currentQuestion.options.map((option, idx) => (
            <button 
              key={idx} 
              className="option-btn"
              onClick={() => handleAnswer(option)}
            >
              {option.text}
            </button>
          ))}
        </div>
        
        <p className="question-counter">
          Question {currentIndex + 1} of {allQuestions.length}
        </p>
      </div>
    </div>
  );
};

export default InitialQuizzesQuestionsPage;