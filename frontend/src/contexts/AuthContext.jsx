/**
 * AuthContext (Kimlik Doğrulama Bağlamı)
 * Uygulama genelinde kullanıcı oturum durumunu yönetir.
 * Sayfa yenilendiğinde token kontrolü yaparak oturum sürekliliğini sağlar.
 */

import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api/axios"; 

// Context oluşturma
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Oturum açmış kullanıcının verisi
  const [loading, setLoading] = useState(true); // Başlangıçtaki kontrol süreci

  /**
   * Oturum Kontrolü (Re-authentication)
   * Sayfa yüklendiğinde localStorage'da bir token varsa, 
   * bu token'ın geçerliliğini backend üzerinden doğrular.
   */
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
          // Token geçerli mi? Backend'den güncel kullanıcı bilgisini iste.
          const res = await api.get("/auth/me");
          
          // API yanıtına göre kullanıcıyı state'e ata
          // Not: api/axios.js interceptor yapına göre res veya res.user kullanmalısın.
          setUser(res.user || res.data?.user || res);
        } catch (err) {
          // Token geçersizse veya süresi dolmuşsa temizle
          console.error("Oturum doğrulanamadı:", err);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      
      // Kontrol tamamlandığında (başarılı veya başarısız) yükleme ekranını kapat
      setLoading(false);
    };

    checkUser();
  }, []);

  /**
   * logout (Çıkış Yap) fonksiyonu buraya eklenebilir.
   * localStorage.removeItem("token") ve setUser(null) işlemlerini yapar.
   */

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {/* loading true olduğu sürece uygulama içeriğini gizleyip 
        bir "SplashScreen" göstermek iyi bir pratiktir. 
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Kolay kullanım için Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth, bir AuthProvider içinde kullanılmalıdır.");
  }
  return context;
};