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
  // Single team state instead of multiple teams array
  const [currentTeam] = useState({
    id: 'active-team',
    name: 'Current Team',
    players: 4,
    currentStage: 3,
    progress: 45,
    timeRemaining: 2145,
    hintsUsed: 2,
    status: 'active',
    difficulty: 'medium',
    theme: 'murder-mystery'
  });

  const sendHint = async (teamId, hint) => {
    console.log(`Hint sent to team ${teamId}:`, hint);
    // In real implementation, this would send the hint to the team
  };

  const adjustDifficulty = async (teamId, adjustment) => {
    console.log(`Difficulty adjusted for team ${teamId}:`, adjustment);
    // In real implementation, this would adjust the game difficulty
  };

  const extendTime = async (teamId, minutes) => {
    console.log(`Time extended for team ${teamId}:`, minutes, 'minutes');
    // In real implementation, this would extend the team's time
  };

  const broadcastMessage = async (message) => {
    console.log('Broadcasting message to team:', message);
    // In real implementation, this would send a message to the team
  };

  const getTeamAnalytics = (teamId) => {
    return {
      completionTime: 1800,
      stagesCompleted: 3,
      hintsUsed: 2,
      efficiency: 85
    };
  };

  const pauseGame = async (teamId) => {
    console.log(`Game paused for team ${teamId}`);
    // In real implementation, this would pause the game timer
  };

  const resumeGame = async (teamId) => {
    console.log(`Game resumed for team ${teamId}`);
    // In real implementation, this would resume the game timer
  };

  const value = {
    currentTeam,
    sendHint,
    adjustDifficulty,
    extendTime,
    broadcastMessage,
    getTeamAnalytics,
    pauseGame,
    resumeGame
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};