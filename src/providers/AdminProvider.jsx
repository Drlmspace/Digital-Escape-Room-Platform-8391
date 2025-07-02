import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadActiveTeams();
    
    // Set up real-time subscriptions
    const teamsSubscription = supabase
      .channel('teams-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'teams_er2024' },
        () => loadActiveTeams()
      )
      .subscribe();

    const progressSubscription = supabase
      .channel('progress-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'team_progress_er2024' },
        () => loadActiveTeams()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamsSubscription);
      supabase.removeChannel(progressSubscription);
    };
  }, []);

  const loadActiveTeams = async () => {
    setIsLoading(true);
    try {
      const { data: teamsData, error } = await supabase
        .from('teams_er2024')
        .select(`
          *,
          team_progress_er2024 (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTeams = teamsData?.map(team => {
        const progressData = team.team_progress_er2024 || [];
        const completedStages = progressData.filter(p => p.is_completed).length;
        const currentStageProgress = progressData.find(p => p.stage_number === team.current_stage);
        
        return {
          id: team.id,
          name: team.team_name,
          players: Math.floor(Math.random() * 6) + 1, // Simulated player count
          currentStage: team.current_stage,
          progress: currentStageProgress?.progress_percentage || 0,
          timeRemaining: team.time_remaining,
          hintsUsed: team.hints_used,
          status: getTeamStatus(team, completedStages),
          difficulty: team.difficulty,
          theme: team.theme,
          sessionId: team.session_id,
          completedStages
        };
      }) || [];

      setTeams(formattedTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamStatus = (team, completedStages) => {
    if (team.is_completed) return 'completed';
    if (team.time_remaining < 300) return 'urgent'; // Less than 5 minutes
    if (team.hints_used >= team.hints_available) return 'struggling';
    if (completedStages >= 4) return 'excelling';
    return 'active';
  };

  const createSession = async (config) => {
    try {
      const sessionId = `admin_session_${Date.now()}`;
      
      const { data: session, error } = await supabase
        .from('game_sessions_er2024')
        .insert({
          session_name: config.name || 'New Game Session',
          admin_user: config.adminUser || 'Admin',
          status: 'active',
          settings: config
        })
        .select()
        .single();

      if (error) throw error;

      setSessions(prev => [...prev, session]);
      setActiveSession(session);
      return session.id;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  const sendHint = async (teamId, hint) => {
    try {
      // Log the admin action
      await supabase
        .from('admin_actions_er2024')
        .insert({
          team_id: teamId,
          admin_user: 'Admin',
          action_type: 'hint_sent',
          action_data: { custom_hint: hint },
          message: hint
        });

      // In a real implementation, you might also update the team's available hints
      console.log(`Hint sent to team ${teamId}:`, hint);
      
      // Refresh teams data
      await loadActiveTeams();
    } catch (error) {
      console.error('Error sending hint:', error);
    }
  };

  const adjustDifficulty = async (teamId, adjustment) => {
    try {
      const team = teams.find(t => t.id === teamId);
      if (!team) return;

      let newDifficulty = team.difficulty;
      let hintsToAdd = 0;

      if (adjustment === 'easier') {
        if (team.difficulty === 'difficult') {
          newDifficulty = 'medium';
          hintsToAdd = 2;
        } else if (team.difficulty === 'medium') {
          newDifficulty = 'easy';
          hintsToAdd = 2;
        }
      } else if (adjustment === 'harder') {
        if (team.difficulty === 'easy') {
          newDifficulty = 'medium';
        } else if (team.difficulty === 'medium') {
          newDifficulty = 'difficult';
        }
      }

      // Update team in database
      await supabase
        .from('teams_er2024')
        .update({
          difficulty: newDifficulty,
          hints_available: team.hintsAvailable + hintsToAdd
        })
        .eq('id', teamId);

      // Log admin action
      await supabase
        .from('admin_actions_er2024')
        .insert({
          team_id: teamId,
          admin_user: 'Admin',
          action_type: 'difficulty_adjusted',
          action_data: { 
            from: team.difficulty, 
            to: newDifficulty, 
            hints_added: hintsToAdd 
          },
          message: `Difficulty adjusted from ${team.difficulty} to ${newDifficulty}`
        });

      console.log(`Difficulty adjusted for team ${teamId} to:`, newDifficulty);
      await loadActiveTeams();
    } catch (error) {
      console.error('Error adjusting difficulty:', error);
    }
  };

  const extendTime = async (teamId, additionalMinutes) => {
    try {
      const team = teams.find(t => t.id === teamId);
      if (!team) return;

      const additionalSeconds = additionalMinutes * 60;
      const newTimeRemaining = team.timeRemaining + additionalSeconds;

      await supabase
        .from('teams_er2024')
        .update({ time_remaining: newTimeRemaining })
        .eq('id', teamId);

      // Log admin action
      await supabase
        .from('admin_actions_er2024')
        .insert({
          team_id: teamId,
          admin_user: 'Admin',
          action_type: 'time_extended',
          action_data: { minutes_added: additionalMinutes },
          message: `Extended time by ${additionalMinutes} minutes`
        });

      console.log(`Extended time for team ${teamId} by ${additionalMinutes} minutes`);
      await loadActiveTeams();
    } catch (error) {
      console.error('Error extending time:', error);
    }
  };

  const broadcastMessage = async (message) => {
    try {
      // Send message to all active teams
      const activeTeamIds = teams.filter(t => t.status !== 'completed').map(t => t.id);
      
      const broadcasts = activeTeamIds.map(teamId => ({
        team_id: teamId,
        admin_user: 'Admin',
        action_type: 'message_sent',
        action_data: { broadcast: true },
        message: message
      }));

      if (broadcasts.length > 0) {
        await supabase
          .from('admin_actions_er2024')
          .insert(broadcasts);
      }

      console.log('Broadcasting message to all teams:', message);
    } catch (error) {
      console.error('Error broadcasting message:', error);
    }
  };

  const getTeamAnalytics = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return {};

    return {
      completionTime: 3600 - team.timeRemaining,
      stagesCompleted: team.completedStages || 0,
      hintsUsed: team.hintsUsed,
      collaborationScore: Math.floor(Math.random() * 100), // Simulated
      progressRate: team.progress,
      efficiency: calculateEfficiency(team)
    };
  };

  const calculateEfficiency = (team) => {
    // Simple efficiency calculation based on progress vs time used
    const timeUsed = 3600 - team.timeRemaining;
    const progressMade = (team.currentStage - 1) * 100 + team.progress;
    return timeUsed > 0 ? Math.round((progressMade / timeUsed) * 100) : 0;
  };

  const pauseAllTeams = async () => {
    try {
      await supabase
        .from('teams_er2024')
        .update({ is_active: false })
        .eq('is_active', true);

      await loadActiveTeams();
      console.log('All teams paused');
    } catch (error) {
      console.error('Error pausing teams:', error);
    }
  };

  const resumeAllTeams = async () => {
    try {
      await supabase
        .from('teams_er2024')
        .update({ is_active: true })
        .eq('is_completed', false);

      await loadActiveTeams();
      console.log('All teams resumed');
    } catch (error) {
      console.error('Error resuming teams:', error);
    }
  };

  const value = {
    sessions,
    activeSession,
    teams,
    analytics,
    isLoading,
    createSession,
    sendHint,
    adjustDifficulty,
    extendTime,
    broadcastMessage,
    getTeamAnalytics,
    loadActiveTeams,
    pauseAllTeams,
    resumeAllTeams
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};