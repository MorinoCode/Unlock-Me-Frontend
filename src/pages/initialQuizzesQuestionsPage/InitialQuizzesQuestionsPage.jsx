import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
import QuizProgressBar from "../../components/quizProgressBar/QuizProgressBar.jsx";
import QuizCard from "../../components/quizCard/QuizCard.jsx";
import "./InitialQuizzesQuestionsPage.css";

const InitialQuizzesQuestionsPage = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [allQuestions, setAllQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const interestRes = await fetch(`${API_URL}/api/user/onboarding/get-user-interests`, {
          method: "GET",
          credentials: "include",
        });
        const interestData = await interestRes.json();
        const categories = interestData.userInterestedCategories;

        if (!categories || categories.length === 0) {
          navigate("/initial-quizzes/interests");
          return;
        }

        const questionsRes = await fetch(`${API_URL}/api/user/onboarding/questions-by-category`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedCategories: categories }),
          credentials: "include",
        });
        
        const questionsData = await questionsRes.json();

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

    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitFinalResults(updatedAnswers);
    }
  };

  const submitFinalResults = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/onboarding/saveUserInterestCategoriesQuestinsAnswer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizResults: finalAnswers }), 
        credentials: "include",
      });

      if (res.ok) {
        navigate("/explore"); 
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

  if (loading) {
    return (
      <BackgroundLayout>
        <div className="quiz-loader-container">
          <div className="quiz-spinner"></div>
          <p>Preparing your personal quiz...</p>
        </div>
      </BackgroundLayout>
    );
  }

  if (allQuestions.length === 0) return null;

  const currentQuestion = allQuestions[currentIndex];
  const progress = ((currentIndex + 1) / allQuestions.length) * 100;

  return (
    <BackgroundLayout>
      <div className="quiz-page-wrapper">
        <QuizProgressBar progress={progress} />
        
        <QuizCard 
          question={currentQuestion} 
          onAnswer={handleAnswer} 
          currentIndex={currentIndex} 
          totalQuestions={allQuestions.length} 
        />
      </div>
    </BackgroundLayout>
  );
};

export default InitialQuizzesQuestionsPage;