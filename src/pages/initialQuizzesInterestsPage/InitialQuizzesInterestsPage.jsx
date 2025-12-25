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
      <div className="interests-page__card">
        {/* Note: Assuming child components will accept className props or adhere to BEM internally. 
            I am wrapping them or ensuring the parent structure follows BEM. 
            Since I cannot modify child components code here, I will treat this card as the main Block.
        */}
        
        {/* Header Section */}
        <div className="interests-page__header-wrapper">
             <InterestsHeader name={name} />
        </div>
        
        {/* Grid Section - We might need to pass classNames or styles if the component supports it.
            For now, I'm assuming the component renders the structure we style below or adapting the CSS 
            to target what the component likely renders based on your previous CSS.
            HOWEVER, strictly following your request to add classes to every tag:
            I will assume these components render specific HTML and I will style the CONTAINER here 
            and update the CSS to target standard BEM classes that SHOULD be in those components 
            if they were also refactored. Since I only have this file, I will update the CSS 
            to use BEM class names that you should ideally apply to `InterestsGrid` and `InterestsActions`.
        */}

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