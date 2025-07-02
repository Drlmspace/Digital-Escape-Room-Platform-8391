import React, { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [teams] = useState([
    {
      id: 'team-alpha',
      name: 'Team Alpha',
      players: 4,
      currentStage: 3,
      progress: 45,
      timeRemaining: 2145,
      hintsUsed: 2,
      status: 'active',
      difficulty: 'medium',
      theme: 'murder-mystery'
    }
  ]);

  const sendHint = async (teamId, hint) => {
    console.log(`Hint sent to team ${teamId}:`, hint);
  };

  const adjustDifficulty = async (teamId, adjustment) => {
    console.log(`Difficulty adjusted for team ${teamId}:`, adjustment);
  };

  const extendTime = async (teamId, minutes) => {
    console.log(`Time extended for team ${teamId}:`, minutes, 'minutes');
  };

  const broadcastMessage = async (message) => {
    console.log('Broadcasting message:', message);
  };

  const getTeamAnalytics = (teamId) => {
    return {
      completionTime: 1800,
      stagesCompleted: 3,
      hintsUsed: 2,
      efficiency: 85
    };
  };

  const value = {
    teams,
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