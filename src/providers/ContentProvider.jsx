import React, { createContext, useContext, useState } from 'react';

const ContentContext = createContext();

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
};

export const ContentProvider = ({ children }) => {
  const [customContent, setCustomContent] = useState({});

  const getContent = (theme, stage) => {
    return customContent[theme]?.[stage] || null;
  };

  const updateContent = (theme, content) => {
    setCustomContent(prev => ({
      ...prev,
      [theme]: content
    }));
    
    // Save to localStorage for persistence
    localStorage.setItem('customContent', JSON.stringify({
      ...customContent,
      [theme]: content
    }));
    
    console.log(`Updated content for ${theme}:`, content);
  };

  const getAllContent = (theme) => {
    return customContent[theme] || {};
  };

  const resetContent = (theme) => {
    setCustomContent(prev => {
      const newContent = { ...prev };
      delete newContent[theme];
      
      // Update localStorage
      localStorage.setItem('customContent', JSON.stringify(newContent));
      
      return newContent;
    });
    
    console.log(`Reset content for ${theme}`);
  };

  const exportContent = (theme) => {
    const content = customContent[theme];
    if (content) {
      const dataStr = JSON.stringify(content, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `${theme}_content.json`);
      linkElement.click();
      
      console.log(`Exported content for ${theme}`);
    }
  };

  const importContent = (theme, contentData) => {
    try {
      const parsedContent = typeof contentData === 'string' ? JSON.parse(contentData) : contentData;
      updateContent(theme, parsedContent);
      console.log(`Imported content for ${theme}:`, parsedContent);
      return true;
    } catch (error) {
      console.error('Failed to import content:', error);
      return false;
    }
  };

  const hasCustomContent = (theme) => {
    return customContent[theme] && Object.keys(customContent[theme]).length > 0;
  };

  // Load content from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('customContent');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomContent(parsed);
        console.log('Loaded custom content from localStorage:', parsed);
      }
    } catch (error) {
      console.error('Failed to load custom content:', error);
    }
  }, []);

  const value = {
    customContent,
    getContent,
    updateContent,
    getAllContent,
    resetContent,
    exportContent,
    importContent,
    hasCustomContent
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};