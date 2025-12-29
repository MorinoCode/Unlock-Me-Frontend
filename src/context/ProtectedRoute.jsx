import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import HeartbeatLoader from "../components/heartbeatLoader/HeartbeatLoader";

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <HeartbeatLoader />;

  if (!currentUser) return <Navigate to="/signin" state={{ from: location }} replace />;

  // Step 1: Avatar & Bio
  if (!currentUser.avatar || !currentUser.bio) {
    if (location.pathname !== "/initial-quizzes") return <Navigate to="/initial-quizzes" replace />;
    return <Outlet />;
  }

  // Step 2: Interests
  if (!currentUser.interests || currentUser.interests.length === 0) {
    if (location.pathname !== "/initial-quizzes/interests") return <Navigate to="/initial-quizzes/interests" replace />;
    return <Outlet />;
  }

  // Step 3: Questions by category
  const categories = currentUser.questionsbycategoriesResults?.categories;
  if (!categories || Object.keys(categories).length < 3) {
    if (location.pathname !== "/initial-quizzes/questionsbycategory") return <Navigate to="/initial-quizzes/questionsbycategory" replace />;
    return <Outlet />;
  }

  // Step 4: Prevent going back to quiz pages if completed
  if (["/initial-quizzes","/initial-quizzes/interests","/initial-quizzes/questionsbycategory"].includes(location.pathname)) {
    return <Navigate to="/explore" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
