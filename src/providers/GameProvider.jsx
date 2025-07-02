import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

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
  teamId: null,
  theme: 'murder-mystery',
  difficulty: 'medium',
  teamName: '',
  currentStage: 1,
  totalStages: 6,
  timeRemaining: 3600,
  hintsUsed: 0,
  hintsAvailable: 3,
  progress: {},
  isActive: false,
  isCompleted: false,
  isEnded: false,
  startTime: null,
  completionTime: null,
  isLoading: false,
  error: null
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'INITIALIZE_SESSION':
      return {
        ...state,
        ...action.payload,
        isActive: true,
        isEnded: false,
        isLoading: false,
        error: null,
        startTime: new Date().toISOString()
      };
    case 'LOAD_TEAM_DATA':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null
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
      const newStage = Math.min(state.currentStage + 1, state.totalStages);
      return {
        ...state,
        currentStage: newStage,
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
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Timer effect
  useEffect(() => {
    let timer;
    if (state.isActive && state.timeRemaining > 0 && !state.isEnded) {
      timer = setInterval(() => {
        const newTime = state.timeRemaining - 1;
        dispatch({ type: 'UPDATE_TIME', payload: newTime });
        if (newTime <= 0) {
          dispatch({ type: 'COMPLETE_GAME' });
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isActive, state.timeRemaining, state.isEnded]);

  // Game completion check
  useEffect(() => {
    if (state.currentStage > state.totalStages && state.isActive) {
      dispatch({ type: 'COMPLETE_GAME' });
    }
  }, [state.currentStage, state.totalStages, state.isActive]);

  const initializeSession = useCallback(async (config) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const sessionId = `session_${Date.now()}`;
      const hintsAvailable = config.difficulty === 'easy' ? 5 : 
                           config.difficulty === 'medium' ? 3 : 1;
      const timeRemaining = config.difficulty === 'easy' ? 5400 : 
                           config.difficulty === 'medium' ? 3600 : 2880;

      dispatch({
        type: 'INITIALIZE_SESSION',
        payload: {
          sessionId,
          teamId: `team_${Date.now()}`,
          teamName: config.teamName,
          theme: config.theme,
          difficulty: config.difficulty,
          timeRemaining,
          hintsAvailable,
          currentStage: 1,
          progress: {},
          hintsUsed: 0
        }
      });

      return sessionId;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize session' });
      return null;
    }
  }, []);

  const loadTeamBySessionId = useCallback(async (sessionId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Production data for the session
      dispatch({
        type: 'LOAD_TEAM_DATA',
        payload: {
          sessionId: sessionId,
          teamId: `team_${sessionId}`,
          teamName: 'Production Team',
          theme: 'murder-mystery',
          difficulty: 'medium',
          currentStage: 1,
          totalStages: 6,
          timeRemaining: 3600,
          hintsUsed: 0,
          hintsAvailable: 3,
          isActive: true,
          isCompleted: false,
          startTime: new Date().toISOString(),
          completionTime: null,
          progress: {}
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load team data' });
    }
  }, []);

  const updateProgress = useCallback(async (stage, progressValue) => {
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: { stage, progress: progressValue }
    });
  }, []);

  const advanceStage = useCallback(async () => {
    const newStage = state.currentStage + 1;
    if (newStage <= state.totalStages) {
      dispatch({ type: 'ADVANCE_STAGE' });
    } else {
      dispatch({ type: 'COMPLETE_GAME' });
    }
  }, [state.currentStage, state.totalStages]);

  const goToPreviousStage = useCallback(async () => {
    dispatch({ type: 'GO_TO_PREVIOUS_STAGE' });
  }, []);

  const goToNextStage = useCallback(async () => {
    dispatch({ type: 'GO_TO_NEXT_STAGE' });
  }, []);

  const useHint = useCallback(async () => {
    if (state.hintsAvailable > 0) {
      dispatch({ type: 'USE_HINT' });
      return true;
    }
    return false;
  }, [state.hintsAvailable]);

  const endGame = useCallback(async () => {
    dispatch({ type: 'END_GAME' });
  }, []);

  const value = {
    ...state,
    initializeSession,
    loadTeamBySessionId,
    updateProgress,
    advanceStage,
    goToPreviousStage,
    goToNextStage,
    useHint,
    endGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};