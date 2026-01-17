/**
 * Ana Uygulama Bileşeni (App.js)
 * Uygulamanın sayfa düzenini (Layout), yönlendirme (Routing) mantığını 
 * ve Sidebar/Navbar gibi global bileşenlerin yönetimini sağlar.
 */

import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// --- Sayfa Bileşenleri ---
import Login from "./pages/jsx/Login";
import Register from "./pages/jsx/Register";
import Dashboard from "./pages/jsx/Dashboard";
import ProjectDetail from "./pages/jsx/ProjectDetail";
import Profile from "./pages/jsx/Profile";
import HomePage from "./pages/jsx/HomePage";

// --- Ortak Bileşenler (Components) ---
import ProtectedRoute from "./components/jsx/ProtectedRoute";
import Navbar from "./components/jsx/Navbar";
import Sidebar from "./components/jsx/Sidebar";
import ThemeToggle from './components/jsx/ThemeToggle';

// --- Stil Dosyaları ---
import "./App.css";

export default function App() {
  const { user } = useAuth();

  // Layout State Yönetimi: Sidebar'ın açık/kapalı durumunu kontrol eder
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- Yardımcı Fonksiyonlar ---
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-container">
      <ThemeToggle />
      
      {/* Sidebar: Sadece kullanıcı giriş yapmışsa görüntülenir */}
      {user && (
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      )}
      
      {/* Ana İçerik Alanı: Sidebar durumuna göre genişliği dinamik olarak ayarlanır */}
      <div className={`main-content-wrapper ${user && sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        
        {/* Üst Menü (Navbar) */}
        {user && <Navbar onToggleSidebar={toggleSidebar} />}
        
        {/* Sayfa İçeriği (Main Container) */}
        <main className="page-container">
          <Routes>
            
            {/* --- Kamu (Public) Rotaları --- */}
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/home" replace />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/home" replace />} 
            />

            {/* --- Korumalı (Private) Rotalar --- */}
            {/* Bu rotalar 'ProtectedRoute' sarmalayıcısı ile yetki kontrolü yapar */}
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

            {/* --- Yönlendirme ve Hata Yönetimi --- */}
            {/* Kök dizin kontrolü */}
            <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
            
            {/* 404 - Sayfa Bulunamadı */}
            <Route path="*" element={<div className="error-404">Sayfa Bulunamadı</div>} />
            
          </Routes>
        </main>
      </div>
    </div>
  );
}