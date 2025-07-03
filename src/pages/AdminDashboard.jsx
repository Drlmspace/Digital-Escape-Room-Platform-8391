import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Lightbulb, Settings, Send, Play, Pause, BarChart3, Eye, MessageSquare, ArrowLeft, Home, LogOut, X, Key, Edit, FileText, Download, Upload, RotateCcw, Globe, User, Activity, Target, Music } from 'lucide-react';
import { useAdmin } from '../providers/AdminProvider';
import { useContent } from '../providers/ContentProvider';
import { SITE_CONFIG } from '../config/siteConfig';
import AnswerKeyModal from '../components/AnswerKeyModal';
import ContentEditor from '../components/ContentEditor';
import SiteSettingsModal from '../components/SiteSettingsModal';
import MusicController from '../components/MusicController';
import MusicUploadManager from '../components/MusicUploadManager';
import ProtectedAdminRoute from '../components/ProtectedAdminRoute';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { sendHint, adjustDifficulty, extendTime, broadcastMessage, getTeamAnalytics } = useAdmin();
  const { getAllContent, updateContent, exportContent, importContent, resetContent, hasCustomContent } = useContent();

  // Single team state instead of multiple teams
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

  const [customHint, setCustomHint] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [showSiteSettings, setShowSiteSettings] = useState(false);
  const [showMusicManager, setShowMusicManager] = useState(false);
  const [answerKeyStage, setAnswerKeyStage] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState('murder-mystery');
  const [importFile, setImportFile] = useState(null);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    title: SITE_CONFIG.title,
    shortName: SITE_CONFIG.shortName,
    description: SITE_CONFIG.description,
    navTitle: SITE_CONFIG.navTitle,
    adminTitle: SITE_CONFIG.adminTitle
  });

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSiteSettings(parsed);
        Object.assign(SITE_CONFIG, parsed);
        document.title = parsed.title;
      } catch (error) {
        console.error('Failed to load saved settings:', error);
      }
    }
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'struggling': return 'text-yellow-400';
      case 'stuck': return 'text-red-400';
      case 'paused': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-300';
      case 'medium': return 'bg-blue-500/20 text-blue-300';
      case 'difficult': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getThemeColor = (theme) => {
    switch (theme) {
      case 'murder-mystery': return 'bg-red-500/20 text-red-300';
      case 'haunted-mansion': return 'bg-purple-500/20 text-purple-300';
      case 'wizards-tower': return 'bg-blue-500/20 text-blue-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  // Navigation handlers
  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleExitSession = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    // Clear admin session
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminUser');
    navigate('/');
  };

  const openAnswerKey = (stage) => {
    setAnswerKeyStage(stage);
    setShowAnswerKey(true);
  };

  const openContentEditor = (theme = 'murder-mystery') => {
    setSelectedTheme(theme);
    setShowContentEditor(true);
  };

  const handleContentUpdate = (content) => {
    updateContent(selectedTheme, content);
  };

  const handleExportContent = () => {
    exportContent(selectedTheme);
  };

  const handleImportContent = () => {
    if (importFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const success = importContent(selectedTheme, e.target.result);
        if (success) {
          alert('Content imported successfully!');
        } else {
          alert('Failed to import content. Please check the file format.');
        }
        setImportFile(null);
      };
      reader.readAsText(importFile);
    }
  };

  const handleResetContent = () => {
    if (confirm(`Reset all custom content for ${selectedTheme}? This cannot be undone.`)) {
      resetContent(selectedTheme);
    }
  };

  const handleSiteSettingsUpdate = (newSettings) => {
    setSiteSettings(newSettings);
    // Force re-render of components that use SITE_CONFIG
    window.dispatchEvent(new Event('siteSettingsUpdated'));
  };

  const handleSendHint = () => {
    if (customHint.trim()) {
      sendHint(currentTeam.id, customHint);
      setCustomHint('');
    }
  };

  const handleBroadcast = () => {
    if (broadcastMsg.trim()) {
      broadcastMessage(broadcastMsg);
      setBroadcastMsg('');
    }
  };

  const toggleGamePause = () => {
    setIsGamePaused(!isGamePaused);
    // In a real implementation, this would pause/resume the game timer
  };

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto">
          {/* Header with Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Navigation Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGoBack}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-bold text-white">{siteSettings.adminTitle}</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                  Live Session
                </span>

                {/* Music Manager Button */}
                <button
                  onClick={() => setShowMusicManager(true)}
                  className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center gap-2"
                  aria-label="Open music manager"
                >
                  <Music className="w-4 h-4" />
                  Music Manager
                </button>

                {/* Site Settings Button */}
                <button
                  onClick={() => setShowSiteSettings(true)}
                  className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center gap-2"
                  aria-label="Open site settings"
                >
                  <Globe className="w-4 h-4" />
                  Site Settings
                </button>

                {/* Navigation Controls */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={handleGoHome}
                    className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
                    aria-label="Go to home page"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </button>
                  <button
                    onClick={handleExitSession}
                    className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2"
                    aria-label="Exit admin session"
                  >
                    <LogOut className="w-4 h-4" />
                    Exit
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{currentTeam.players}</div>
                    <div className="text-gray-400 text-sm">Team Players</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{currentTeam.currentStage}/6</div>
                    <div className="text-gray-400 text-sm">Current Stage</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{formatTime(currentTeam.timeRemaining)}</div>
                    <div className="text-gray-400 text-sm">Time Remaining</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{currentTeam.hintsUsed}</div>
                    <div className="text-gray-400 text-sm">Hints Used</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Team Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              {/* Current Team Status */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Team Monitoring
                </h2>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl border-2 border-blue-500/40 bg-blue-500/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-semibold text-white">{currentTeam.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(currentTeam.difficulty)}`}>
                        {currentTeam.difficulty}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getThemeColor(currentTeam.theme)}`}>
                        {currentTeam.theme.replace('-', ' ')}
                      </span>
                      <span className={`text-lg font-medium ${getStatusColor(isGamePaused ? 'paused' : currentTeam.status)}`}>
                        {isGamePaused ? 'Paused' : currentTeam.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{currentTeam.players} players</span>
                      <span>Stage {currentTeam.currentStage}/6</span>
                      <span>{formatTime(currentTeam.timeRemaining)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{currentTeam.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${currentTeam.progress}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Hints Used</div>
                      <div className="text-xl font-semibold text-white">{currentTeam.hintsUsed}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openAnswerKey(currentTeam.currentStage)}
                      className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      Stage {currentTeam.currentStage} Answers
                    </button>
                    <button
                      onClick={() => openContentEditor(currentTeam.theme)}
                      className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Content
                    </button>
                    <button
                      onClick={() => extendTime(currentTeam.id, 10)}
                      className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      +10 Minutes
                    </button>
                    <button
                      onClick={toggleGamePause}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                        isGamePaused
                          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                      }`}
                    >
                      {isGamePaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      {isGamePaused ? 'Resume Game' : 'Pause Game'}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Team Progress Chart */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Stage Progress Overview</h3>
                <div className="space-y-4">
                  {Array.from({ length: 6 }, (_, i) => i + 1).map((stage) => (
                    <div key={stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">Stage {stage}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">
                            {stage <= currentTeam.currentStage
                              ? stage < currentTeam.currentStage
                                ? '100%'
                                : `${currentTeam.progress}%`
                              : '0%'}
                          </span>
                          <button
                            onClick={() => openAnswerKey(stage)}
                            className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs hover:bg-yellow-500/30 transition-colors"
                          >
                            Answers
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: stage <= currentTeam.currentStage
                              ? stage < currentTeam.currentStage
                                ? '100%'
                                : `${currentTeam.progress}%`
                              : '0%'
                          }}
                          transition={{ duration: 1, delay: stage * 0.1 }}
                          className={`h-2 rounded-full ${
                            stage < currentTeam.currentStage
                              ? 'bg-green-500'
                              : stage === currentTeam.currentStage
                              ? 'bg-blue-500'
                              : 'bg-gray-600'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Control Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Content Management */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content Management
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="theme-select" className="block text-sm text-gray-400 mb-2">
                      Select Theme
                    </label>
                    <select
                      id="theme-select"
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {Object.entries(SITE_CONFIG.themes).map(([key, theme]) => (
                        <option key={key} value={key} className="bg-slate-800">
                          {theme.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openContentEditor(selectedTheme)}
                      className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleExportContent}
                      disabled={!hasCustomContent(selectedTheme)}
                      className="px-3 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => setImportFile(e.target.files[0])}
                      className="hidden"
                      id="import-file"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => document.getElementById('import-file').click()}
                        className="px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Import
                      </button>
                      <button
                        onClick={handleResetContent}
                        disabled={!hasCustomContent(selectedTheme)}
                        className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </button>
                    </div>
                  </div>
                  {importFile && (
                    <button
                      onClick={handleImportContent}
                      className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                    >
                      Import "{importFile.name}"
                    </button>
                  )}
                  {hasCustomContent(selectedTheme) && (
                    <div className="text-xs text-green-300 bg-green-500/10 border border-green-500/20 rounded p-2">
                      Custom content active for {selectedTheme.replace('-', ' ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Answer Key Quick Access */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Answer Keys
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((stage) => (
                    <button
                      key={stage}
                      onClick={() => openAnswerKey(stage)}
                      className="px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      Stage {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hint Management */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Send Hint
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="custom-hint" className="block text-sm text-gray-400 mb-2">
                      Custom Hint for {currentTeam.name}
                    </label>
                    <textarea
                      id="custom-hint"
                      value={customHint}
                      onChange={(e) => setCustomHint(e.target.value)}
                      placeholder="Write a helpful hint for the current stage..."
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      rows="3"
                    />
                  </div>
                  <button
                    onClick={handleSendHint}
                    disabled={!customHint.trim()}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Hint to Team
                  </button>
                </div>
              </div>

              {/* Broadcast Message */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Team Message
                </h3>
                <div className="space-y-4">
                  <textarea
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Send a message to the team..."
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    rows="3"
                  />
                  <button
                    onClick={handleBroadcast}
                    disabled={!broadcastMsg.trim()}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send to Team
                  </button>
                </div>
              </div>

              {/* Game Controls */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Game Controls</h3>
                <div className="space-y-3">
                  <button
                    onClick={toggleGamePause}
                    className={`w-full px-4 py-2 rounded-lg transition-colors text-left flex items-center gap-2 ${
                      isGamePaused
                        ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                    }`}
                  >
                    {isGamePaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {isGamePaused ? 'Resume Game' : 'Pause Game'}
                  </button>
                  <button
                    onClick={() => extendTime(currentTeam.id, 10)}
                    className="w-full px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-left flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Add 10 Minutes
                  </button>
                  <button
                    onClick={() => adjustDifficulty(currentTeam.id, 'easier')}
                    className="w-full px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-left flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Adjust Difficulty
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Music Controller */}
        <MusicController isAdmin={true} />

        {/* Answer Key Modal */}
        <AnswerKeyModal
          isOpen={showAnswerKey}
          onClose={() => setShowAnswerKey(false)}
          stage={answerKeyStage}
        />

        {/* Content Editor Modal */}
        <ContentEditor
          isVisible={showContentEditor}
          onClose={() => setShowContentEditor(false)}
          currentTheme={selectedTheme}
          onContentUpdate={handleContentUpdate}
        />

        {/* Site Settings Modal */}
        <SiteSettingsModal
          isOpen={showSiteSettings}
          onClose={() => setShowSiteSettings(false)}
          onUpdateSettings={handleSiteSettingsUpdate}
        />

        {/* Music Upload Manager Modal */}
        <MusicUploadManager
          isVisible={showMusicManager}
          onClose={() => setShowMusicManager(false)}
        />

        {/* Exit Confirmation Modal */}
        {showExitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700"
              role="dialog"
              aria-labelledby="exit-modal-title"
              aria-modal="true"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 id="exit-modal-title" className="text-xl font-bold text-white">
                  Exit Admin Dashboard
                </h3>
                <button
                  onClick={() => setShowExitModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to leave? You will be logged out of the admin session.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Stay Here
                </button>
                <button
                  onClick={confirmExit}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Leave & Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminDashboard;