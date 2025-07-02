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
    return null; // Return null to use default content
  };

  const updateContent = (theme, content) => {
    setCustomContent(prev => ({
      ...prev,
      [theme]: content
    }));
  };

  const getAllContent = (theme) => {
    return customContent[theme] || {};
  };

  const resetContent = (theme) => {
    setCustomContent(prev => {
      const newContent = { ...prev };
      delete newContent[theme];
      return newContent;
    });
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
    }
  };

  const importContent = (theme, contentData) => {
    try {
      const parsedContent = typeof contentData === 'string' ? JSON.parse(contentData) : contentData;
      updateContent(theme, parsedContent);
      return true;
    } catch (error) {
      return false;
    }
  };

  const hasCustomContent = (theme) => {
    return customContent[theme] && Object.keys(customContent[theme]).length > 0;
  };

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