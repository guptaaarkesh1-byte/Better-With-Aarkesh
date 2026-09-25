import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('app_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    return 'dark'; // Default luxury dark theme
  });

  useEffect(() => {
    try {
      localStorage.setItem('app_theme', theme);
    } catch (e) {
      // Ignore localStorage errors
    }

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }
  }, [theme]);

  const [visualSettings, setVisualSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('bwa_visual_settings');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return { contrast: 100, brightness: 100, overlayDarkness: 40, saturation: 100, fontScale: 100 };
  });

  const applyVisualSettings = (settings) => {
    if (!settings) return;
    const root = document.documentElement;
    const contrast = settings.contrast ?? 100;
    const brightness = settings.brightness ?? 100;
    const overlayDarkness = settings.overlayDarkness ?? 40;
    const saturation = settings.saturation ?? 100;
    const fontScale = settings.fontScale ?? 100;

    root.style.setProperty('--site-contrast', `${contrast}%`);
    root.style.setProperty('--site-brightness', `${brightness}%`);
    root.style.setProperty('--overlay-opacity', `${overlayDarkness / 100}`);
    root.style.setProperty('--site-saturation', `${saturation}%`);
    root.style.setProperty('--site-font-scale', `${fontScale}`);

    if (contrast !== 100 || brightness !== 100 || saturation !== 100) {
      root.setAttribute('data-custom-filter', 'true');
    } else {
      root.removeAttribute('data-custom-filter');
    }
  };

  useEffect(() => {
    // Initial apply from cache
    applyVisualSettings(visualSettings);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/visual-settings`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.contrast === 'number') {
          setVisualSettings(data);
          applyVisualSettings(data);
          try {
            localStorage.setItem('bwa_visual_settings', JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(err => console.error('Failed to load visual settings:', err));
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
