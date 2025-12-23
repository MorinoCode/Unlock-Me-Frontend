import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
import OnboardingStep1 from "../../components/onboarding/OnboardingStep1";
import OnboardingStep2 from "../../components/onboarding/OnboardingStep2";
import OnboardingStep3 from "../../components/onboarding/OnboardingStep3";
import OnboardingStep4 from "../../components/onboarding/OnboardingStep4";
import "./InitialQuizzesPage.css"; // استایل کارت اصلی

const InitialQuizzesPage = () => {
  const navigate = useNavigate();
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

  const storedUser = localStorage.getItem("unlock-me-user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userName = parsedUser?.name ? parsedUser.name.charAt(0).toUpperCase() + parsedUser.name.slice(1) : "User";

  const handleNext = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let body;

      if (step === 1) {
        endpoint = "birthday";
        body = JSON.stringify({ birthday: formData.birthday });
      } else if (step === 2) {
        endpoint = "location";
        body = JSON.stringify({ country: formData.country, city: formData.city });
      } else if (step === 3) {
        endpoint = "bio";
        body = JSON.stringify({ bio: formData.bio });
      } else {
        endpoint = "avatar";
        body = new FormData();
        body.append("avatar", formData.avatar);
      }

      const res = await fetch(`${API_URL}/api/user/onboarding/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: body instanceof FormData ? {} : { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error("Failed");
      
      if (step < 4) setStep(step + 1);
      else navigate("/initial-quizzes/interests");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundLayout>
      <div className="onboarding-card">
        
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