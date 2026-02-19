import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// İstek Interceptor'ı (Token'ı her isteğe ekler)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Yanıt Interceptor'ı (Veriyi sadeleştirir ve 401 kontrolü yapar)
api.interceptors.response.use(
  (response) => {
    // Bileşenlerde 'res.data.data' yazmak yerine direkt 'res' üzerinden 
    // backend verisine ulaşmanı sağlar.
    return response.data; 
  },
  (error) => {
    // Backend'den gelen hata mesajını yakala
    const message = error.response?.data?.msg || "Bir hata oluştu";
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Sadece login sayfasında değilsek yönlendir (sonsuz döngüyü önler)
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    // Hatayı fırlat ki 'catch' blokları yakalayabilsin
    return Promise.reject({ ...error, message });
  }
);

export default api;