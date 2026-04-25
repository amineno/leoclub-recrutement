import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#030712');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#F8FAFC');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-full glass hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

export default ThemeToggle;
