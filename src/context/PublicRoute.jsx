import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import HeartbeatLoader from "../components/heartbeatLoader/HeartbeatLoader";

const PublicRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return <HeartbeatLoader />;

  if (currentUser) return <Navigate to="/explore" replace />;

  return <Outlet />;
};

export default PublicRoute;
