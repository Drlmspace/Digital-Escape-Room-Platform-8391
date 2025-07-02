import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Users, Search, Skull, Wand2 } from 'lucide-react';
import { useGame } from '../providers/GameProvider';
import { useAccessibility } from '../providers/AccessibilityProvider';
import { useContent } from '../providers/ContentProvider';

const SetupInterface = () => {
  const navigate = useNavigate();
  const { initializeSession } = useGame();
  const { announceToScreenReader } = useAccessibility();
  const { getContent } = useContent();

  const [config, setConfig] = useState({
    theme: 'murder-mystery',
    difficulty: 'medium',
    teamName: ''
  });

  // Get custom content for themes
  const getThemeInfo = (themeId) => {
    const customContent = getContent(themeId, 'gameInfo');
    
    const defaultThemes = {
      'murder-mystery': {
        id: 'murder-mystery',
        name: 'The Midnight Murder',
        description: 'Solve a classic whodunit in a Victorian mansion. Examine evidence, interview suspects, and catch the killer.',
        difficulty: 'Adaptive',
        duration: '60 minutes',
        icon: Search,
        atmosphere: 'Detective noir with period props',
        features: ['Crime scene investigation', 'Forensic evidence', 'Suspect interviews', 'Timeline reconstruction']
      },
      'haunted-mansion': {
        id: 'haunted-mansion',
        name: 'Cursed Manor',
        description: 'Escape from a supernatural mansion filled with ghosts, curses, and dark family secrets.',
        difficulty: 'Adaptive',
        duration: '60 minutes',
        icon: Skull,
        atmosphere: 'Gothic horror with jump scares',
        features: ['Paranormal investigation', 'Séance rituals', 'Cursed artifacts', 'Spirit communication']
      },
      'wizards-tower': {
        id: 'wizards-tower',
        name: 'The Enchanted Tower',
        description: 'Master magical spells, brew potions, and overcome mystical challenges in a wizard\'s tower.',
        difficulty: 'Adaptive',
        duration: '60 minutes',
        icon: Wand2,
        atmosphere: 'Magical fantasy with enchanted elements',
        features: ['Spell casting', 'Potion brewing', 'Ancient riddles', 'Magical artifacts']
      }
    };
    
    const defaultTheme = defaultThemes[themeId];
    
    if (customContent) {
      return {
        ...defaultTheme,
        name: customContent.gameTitle || defaultTheme.name,
        description: customContent.gameDescription || defaultTheme.description
      };
    }
    
    return defaultTheme;
  };

  const themes = [
    getThemeInfo('murder-mystery'),
    getThemeInfo('haunted-mansion'),
    getThemeInfo('wizards-tower')
  ];

  const difficulties = [
    {
      id: 'easy',
      name: 'Novice',
      description: '5 hints available, extra time, simplified puzzles',
      timeMultiplier: 1.5,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'medium',
      name: 'Detective',
      description: '3 hints available, standard time, balanced challenges',
      timeMultiplier: 1.0,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'difficult',
      name: 'Master',
      description: '1 hint available, reduced time, advanced puzzles',
      timeMultiplier: 0.8,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const handleStartGame = () => {
    if (!config.teamName.trim()) {
      announceToScreenReader('Please enter a team name before starting');
      return;
    }

    const sessionId = initializeSession(config);
    announceToScreenReader(`Starting ${config.theme} escape room for team ${config.teamName} on ${config.difficulty} difficulty`);
    navigate(`/game/${sessionId}`);
  };

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    announceToScreenReader(`${key} changed to ${value}`);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">Choose Your Escape Room</h1>
        </motion.div>

        {/* Team Name Input */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
          aria-labelledby="team-name-section"
        >
          <h2 id="team-name-section" className="text-2xl font-semibold text-white mb-6">
            Name Your Team
          </h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <label htmlFor="team-name" className="block text-white font-semibold mb-3">
              <Users className="w-5 h-5 inline mr-2" aria-hidden="true" />
              Team Name
            </label>
            <input
              id="team-name"
              type="text"
              value={config.teamName}
              onChange={(e) => handleConfigChange('teamName', e.target.value)}
              placeholder="Enter your team name (e.g., The Mystery Solvers, Team Alpha, etc.)"
              className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg"
              aria-describedby="team-name-help"
              maxLength={50}
              autoComplete="off"
            />
            <p id="team-name-help" className="text-sm text-gray-400 mt-3">
              💡 Your team name will appear on certificates and leaderboards. Choose something memorable!
            </p>
            {config.teamName && (
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-sm">
                  🏆 Certificate will be awarded to: <span className="font-semibold">"{config.teamName}"</span>
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Theme Selection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
          aria-labelledby="theme-selection"
        >
          <h2 id="theme-selection" className="text-2xl font-semibold text-white mb-6">
            Select Your Adventure
          </h2>
          <div className="space-y-4">
            {themes.map((theme) => (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleConfigChange('theme', theme.id)}
                className={`w-full p-6 rounded-xl text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  config.theme === theme.id
                    ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-2 border-blue-400'
                    : 'bg-white/10 backdrop-blur-sm hover:bg-white/15 border-2 border-transparent'
                }`}
                aria-pressed={config.theme === theme.id}
                aria-describedby={`theme-${theme.id}-desc`}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="p-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg">
                      <theme.icon className="w-8 h-8 text-blue-400" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-white">{theme.name}</h3>
                      <div className="flex gap-2 text-sm text-gray-400">
                        <span>{theme.duration}</span>
                        <span>•</span>
                        <span>{theme.difficulty}</span>
                      </div>
                    </div>
                    <p id={`theme-${theme.id}-desc`} className="text-gray-300 mb-4 leading-relaxed">
                      {theme.description}
                    </p>
                    <div className="mb-3">
                      <span className="text-sm font-medium text-blue-300">Atmosphere: </span>
                      <span className="text-sm text-gray-400">{theme.atmosphere}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {theme.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-700/50 text-gray-300 rounded text-xs"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Difficulty Selection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
          aria-labelledby="difficulty-selection"
        >
          <h2 id="difficulty-selection" className="text-2xl font-semibold text-white mb-4">
            Select Difficulty Level
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {difficulties.map((difficulty) => (
              <motion.button
                key={difficulty.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleConfigChange('difficulty', difficulty.id)}
                className={`p-6 rounded-xl text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  config.difficulty === difficulty.id
                    ? `bg-gradient-to-br ${difficulty.color} border-2 border-white/30`
                    : 'bg-white/10 backdrop-blur-sm hover:bg-white/15 border-2 border-transparent'
                }`}
                aria-pressed={config.difficulty === difficulty.id}
                aria-describedby={`difficulty-${difficulty.id}-desc`}
              >
                <h3 className="text-xl font-semibold text-white mb-2">{difficulty.name}</h3>
                <p id={`difficulty-${difficulty.id}-desc`} className="text-gray-200 text-sm">
                  {difficulty.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Configuration Summary */}
        {config.teamName && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
              <h3 className="text-xl font-semibold text-white mb-4">Adventure Summary</h3>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-300">{config.teamName}</div>
                  <div className="text-gray-400 text-sm">Team Name</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-300">
                    {themes.find(t => t.id === config.theme)?.name || 'Adventure'}
                  </div>
                  <div className="text-gray-400 text-sm">Selected Theme</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-300">
                    {difficulties.find(d => d.id === config.difficulty)?.name || 'Difficulty'}
                  </div>
                  <div className="text-gray-400 text-sm">Challenge Level</div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: config.teamName.trim() ? 1.05 : 1 }}
            whileTap={{ scale: config.teamName.trim() ? 0.95 : 1 }}
            onClick={handleStartGame}
            disabled={!config.teamName.trim()}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Start the escape room experience"
          >
            <Play className="w-6 h-6" aria-hidden="true" />
            {config.teamName.trim() 
              ? `Enter ${themes.find(t => t.id === config.theme)?.name}` 
              : 'Enter Team Name to Continue'
            }
          </motion.button>
          <p className="text-gray-400 mt-4 text-sm">
            {config.teamName.trim() 
              ? 'Your adventure will begin immediately with a brief introduction' 
              : 'Please enter a team name above to start your adventure'
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SetupInterface;