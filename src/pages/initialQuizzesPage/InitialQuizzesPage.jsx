import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";

import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
import OnboardingStep1 from "../../components/onboarding/OnboardingStep1";
import OnboardingStep2 from "../../components/onboarding/OnboardingStep2";
import OnboardingStep3 from "../../components/onboarding/OnboardingStep3";
import OnboardingStep4 from "../../components/onboarding/OnboardingStep4";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";
import "./InitialQuizzesPage.css";

const InitialQuizzesPage = () => {
  const navigate = useNavigate();
  const { currentUser, checkAuth } = useAuth();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    birthday: { day: "", month: "", year: "" },
    country: "",
    countryCode: "",
    city: "",
    bio: "",
    avatar: null,
  });

  const capitalizeFirstLetter = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "User";

  const userName = capitalizeFirstLetter(currentUser?.name);

  const handleNext = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let body;
      let headers = { "Content-Type": "application/json" };

      switch (step) {
        case 1:
          endpoint = "birthday";
          body = JSON.stringify({ birthday: formData.birthday });
          break;
        case 2:
          endpoint = "location";
          body = JSON.stringify({
            country: formData.country,
            city: formData.city,
          });
          break;
        case 3:
          endpoint = "bio";
          body = JSON.stringify({ bio: formData.bio });
          break;
        case 4:
          endpoint = "avatar";
          body = new FormData();
          body.append("avatar", formData.avatar);
          headers = {};
          break;
        default:
          return;
      }

      const res = await fetch(`${API_URL}/api/user/onboarding/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers,
        body,
      });

      if (!res.ok) throw new Error("Failed to save step");

      if (step < 4) {
        setStep(step + 1);
      } else {
        await checkAuth();
        navigate("/initial-quizzes/interests");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundLayout>
      {loading && <HeartbeatLoader text="Saving your progress..." />}

      <div className="initial-quizzes__card">
        {step === 1 && (
          <OnboardingStep1
            formData={formData}
            setFormData={setFormData}
            userName={userName}
            onNext={handleNext}
            loading={loading}
          />
        )}

        {step === 2 && (
          <OnboardingStep2
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={() => setStep(step - 1)}
            loading={loading}
          />
        )}

        {step === 3 && (
          <OnboardingStep3
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={() => setStep(step - 1)}
            loading={loading}
          />
        )}

        {step === 4 && (
          <OnboardingStep4
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={() => setStep(step - 1)}
            loading={loading}
          />
        )}
      </div>
    </BackgroundLayout>
  );
};

export default InitialQuizzesPage;
