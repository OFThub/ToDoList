/**
 * ProtectedRoute Bileşeni
 * Sadece giriş yapmış kullanıcıların erişebileceği sayfaları korur.
 * Eğer kullanıcı oturum açmamışsa, onu giriş sayfasına yönlendirir.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  /**
   * 1. Yükleme Durumu:
   * AuthContext henüz localStorage kontrolünü tamamlamadıysa 
   * kullanıcıyı hemen giriş sayfasına atmamak için bekletiyoruz.
   */
  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p>Yetki kontrol ediliyor...</p>
      </div>
    );
  }

  /**
   * 2. Yetkisiz Erişim Kontrolü:
   * Kullanıcı oturumu yoksa /login sayfasına yönlendiriyoruz.
   * 'state={{ from: location }}' sayesinde giriş yaptıktan sonra 
   * kaldığı sayfaya geri dönmesini sağlayabiliriz.
   */
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /**
   * 3. Yetkili Erişim:
   * Kullanıcı doğrulanmışsa korunan bileşeni (children) göster.
   */
  return children;
};

export default ProtectedRoute;