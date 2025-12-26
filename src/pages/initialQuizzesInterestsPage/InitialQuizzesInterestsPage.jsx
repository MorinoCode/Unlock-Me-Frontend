import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth"; 

import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
import InterestsHeader from "../../components/interestsHeader/InterestsHeader";
import InterestsGrid from "../../components/interestsGrid/InterestsGrid";
import InterestsActions from "../../components/interestsActions/InterestsActions";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";
import "./InitialQuizzesInterestsPage.css";

const InitialQuizzesInterestsPage = () => {
  const navigate = useNavigate();
  const { currentUser ,  checkAuth } = useAuth(); 
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [interestOptions, setInterestOptions] = useState([]);

  const capitalizeFirstLetter = (str = "") =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const name = currentUser?.name
    ? capitalizeFirstLetter(currentUser.name)
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
        const options = data; 
        setInterestOptions(Array.isArray(options) ? options : []);
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => {
        setLoading(false);
      });
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
      await checkAuth();
      navigate("/initial-quizzes/questionsbycategory");
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to save interests. Please try again.");
      setLoading(false); 
    } 
  };

  const isNextDisabled = loading || selectedInterests.length < 3;

  return (
    <BackgroundLayout>
      {loading && <HeartbeatLoader text="Updating your profile..." />}
      
      <div className="interests-page__card">
        
        <div className="interests-page__header-wrapper">
             <InterestsHeader name={name} />
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
                loading={loading} 
                disabled={isNextDisabled} 
                onNext={handleNext} 
            />
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default InitialQuizzesInterestsPage;