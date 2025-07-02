import React, { createContext, useContext, useReducer, useEffect } from 'react';
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
  completionTime: null,
  isLoading: false
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'INITIALIZE_SESSION':
      return {
        ...state,
        ...action.payload,
        isActive: true,
        isEnded: false,
        startTime: new Date().toISOString()
      };
    case 'LOAD_TEAM_DATA':
      return { ...state, ...action.payload, isLoading: false };
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
      return { ...state, currentStage: Math.max(1, state.currentStage - 1) };
    case 'GO_TO_NEXT_STAGE':
      return { ...state, currentStage: Math.min(state.currentStage + 1, state.totalStages) };
    case 'GO_TO_STAGE':
      return { ...state, currentStage: Math.max(1, Math.min(action.payload, state.totalStages)) };
    case 'USE_HINT':
      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
        hintsAvailable: Math.max(0, state.hintsAvailable - 1)
      };
    case 'UPDATE_TIME':
      return { ...state, timeRemaining: Math.max(0, action.payload) };
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
    if (state.isActive && state.timeRemaining > 0 && !state.isEnded && state.teamId) {
      timer = setInterval(async () => {
        const newTime = state.timeRemaining - 1;
        dispatch({ type: 'UPDATE_TIME', payload: newTime });
        
        // Update time in database every 10 seconds
        if (newTime % 10 === 0) {
          await updateTeamInDatabase(state.teamId, { time_remaining: newTime });
        }
      }, 1000);
    } else if (state.timeRemaining === 0 && state.isActive) {
      dispatch({ type: 'COMPLETE_GAME' });
      if (state.teamId) {
        completeGameInDatabase(state.teamId);
      }
    }

    return () => clearInterval(timer);
  }, [state.isActive, state.timeRemaining, state.isEnded, state.teamId]);

  // Check if game should be completed when reaching final stage
  useEffect(() => {
    if (state.currentStage > state.totalStages && state.isActive) {
      dispatch({ type: 'COMPLETE_GAME' });
      if (state.teamId) {
        completeGameInDatabase(state.teamId);
      }
    }
  }, [state.currentStage, state.totalStages, state.isActive, state.teamId]);

  const initializeSession = async (config) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const sessionId = `session_${Date.now()}`;
      
      // Set hints based on difficulty
      const hintsAvailable = config.difficulty === 'easy' ? 5 : 
                           config.difficulty === 'medium' ? 3 : 1;
      
      // Set time based on difficulty
      const timeRemaining = config.difficulty === 'easy' ? 5400 : // 90 minutes
                           config.difficulty === 'medium' ? 3600 : // 60 minutes
                           2880; // 48 minutes

      // Create team in database
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

      // Initialize stage progress
      const stageProgressData = Array.from({ length: 6 }, (_, i) => ({
        team_id: team.id,
        stage_number: i + 1,
        progress_percentage: 0,
        is_completed: false
      }));

      await supabase
        .from('team_progress_er2024')
        .insert(stageProgressData);

      dispatch({
        type: 'INITIALIZE_SESSION',
        payload: {
          sessionId,
          teamId: team.id,
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

      dispatch({ type: 'SET_LOADING', payload: false });
      return sessionId;
    } catch (error) {
      console.error('Error initializing session:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return null;
    }
  };

  const loadTeamBySessionId = async (sessionId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data: team, error } = await supabase
        .from('teams_er2024')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) throw error;

      // Load progress data
      const { data: progressData } = await supabase
        .from('team_progress_er2024')
        .select('*')
        .eq('team_id', team.id);

      const progress = {};
      progressData?.forEach(p => {
        progress[p.stage_number] = p.progress_percentage;
      });

      dispatch({
        type: 'LOAD_TEAM_DATA',
        payload: {
          sessionId: team.session_id,
          teamId: team.id,
          teamName: team.team_name,
          theme: team.theme,
          difficulty: team.difficulty,
          currentStage: team.current_stage,
          totalStages: team.total_stages,
          timeRemaining: team.time_remaining,
          hintsUsed: team.hints_used,
          hintsAvailable: team.hints_available,
          isActive: team.is_active,
          isCompleted: team.is_completed,
          startTime: team.start_time,
          completionTime: team.completion_time,
          progress
        }
      });
    } catch (error) {
      console.error('Error loading team:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTeamInDatabase = async (teamId, updates) => {
    try {
      await supabase
        .from('teams_er2024')
        .update(updates)
        .eq('id', teamId);
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  const updateProgress = async (stage, progressValue) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: { stage, progress: progressValue } });
    
    if (state.teamId) {
      try {
        await supabase
          .from('team_progress_er2024')
          .upsert({
            team_id: state.teamId,
            stage_number: stage,
            progress_percentage: progressValue,
            is_completed: progressValue >= 100,
            completed_at: progressValue >= 100 ? new Date().toISOString() : null
          });
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const advanceStage = async () => {
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
  };

  const completeGameInDatabase = async (teamId) => {
    try {
      const completionTime = new Date().toISOString();
      
      // Update team as completed
      await supabase
        .from('teams_er2024')
        .update({
          is_completed: true,
          is_active: false,
          completion_time: completionTime
        })
        .eq('id', teamId);

      // Add to leaderboard
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
    } catch (error) {
      console.error('Error completing game:', error);
    }
  };

  const calculatePerformanceRating = (team) => {
    const { current_stage, hints_used, difficulty } = team;
    
    if (current_stage === 6 && hints_used <= 1) return 'LEGENDARY';
    if (current_stage === 6 && hints_used <= 3) return 'EXCEPTIONAL';
    if (current_stage === 6) return 'EXCELLENT';
    if (current_stage >= 4) return 'VERY GOOD';
    if (current_stage >= 2) return 'GOOD';
    return 'PARTICIPANT';
  };

  const goToPreviousStage = async () => {
    dispatch({ type: 'GO_TO_PREVIOUS_STAGE' });
    if (state.teamId) {
      await updateTeamInDatabase(state.teamId, { current_stage: Math.max(1, state.currentStage - 1) });
    }
  };

  const goToNextStage = async () => {
    dispatch({ type: 'GO_TO_NEXT_STAGE' });
    if (state.teamId) {
      await updateTeamInDatabase(state.teamId, { 
        current_stage: Math.min(state.currentStage + 1, state.totalStages) 
      });
    }
  };

  const goToStage = async (stageNumber) => {
    dispatch({ type: 'GO_TO_STAGE', payload: stageNumber });
    if (state.teamId) {
      await updateTeamInDatabase(state.teamId, { current_stage: stageNumber });
    }
  };

  const useHint = async () => {
    if (state.hintsAvailable > 0) {
      dispatch({ type: 'USE_HINT' });
      
      if (state.teamId) {
        await updateTeamInDatabase(state.teamId, {
          hints_used: state.hintsUsed + 1,
          hints_available: state.hintsAvailable - 1
        });

        // Log admin action
        await supabase
          .from('admin_actions_er2024')
          .insert({
            team_id: state.teamId,
            action_type: 'hint_used',
            action_data: { stage: state.currentStage },
            message: `Team used hint on stage ${state.currentStage}`
          });
      }
      
      return true;
    }
    return false;
  };

  const saveSolution = async (stage, solution) => {
    dispatch({ type: 'SAVE_SOLUTION', payload: { stage, solution } });
    
    if (state.teamId) {
      try {
        await supabase
          .from('team_progress_er2024')
          .upsert({
            team_id: state.teamId,
            stage_number: stage,
            solution_submitted: solution,
            attempts: 1
          });
      } catch (error) {
        console.error('Error saving solution:', error);
      }
    }
  };

  const endGame = async () => {
    dispatch({ type: 'END_GAME' });
    
    if (state.teamId) {
      await updateTeamInDatabase(state.teamId, {
        is_active: false,
        is_completed: false
      });
    }
  };

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