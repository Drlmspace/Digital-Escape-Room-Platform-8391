import React, { createContext, useContext, useReducer, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

const initialState = {
  sessionId: null,
  theme: 'murder-mystery',
  difficulty: 'medium',
  teamName: '',
  currentStage: 1,
  totalStages: 6,
  timeRemaining: 3600, // 60 minutes
  hintsUsed: 0,
  hintsAvailable: 3,
  progress: {},
  isActive: false,
  isCompleted: false,
  isEnded: false,
  solutions: {},
  multimedia: {},
  startTime: null,
  completionTime: null
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'INITIALIZE_SESSION':
      return {
        ...state,
        ...action.payload,
        isActive: true,
        isEnded: false,
        startTime: new Date().toISOString()
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.payload.stage]: action.payload.progress
        }
      };
    case 'ADVANCE_STAGE':
      return {
        ...state,
        currentStage: Math.min(state.currentStage + 1, state.totalStages),
        progress: {
          ...state.progress,
          [state.currentStage]: 100
        }
      };
    case 'GO_TO_PREVIOUS_STAGE':
      return {
        ...state,
        currentStage: Math.max(1, state.currentStage - 1)
      };
    case 'GO_TO_NEXT_STAGE':
      return {
        ...state,
        currentStage: Math.min(state.currentStage + 1, state.totalStages)
      };
    case 'GO_TO_STAGE':
      return {
        ...state,
        currentStage: Math.max(1, Math.min(action.payload, state.totalStages))
      };
    case 'USE_HINT':
      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
        hintsAvailable: Math.max(0, state.hintsAvailable - 1)
      };
    case 'UPDATE_TIME':
      return {
        ...state,
        timeRemaining: Math.max(0, action.payload)
      };
    case 'COMPLETE_GAME':
      return {
        ...state,
        isCompleted: true,
        isActive: false,
        completionTime: new Date().toISOString()
      };
    case 'END_GAME':
      return {
        ...state,
        isActive: false,
        isEnded: true,
        isCompleted: false
      };
    case 'SAVE_SOLUTION':
      return {
        ...state,
        solutions: {
          ...state.solutions,
          [action.payload.stage]: action.payload.solution
        }
      };
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    // Timer logic
    let timer;
    if (state.isActive && state.timeRemaining > 0 && !state.isEnded) {
      timer = setInterval(() => {
        dispatch({ type: 'UPDATE_TIME', payload: state.timeRemaining - 1 });
      }, 1000);
    } else if (state.timeRemaining === 0 && state.isActive) {
      dispatch({ type: 'COMPLETE_GAME' });
    }
    return () => clearInterval(timer);
  }, [state.isActive, state.timeRemaining, state.isEnded]);

  // Check if game should be completed when reaching final stage
  useEffect(() => {
    if (state.currentStage > state.totalStages && state.isActive) {
      dispatch({ type: 'COMPLETE_GAME' });
    }
  }, [state.currentStage, state.totalStages, state.isActive]);

  const initializeSession = (config) => {
    const sessionId = `session_${Date.now()}`;
    
    // Set hints based on difficulty
    const hintsAvailable = config.difficulty === 'easy' ? 5 : 
                          config.difficulty === 'medium' ? 3 : 1;
    
    // Set time based on difficulty
    const timeRemaining = config.difficulty === 'easy' ? 5400 : // 90 minutes
                          config.difficulty === 'medium' ? 3600 : // 60 minutes
                          2880; // 48 minutes
    
    dispatch({
      type: 'INITIALIZE_SESSION',
      payload: {
        sessionId,
        ...config,
        timeRemaining,
        hintsAvailable,
        currentStage: 1,
        progress: {},
        hintsUsed: 0
      }
    });
    
    return sessionId;
  };

  const updateProgress = (stage, progress) => {
    dispatch({ 
      type: 'UPDATE_PROGRESS', 
      payload: { stage, progress } 
    });
  };

  const advanceStage = () => {
    const newStage = state.currentStage + 1;
    if (newStage <= state.totalStages) {
      dispatch({ type: 'ADVANCE_STAGE' });
    } else {
      // Game completed
      dispatch({ type: 'COMPLETE_GAME' });
    }
  };

  const goToPreviousStage = () => {
    dispatch({ type: 'GO_TO_PREVIOUS_STAGE' });
  };

  const goToNextStage = () => {
    dispatch({ type: 'GO_TO_NEXT_STAGE' });
  };

  const goToStage = (stageNumber) => {
    dispatch({ type: 'GO_TO_STAGE', payload: stageNumber });
  };

  const useHint = () => {
    if (state.hintsAvailable > 0) {
      dispatch({ type: 'USE_HINT' });
      return true;
    }
    return false;
  };

  const saveSolution = (stage, solution) => {
    dispatch({ 
      type: 'SAVE_SOLUTION', 
      payload: { stage, solution } 
    });
  };

  const endGame = () => {
    dispatch({ type: 'END_GAME' });
  };

  const value = {
    ...state,
    initializeSession,
    updateProgress,
    advanceStage,
    goToPreviousStage,
    goToNextStage,
    goToStage,
    useHint,
    saveSolution,
    endGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};