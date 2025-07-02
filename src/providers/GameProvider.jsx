import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
  solutions: {},
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

  // Safe localStorage operations
  const safeLocalStorage = {
    getItem: (key) => {
      try {
        return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      } catch (error) {
        console.warn('localStorage getItem failed:', error);
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value);
          return true;
        }
        return false;
      } catch (error) {
        console.warn('localStorage setItem failed:', error);
        return false;
      }
    }
  };

  // Safe database operations
  const safeDbOperation = useCallback(async (operation) => {
    try {
      return await operation();
    } catch (error) {
      console.warn('Database operation failed:', error);
      return { data: null, error };
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let timer;
    if (state.isActive && state.timeRemaining > 0 && !state.isEnded && state.teamId) {
      timer = setInterval(async () => {
        const newTime = state.timeRemaining - 1;
        dispatch({ type: 'UPDATE_TIME', payload: newTime });
        
        // Update database every 10 seconds
        if (newTime % 10 === 0) {
          await updateTeamInDatabase(state.teamId, { time_remaining: newTime });
        }
        
        // Check for time up
        if (newTime <= 0) {
          dispatch({ type: 'COMPLETE_GAME' });
          if (state.teamId) {
            completeGameInDatabase(state.teamId);
          }
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isActive, state.timeRemaining, state.isEnded, state.teamId]);

  // Game completion check
  useEffect(() => {
    if (state.currentStage > state.totalStages && state.isActive) {
      dispatch({ type: 'COMPLETE_GAME' });
      if (state.teamId) {
        completeGameInDatabase(state.teamId);
      }
    }
  }, [state.currentStage, state.totalStages, state.isActive, state.teamId]);

  const updateTeamInDatabase = useCallback(async (teamId, updates) => {
    const result = await safeDbOperation(async () => {
      return await supabase
        .from('teams_er2024')
        .update(updates)
        .eq('id', teamId);
    });
    
    if (result.error) {
      // Fallback to localStorage
      const sessionId = state.sessionId;
      if (sessionId) {
        const teamData = safeLocalStorage.getItem(`team_${sessionId}`);
        if (teamData) {
          try {
            const team = JSON.parse(teamData);
            const updatedTeam = { ...team, ...updates };
            safeLocalStorage.setItem(`team_${sessionId}`, JSON.stringify(updatedTeam));
          } catch (error) {
            console.warn('Failed to update localStorage:', error);
          }
        }
      }
    }
  }, [state.sessionId, safeDbOperation, safeLocalStorage]);

  const completeGameInDatabase = useCallback(async (teamId) => {
    const result = await safeDbOperation(async () => {
      const completionTime = new Date().toISOString();
      
      // Update team as completed
      const updateResult = await supabase
        .from('teams_er2024')
        .update({
          is_completed: true,
          is_active: false,
          completion_time: completionTime
        })
        .eq('id', teamId);

      if (updateResult.error) throw updateResult.error;

      // Get team data for leaderboard
      const { data: team } = await supabase
        .from('teams_er2024')
        .select('*')
        .eq('id', teamId)
        .single();

      if (team) {
        const completionTimeSeconds = 3600 - team.time_remaining;
        const performanceRating = calculatePerformanceRating(team);
        
        await supabase
          .from('leaderboard_er2024')
          .insert({
            team_name: team.team_name,
            theme: team.theme,
            difficulty: team.difficulty,
            completion_time_seconds: completionTimeSeconds,
            stages_completed: team.current_stage,
            hints_used: team.hints_used,
            performance_rating: performanceRating,
            session_id: team.session_id
          });
      }

      return { data: team, error: null };
    });

    if (result.error) {
      // Fallback to localStorage
      const sessionId = state.sessionId;
      if (sessionId) {
        const teamData = safeLocalStorage.getItem(`team_${sessionId}`);
        if (teamData) {
          try {
            const team = JSON.parse(teamData);
            team.is_completed = true;
            team.is_active = false;
            team.completion_time = new Date().toISOString();
            safeLocalStorage.setItem(`team_${sessionId}`, JSON.stringify(team));
          } catch (error) {
            console.warn('Failed to update localStorage completion:', error);
          }
        }
      }
    }
  }, [state.sessionId, safeDbOperation, safeLocalStorage]);

  const calculatePerformanceRating = useCallback((team) => {
    const { current_stage, hints_used } = team;
    
    if (current_stage === 6 && hints_used <= 1) return 'LEGENDARY';
    if (current_stage === 6 && hints_used <= 3) return 'EXCEPTIONAL';
    if (current_stage === 6) return 'EXCELLENT';
    if (current_stage >= 4) return 'VERY GOOD';
    if (current_stage >= 2) return 'GOOD';
    return 'PARTICIPANT';
  }, []);

  const initializeSession = useCallback(async (config) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const sessionId = `session_${Date.now()}`;
      
      // Set hints based on difficulty
      const hintsAvailable = config.difficulty === 'easy' ? 5 : 
                           config.difficulty === 'medium' ? 3 : 1;
      
      // Set time based on difficulty
      const timeRemaining = config.difficulty === 'easy' ? 5400 : // 90 minutes
                           config.difficulty === 'medium' ? 3600 : // 60 minutes
                           2880; // 48 minutes

      let teamId = `team_${Date.now()}`;
      
      // Try database first
      const dbResult = await safeDbOperation(async () => {
        const { data: team, error } = await supabase
          .from('teams_er2024')
          .insert({
            team_name: config.teamName,
            session_id: sessionId,
            theme: config.theme,
            difficulty: config.difficulty,
            current_stage: 1,
            total_stages: 6,
            time_remaining: timeRemaining,
            hints_used: 0,
            hints_available: hintsAvailable,
            is_active: true,
            start_time: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return { data: team, error: null };
      });

      if (dbResult.data && !dbResult.error) {
        teamId = dbResult.data.id;
        
        // Initialize stage progress
        const stageProgressData = Array.from({ length: 6 }, (_, i) => ({
          team_id: dbResult.data.id,
          stage_number: i + 1,
          progress_percentage: 0,
          is_completed: false
        }));

        await safeDbOperation(async () => {
          return await supabase
            .from('team_progress_er2024')
            .insert(stageProgressData);
        });
      } else {
        // Fallback to localStorage
        const teamData = {
          id: teamId,
          team_name: config.teamName,
          session_id: sessionId,
          theme: config.theme,
          difficulty: config.difficulty,
          current_stage: 1,
          total_stages: 6,
          time_remaining: timeRemaining,
          hints_used: 0,
          hints_available: hintsAvailable,
          is_active: true,
          start_time: new Date().toISOString()
        };
        safeLocalStorage.setItem(`team_${sessionId}`, JSON.stringify(teamData));
      }

      dispatch({
        type: 'INITIALIZE_SESSION',
        payload: {
          sessionId,
          teamId: teamId,
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
      console.error('Error initializing session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize session' });
      return null;
    }
  }, [safeDbOperation, safeLocalStorage]);

  const loadTeamBySessionId = useCallback(async (sessionId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      // Try database first
      const dbResult = await safeDbOperation(async () => {
        const { data: team, error } = await supabase
          .from('teams_er2024')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (error) throw error;
        return { data: team, error: null };
      });

      if (dbResult.data && !dbResult.error) {
        // Load progress data
        const progressResult = await safeDbOperation(async () => {
          return await supabase
            .from('team_progress_er2024')
            .select('*')
            .eq('team_id', dbResult.data.id);
        });

        const progress = {};
        if (progressResult.data) {
          progressResult.data.forEach(p => {
            progress[p.stage_number] = p.progress_percentage;
          });
        }

        dispatch({
          type: 'LOAD_TEAM_DATA',
          payload: {
            sessionId: dbResult.data.session_id,
            teamId: dbResult.data.id,
            teamName: dbResult.data.team_name,
            theme: dbResult.data.theme,
            difficulty: dbResult.data.difficulty,
            currentStage: dbResult.data.current_stage,
            totalStages: dbResult.data.total_stages,
            timeRemaining: dbResult.data.time_remaining,
            hintsUsed: dbResult.data.hints_used,
            hintsAvailable: dbResult.data.hints_available,
            isActive: dbResult.data.is_active,
            isCompleted: dbResult.data.is_completed,
            startTime: dbResult.data.start_time,
            completionTime: dbResult.data.completion_time,
            progress
          }
        });
        return;
      }

      // Fallback to localStorage
      const teamData = safeLocalStorage.getItem(`team_${sessionId}`);
      if (teamData) {
        try {
          const team = JSON.parse(teamData);
          dispatch({
            type: 'LOAD_TEAM_DATA',
            payload: {
              sessionId: team.session_id,
              teamId: team.id,
              teamName: team.team_name,
              theme: team.theme,
              difficulty: team.difficulty,
              currentStage: team.current_stage || 1,
              totalStages: team.total_stages || 6,
              timeRemaining: team.time_remaining || 3600,
              hintsUsed: team.hints_used || 0,
              hintsAvailable: team.hints_available || 3,
              isActive: team.is_active !== false,
              isCompleted: team.is_completed || false,
              startTime: team.start_time,
              completionTime: team.completion_time,
              progress: team.progress || {}
            }
          });
        } catch (parseError) {
          throw new Error('Failed to parse team data');
        }
      } else {
        // Create demo session
        dispatch({
          type: 'LOAD_TEAM_DATA',
          payload: {
            sessionId: sessionId,
            teamId: `demo_${sessionId}`,
            teamName: 'Demo Team',
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
      }
    } catch (error) {
      console.error('Error loading team:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load team data' });
    }
  }, [safeDbOperation, safeLocalStorage]);

  const updateProgress = useCallback(async (stage, progressValue) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: { stage, progress: progressValue } });
    
    if (state.teamId) {
      const result = await safeDbOperation(async () => {
        return await supabase
          .from('team_progress_er2024')
          .upsert({
            team_id: state.teamId,
            stage_number: stage,
            progress_percentage: progressValue,
            is_completed: progressValue >= 100,
            completed_at: progressValue >= 100 ? new Date().toISOString() : null
          });
      });

      if (result.error) {
        // Update localStorage as fallback
        const sessionId = state.sessionId;
        if (sessionId) {
          const teamData = safeLocalStorage.getItem(`team_${sessionId}`);
          if (teamData) {
            try {
              const team = JSON.parse(teamData);
              team.progress = team.progress || {};
              team.progress[stage] = progressValue;
              safeLocalStorage.setItem(`team_${sessionId}`, JSON.stringify(team));
            } catch (error) {
              console.warn('Failed to update progress in localStorage:', error);
            }
          }
        }
      }
    }
  }, [state.teamId, state.sessionId, safeDbOperation, safeLocalStorage]);

  const advanceStage = useCallback(async () => {
    const newStage = state.currentStage + 1;
    if (newStage <= state.totalStages) {
      dispatch({ type: 'ADVANCE_STAGE' });
      
      if (state.teamId) {
        await updateTeamInDatabase(state.teamId, { current_stage: newStage });
      }
    } else {
      // Game completed
      dispatch({ type: 'COMPLETE_GAME' });
      if (state.teamId) {
        completeGameInDatabase(state.teamId);
      }
    }
  }, [state.currentStage, state.totalStages, state.teamId, updateTeamInDatabase, completeGameInDatabase]);

  const goToPreviousStage = useCallback(async () => {
    dispatch({ type: 'GO_TO_PREVIOUS_STAGE' });
    if (state.teamId) {
      await updateTeamInDatabase(state.teamId, { 
        current_stage: Math.max(1, state.currentStage - 1) 
      });
    }
  }, [state.teamId, state.currentStage, updateTeamInDatabase]);

  const goToNextStage = useCallback(async () => {
    dispatch({ type: 'GO_TO_NEXT_STAGE' });
    if (state.teamId) {
      await updateTeamInDatabase(state.teamId, { 
        current_stage: Math.min(state.currentStage + 1, state.totalStages) 
      });
    }
  }, [state.teamId, state.currentStage, state.totalStages, updateTeamInDatabase]);

  const goToStage = useCallback(async (stageNumber) => {
    dispatch({ type: 'GO_TO_STAGE', payload: stageNumber });
    if (state.teamId) {
      await updateTeamInDatabase(state.teamId, { current_stage: stageNumber });
    }
  }, [state.teamId, updateTeamInDatabase]);

  const useHint = useCallback(async () => {
    if (state.hintsAvailable > 0) {
      dispatch({ type: 'USE_HINT' });
      
      if (state.teamId) {
        await updateTeamInDatabase(state.teamId, {
          hints_used: state.hintsUsed + 1,
          hints_available: state.hintsAvailable - 1
        });

        // Log admin action
        await safeDbOperation(async () => {
          return await supabase
            .from('admin_actions_er2024')
            .insert({
              team_id: state.teamId,
              action_type: 'hint_used',
              action_data: { stage: state.currentStage },
              message: `Team used hint on stage ${state.currentStage}`
            });
        });
      }
      
      return true;
    }
    return false;
  }, [state.hintsAvailable, state.teamId, state.hintsUsed, state.currentStage, updateTeamInDatabase, safeDbOperation]);

  const saveSolution = useCallback(async (stage, solution) => {
    dispatch({ type: 'SAVE_SOLUTION', payload: { stage, solution } });
    
    if (state.teamId) {
      await safeDbOperation(async () => {
        return await supabase
          .from('team_progress_er2024')
          .upsert({
            team_id: state.teamId,
            stage_number: stage,
            solution_submitted: solution,
            attempts: 1
          });
      });
    }
  }, [state.teamId, safeDbOperation]);

  const endGame = useCallback(async () => {
    dispatch({ type: 'END_GAME' });
    
    if (state.teamId) {
      await updateTeamInDatabase(state.teamId, {
        is_active: false,
        is_completed: false
      });
    }
  }, [state.teamId, updateTeamInDatabase]);

  const value = {
    ...state,
    initializeSession,
    loadTeamBySessionId,
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