// src/context/protectedRoute
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import HeartbeatLoader from "../components/heartbeatLoader/HeartbeatLoader";

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <HeartbeatLoader />;
  }

  if (!currentUser) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // ۱. بررسی آواتار و بیو
  if (!currentUser.avatar || !currentUser.bio) {
    if (location.pathname !== "/initial-quizzes") {
      return <Navigate to="/initial-quizzes" replace />;
    }
    return <Outlet />;
  }

  // ۲. بررسی علایق
  if (!currentUser.interests || currentUser.interests.length === 0) {
    if (location.pathname !== "/initial-quizzes/interests") {
      return <Navigate to="/initial-quizzes/interests" replace />;
    }
    return <Outlet />;
  }

  // ۳. بررسی سوالات
  const categories = currentUser.questionsbycategoriesResults?.categories;
  // اگر categories وجود نداشت یا تعداد کلیدهایش کمتر از ۳ بود
  if (!categories || Object.keys(categories).length < 3) {
    if (location.pathname !== "/initial-quizzes/questionsbycategory") {
      return <Navigate to="/initial-quizzes/questionsbycategory" replace />;
    }
    return <Outlet />;
  }

  // ۴. جلوگیری از بازگشت به صفحات تکمیل اطلاعات وقتی همه چیز کامل است
  if (
    location.pathname === "/initial-quizzes" || 
    location.pathname === "/initial-quizzes/interests" ||
    location.pathname === "/initial-quizzes/questionsbycategory"
  ) {
    return <Navigate to="/explore" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;