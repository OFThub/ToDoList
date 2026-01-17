// src/components/jsx/ThemeToggle.jsx
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label="Temayı Değiştir"
      title={`${theme === 'light' ? 'Karanlık' : 'Aydınlık'} Tema`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}