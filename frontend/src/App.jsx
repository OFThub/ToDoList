import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Sayfalar
import Login from "./pages/jsx/Login";
import Register from "./pages/jsx/Register";
import Dashboard from "./pages/jsx/Dashboard";
import ProjectDetail from "./pages/jsx/ProjectDetail";
import Profile from "./pages/jsx/Profile";
import HomePage from "./pages/jsx/HomePage";

// Bileşenler
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// CSS (Layout için gerekli geçişleri buraya veya App.css'e ekleyin)
import "./App.css";

export default function App() {
  const { user } = useAuth();
  // Sidebar durumunu burada yönetiyoruz
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Aç/Kapat fonksiyonu
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  // Mobilde kapatma fonksiyonu
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-container">
      {/* Kullanıcı giriş yapmışsa Sidebar'ı göster ve state'i gönder */}
      {user && (
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      )}
      
      {/* sidebarOpen durumuna göre içeriği kaydırmak için dinamik class ekledik */}
      <div className={`main-content-wrapper ${user && sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        
        {/* Navbar'a fonksiyonu prop olarak geçiyoruz */}
        {user && <Navbar onToggleSidebar={toggleSidebar} />}
        
        <main className="page-container">
          <Routes>
            {/* Kamu Rotaları */}
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/home" replace />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/home" replace />} 
            />

            {/* Korumalı Rotalar */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } 
            />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/project/:projectId/kanban" element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
            <Route path="*" element={<div className="error-404">Sayfa Bulunamadı</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}