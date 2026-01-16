import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loading-spinner">Yükleniyor...</div>;

  if (!user) {
    // Kullanıcının gitmek istediği yeri kaydediyoruz ki giriş yapınca oraya dönebilsin
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;