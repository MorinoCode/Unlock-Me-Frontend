import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
import InterestsHeader from "../../components/interestsHeader/InterestsHeader";
import InterestsGrid from "../../components/interestsGrid/InterestsGrid";
import InterestsActions from "../../components/interestsActions/InterestsActions";
import "./InitialQuizzesInterestsPage.css";

const InitialQuizzesInterestsPage = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [interestOptions, setInterestOptions] = useState([]);

  const storedUser = localStorage.getItem("unlock-me-user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  const capitalizeFirstLetter = (str = "") =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const name = parsedUser?.name
    ? capitalizeFirstLetter(parsedUser.name)
    : "User";

  useEffect(() => {
    fetch(`${API_URL}/api/user/onboarding/interests-options`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch interests");
        return res.json();
      })
      .then((data) => {
        const options = data.categories || data; 
        setInterestOptions(Array.isArray(options) ? options : []);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [API_URL]);

  const toggleInterest = (label) => {
    if (selectedInterests.includes(label)) {
      setSelectedInterests((prev) => prev.filter((i) => i !== label));
    } else {
      if (selectedInterests.length < 3) {
        setSelectedInterests((prev) => [...prev, label]);
      }
    }
  };

  const handleNext = async () => {
    if (selectedInterests.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/onboarding/interests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selectedInterests }),
      });

      if (!res.ok) throw new Error("Request failed");

      navigate("/initial-quizzes/questionsbycategory");
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to save interests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isNextDisabled = loading || selectedInterests.length < 3;

  return (
    <BackgroundLayout>
      <div className="onboarding-interests-card">
        <InterestsHeader name={name} />
        
        <InterestsGrid 
          options={interestOptions} 
          selectedInterests={selectedInterests} 
          onToggle={toggleInterest} 
        />

        <InterestsActions 
          loading={loading} 
          disabled={isNextDisabled} 
          onNext={handleNext} 
        />
      </div>
    </BackgroundLayout>
  );
};

export default InitialQuizzesInterestsPage;