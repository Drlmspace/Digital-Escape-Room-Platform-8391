import React, { createContext, useContext, useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    audioDescriptions: true,
    captions: true
  });

  const [announcements, setAnnouncements] = useState([]);

  // Keyboard shortcuts
  useHotkeys('alt+h', () => toggleSetting('highContrast'), { preventDefault: true });
  useHotkeys('alt+t', () => toggleSetting('largeText'), { preventDefault: true });
  useHotkeys('alt+m', () => toggleSetting('reducedMotion'), { preventDefault: true });

  useEffect(() => {
    // Apply accessibility settings to document
    const root = document.documentElement;
    
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.largeText) {
      root.style.fontSize = '120%';
    } else {
      root.style.fontSize = '';
    }

    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
    }
  }, [settings]);

  const toggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    announceToScreenReader(`${setting} ${settings[setting] ? 'disabled' : 'enabled'}`);
  };

  const announceToScreenReader = (message) => {
    const liveRegion = document.getElementById('live-announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
    
    setAnnouncements(prev => [...prev.slice(-4), {
      id: Date.now(),
      message,
      timestamp: new Date()
    }]);
  };

  const value = {
    settings,
    toggleSetting,
    announceToScreenReader,
    announcements
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;