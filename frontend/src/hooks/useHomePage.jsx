/**
 * useHomePage Hook'u
 * Ana sayfa (Landing/Home) için gerekli olan kullanıcı bilgilerini
 * ve proje listesini merkezi API üzerinden çeker.
 */

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api/axios";

export const useHomePage = () => {
  // Global yetkilendirme durumundan kullanıcı bilgilerini alıyoruz
  const { user } = useAuth();
  
  // Yerel State tanımlamaları
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Proje Verilerini Çekme (Fetch)
   * Bileşen ilk yüklendiğinde çalışır ve backend'den projeleri getirir.
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // GET /projects isteği ile kullanıcıya ait projeler çekilir
        const res = await api.get("/projects");
        
        // API yanıtındaki veriyi state'e aktarıyoruz
        setProjects(res.data);
      } catch (err) {
        // Hata durumunda konsola detayları basıyoruz
        console.error("Dashboard verisi yüklenemedi:", err);
      } finally {
        // İşlem başarılı da olsa başarısız da olsa yükleme ekranını kapatıyoruz
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Boş bağımlılık dizisi: Sadece bileşen "mount" olduğunda çalışır

  // UI tarafında kullanılacak verileri dışa aktar
  return { user, projects, loading };
};