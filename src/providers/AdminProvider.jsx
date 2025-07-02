import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [teams, setTeams] = useState([]);
  const [analytics, setAnalytics] = useState({});

  const createSession = (config) => {
    const newSession = {
      id: `session_${Date.now()}`,
      ...config,
      createdAt: new Date(),
      status: 'active',
      teams: []
    };
    
    setSessions(prev => [...prev, newSession]);
    setActiveSession(newSession);
    return newSession.id;
  };

  const sendHint = (teamId, hint) => {
    // Implementation for sending hints to specific teams
    console.log(`Sending hint to team ${teamId}:`, hint);
  };

  const adjustDifficulty = (teamId, newDifficulty) => {
    // Implementation for adjusting difficulty
    console.log(`Adjusting difficulty for team ${teamId} to:`, newDifficulty);
  };

  const extendTime = (teamId, additionalMinutes) => {
    // Implementation for extending time
    console.log(`Extending time for team ${teamId} by ${additionalMinutes} minutes`);
  };

  const broadcastMessage = (message) => {
    // Implementation for broadcasting to all teams
    console.log('Broadcasting message:', message);
  };

  const getTeamAnalytics = (teamId) => {
    return analytics[teamId] || {
      completionTime: 0,
      stagesCompleted: 0,
      hintsUsed: 0,
      collaborationScore: 0
    };
  };

  const value = {
    sessions,
    activeSession,
    teams,
    analytics,
    createSession,
    sendHint,
    adjustDifficulty,
    extendTime,
    broadcastMessage,
    getTeamAnalytics
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};