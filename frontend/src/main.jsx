/**
 * Uygulama Giriş Noktası (Entry Point)
 * Bu dosya, React uygulamasının DOM'a bağlandığı ve global sağlayıcıların (Providers)
 * yapılandırıldığı ana dosyadır.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Üçüncü Taraf Kütüphaneler
import { Toaster } from "react-hot-toast";

// Bağlam (Context) ve Bileşenler
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";

// Stil Dosyaları
import "./index.css";

// React Root Oluşturma ve Render İşlemi
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    {/* Kimlik doğrulama durumunu tüm uygulama genelinde yönetir */}
    <AuthProvider>
      
      {/* Global Bildirim (Toast) Yapılandırması */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />

      {/* Ana Uygulama Bileşeni */}
      <App />
      
    </AuthProvider>
  </BrowserRouter>
);