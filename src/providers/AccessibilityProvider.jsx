import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

const AccessibilityProvider = ({ children }) => {
  const [announcements, setAnnouncements] = useState([]);

  const announceToScreenReader = (message) => {
    if (typeof window !== 'undefined') {
      const liveRegion = document.getElementById('live-announcements');
      if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
          if (liveRegion) liveRegion.textContent = '';
        }, 1000);
      }
    }

    setAnnouncements(prev => [
      ...prev.slice(-4),
      {
        id: Date.now(),
        message,
        timestamp: new Date()
      }
    ]);
  };

  const value = {
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