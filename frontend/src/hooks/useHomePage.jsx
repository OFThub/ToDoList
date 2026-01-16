import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api/axios";

export const useHomePage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/projects");
        setProjects(res.data);
      } catch (err) {
        console.error("Dashboard verisi yüklenemedi", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { user, projects, loading };
};