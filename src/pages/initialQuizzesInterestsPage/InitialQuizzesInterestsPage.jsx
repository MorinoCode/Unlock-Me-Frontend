import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InitialQuizzesInterestsPage.css";

const InitialQuizzesInterestsPage = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // States for handling UI and data
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

  /**
   * Fetch available interest categories from the server on component mount
   */
  useEffect(() => {
    fetch(`${API_URL}/api/user/onboarding/interests-options`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch interests");
        return res.json();
      })
      .then((data) => setInterestOptions(data))
      .catch((err) => console.error("Fetch error:", err));
  }, [API_URL]);

  /**
   * Toggle interest selection
   * Adds the label if not present, removes it if it already exists
   */
  const toggleInterest = (label) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  /**
   * Handles the submission of selected interests
   * Only proceeds if at least one interest is selected
   */
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

      // Navigate to the next onboarding step
      navigate("/initial-quizzes/questionsbycategory");
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to save interests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Button is disabled if loading or if no interests are selected
  const isNextDisabled = loading || selectedInterests.length === 0;

  return (
    <div className="onboarding-interests-page">
      <div className="onboarding-interests-card">
        <h2>{`${name},What are your interests?`}</h2>
        <p className="interests-subtitle">
          Choose at least one category to personalize your experience.
        </p>

        <div className="interests-grid">
          {interestOptions.map((opt) => (
            <div
              key={opt._id}
              className={`interest-item ${
                selectedInterests.includes(opt.label) ? "selected" : ""
              }`}
              onClick={() => toggleInterest(opt.label)}
            >
              <span className="interest-icon">{opt.icon}</span>
              <span className="interest-label">{opt.label}</span>
            </div>
          ))}
        </div>

        <div className="onboarding-interests-actions">
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="next-btn full-width"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialQuizzesInterestsPage;
