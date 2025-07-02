import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Lightbulb, CheckCircle, AlertCircle, Volume2, VolumeX, XCircle, Home, ArrowLeft, ArrowRight, Search, Skull, Wand2, Eye, Award, Trophy, Star } from 'lucide-react';
import { useGame } from '../providers/GameProvider';
import { useAccessibility } from '../providers/AccessibilityProvider';
import StageComponent from '../components/StageComponent';
import ProgressBar from '../components/ProgressBar';
import HintSystem from '../components/HintSystem';
import MusicController from '../components/MusicController';
import AnswerRevealModal from '../components/AnswerRevealModal';
import CertificateGenerator from '../components/CertificateGenerator';

const PlayerInterface = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    currentStage,
    totalStages,
    timeRemaining,
    hintsUsed,
    hintsAvailable,
    progress,
    isCompleted,
    advanceStage,
    updateProgress,
    endGame,
    theme,
    difficulty,
    teamName,
    sessionId: gameSessionId,
    completionTime,
    goToPreviousStage,
    goToNextStage,
    loadTeamBySessionId,
    isLoading,
    error
  } = useGame();
  const { announceToScreenReader } = useAccessibility();

  // Component state
  const [showHints, setShowHints] = useState(false);
  const [showEndGameModal, setShowEndGameModal] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [showAnswerReveal, setShowAnswerReveal] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [stagesSolved, setStagesSolved] = useState([]);
  const [answersRevealed, setAnswersRevealed] = useState([]);
  const [canAdvance, setCanAdvance] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // Load team data on mount
  useEffect(() => {
    if (sessionId) {
      loadTeamBySessionId(sessionId);
    }
  }, [sessionId, loadTeamBySessionId]);

  // Celebration effect
  useEffect(() => {
    if (isCompleted && !showCelebration) {
      setShowCelebration(true);
      announceToScreenReader(`CONGRATULATIONS ${teamName}! You have successfully completed ${getThemeInfo().title}! Your certificate is ready for download!`);
    }
  }, [isCompleted, showCelebration, announceToScreenReader, teamName]);

  // Stage access control
  useEffect(() => {
    if (currentStage === 1) {
      setCanAdvance(true);
      return;
    }
    const previousStageSolved = stagesSolved.includes(currentStage - 1);
    setCanAdvance(previousStageSolved);
  }, [currentStage, stagesSolved]);

  // Game completion check
  useEffect(() => {
    if (stagesSolved.length === totalStages && !isCompleted) {
      setTimeout(() => {
        announceToScreenReader(`VICTORY! Team ${teamName} has conquered all ${totalStages} stages!`);
      }, 500);
    }
  }, [stagesSolved.length, totalStages, isCompleted, teamName, announceToScreenReader]);

  // Helper functions
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getThemeInfo = () => {
    const themes = {
      'murder-mystery': {
        title: 'The Midnight Murder',
        icon: Search,
        color: 'from-red-500 to-orange-600',
        completionMessage: 'The mystery has been solved!',
        celebrationIcon: 'DETECTIVE'
      },
      'haunted-mansion': {
        title: 'Cursed Manor',
        icon: Skull,
        color: 'from-purple-500 to-pink-600',
        completionMessage: 'The spirits have found peace!',
        celebrationIcon: 'SPIRIT'
      },
      'wizards-tower': {
        title: 'The Enchanted Tower',
        icon: Wand2,
        color: 'from-blue-500 to-cyan-600',
        completionMessage: 'You have mastered the arcane arts!',
        celebrationIcon: 'WIZARD'
      }
    };
    return themes[theme] || themes['murder-mystery'];
  };

  const getNextAvailableStage = (currentStage, solvedStages, totalStages) => {
    if (solvedStages.includes(currentStage)) {
      return Math.min(currentStage + 1, totalStages);
    }
    const maxSolvedStage = Math.max(0, ...solvedStages.filter(s => s <= totalStages));
    return Math.min(maxSolvedStage + 1, totalStages);
  };

  const canGoToNext = () => {
    const nextStage = getNextAvailableStage(currentStage, stagesSolved, totalStages);
    return nextStage > currentStage && nextStage <= totalStages;
  };

  const isCurrentStageCompleted = () => {
    return stagesSolved.includes(currentStage);
  };

  // Event handlers
  const handlePuzzleSolved = () => {
    if (!stagesSolved.includes(currentStage)) {
      setStagesSolved(prev => [...prev, currentStage]);
      announceToScreenReader(`EXCELLENT! Team ${teamName} solved stage ${currentStage}!`);
    }
    updateProgress(currentStage, 100);

    if (currentStage === totalStages) {
      setTimeout(() => {
        announceToScreenReader(`INCREDIBLE! Team ${teamName} has completed the final stage and won the game!`);
      }, 1500);
    } else {
      setTimeout(() => {
        advanceStage();
        announceToScreenReader(`Moving to stage ${currentStage + 1}. Outstanding work, Team ${teamName}!`);
      }, 1500);
    }
  };

  const handleAnswerRevealed = () => {
    if (!answersRevealed.includes(currentStage)) {
      setAnswersRevealed(prev => [...prev, currentStage]);
    }
    if (!stagesSolved.includes(currentStage)) {
      setStagesSolved(prev => [...prev, currentStage]);
      announceToScreenReader(`Answer revealed for stage ${currentStage}. Moving to next stage.`);
    }
    updateProgress(currentStage, 100);
    setShowAnswerReveal(false);

    if (currentStage === totalStages) {
      setTimeout(() => {
        announceToScreenReader(`All stages completed! Final answer was revealed for Team ${teamName}.`);
      }, 1000);
    } else {
      setTimeout(() => {
        advanceStage();
        announceToScreenReader(`Moving to stage ${currentStage + 1}. Answer was revealed.`);
      }, 1000);
    }
  };

  const handleGoToPreviousStage = () => {
    if (currentStage > 1) {
      goToPreviousStage();
      announceToScreenReader(`Returning to stage ${currentStage - 1}`);
    }
  };

  const handleGoToNextStage = () => {
    const nextAvailable = getNextAvailableStage(currentStage, stagesSolved, totalStages);
    if (nextAvailable > currentStage && nextAvailable <= totalStages) {
      goToNextStage();
      announceToScreenReader(`Going to stage ${nextAvailable}`);
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    announceToScreenReader(`Sound ${audioEnabled ? 'turned off' : 'turned on'}`);
  };

  const handleEndGame = () => {
    endGame();
    announceToScreenReader('Investigation ended');
    setShowEndGameModal(false);
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleHomeClick = () => {
    setShowExitConfirmModal(true);
    announceToScreenReader('Exit confirmation dialog opened');
  };

  const handleConfirmExit = () => {
    endGame();
    announceToScreenReader('Returning to home page');
    navigate('/');
  };

  const handleCancelExit = () => {
    setShowExitConfirmModal(false);
    announceToScreenReader('Continuing with current investigation');
  };

  const themeInfo = getThemeInfo();

  // Certificate data
  const certificateData = {
    teamName: teamName || 'Escape Room Champions',
    theme: theme,
    difficulty: difficulty,
    stagesCompleted: stagesSolved.length,
    timeTaken: formatTime(3600 - timeRemaining),
    hintsUsed: hintsUsed,
    answersRevealed: answersRevealed.length,
    sessionId: gameSessionId,
    completionDate: completionTime || new Date().toISOString()
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your escape room...</p>
          {error && (
            <p className="text-red-400 text-sm mt-2">
              {error} - Running in demo mode
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error && !teamName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-red-400 text-6xl mb-4">WARNING</div>
          <h2 className="text-2xl font-bold text-white mb-4">Session Not Found</h2>
          <p className="text-gray-300 mb-6">
            The escape room session could not be loaded. This might happen if the session has expired or the URL is incorrect.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/setup')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start New Game
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Completion screen
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        {/* Animated background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-green-500/10"
          />
          {/* Floating celebration elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                {['STAR', 'TROPHY', 'MEDAL', 'CROWN', 'VICTORY'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          {/* Main Celebration */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="text-8xl mb-6"
            >
              TROPHY
            </motion.div>
            <motion.h1
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-6"
            >
              VICTORY!
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                CONGRATULATIONS!
              </h2>
              <p className="text-2xl text-yellow-300 mb-2">
                <span className="font-bold text-3xl">{teamName}</span>
              </p>
              <p className="text-xl text-gray-300 mb-4">
                has triumphantly completed
              </p>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
                {themeInfo.celebrationIcon} {themeInfo.title} {themeInfo.celebrationIcon}
              </h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-lg text-green-300 font-semibold"
              >
                {themeInfo.completionMessage}
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Achievement Stats and Certificate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-lg rounded-2xl p-8 mb-8 border-2 border-yellow-500/30"
          >
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Team {teamName} - VICTORY SUMMARY
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-8">
              <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4">
                <div className="text-4xl font-bold text-blue-400">{formatTime(3600 - timeRemaining)}</div>
                <div className="text-gray-400">Total Time</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4">
                <div className="text-4xl font-bold text-purple-400">{hintsUsed}</div>
                <div className="text-gray-400">Hints Used</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4">
                <div className="text-4xl font-bold text-green-400">{stagesSolved.length}/{totalStages}</div>
                <div className="text-gray-400">Stages Solved</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-4">
                <div className="text-4xl font-bold text-yellow-400">{answersRevealed.length}</div>
                <div className="text-gray-400">Answers Revealed</div>
              </motion.div>
            </div>

            {/* Certificate Download */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8 }}
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-8 border-2 border-green-500/40"
            >
              <h3 className="text-3xl font-bold text-green-300 mb-4 flex items-center justify-center gap-3">
                <Award className="w-8 h-8" />
                YOUR OFFICIAL CERTIFICATE IS READY!
              </h3>
              <p className="text-green-200 text-lg mb-6">
                Download your personalized certificate of completion to commemorate this amazing achievement!
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex justify-center">
                <CertificateGenerator
                  playerData={certificateData}
                  onDownload={() => {
                    announceToScreenReader(`SUCCESS! Certificate downloaded for Team ${teamName}! Congratulations on your victory!`);
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/setup')}
              className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Start New Adventure
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="px-10 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-bold text-lg rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-400 flex items-center justify-center gap-3"
            >
              <Home className="w-6 h-6" />
              Back to Home
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="min-h-screen p-4 md:p-6">
      <a href="#puzzle-content" className="skip-link">
        Skip to puzzle content
      </a>

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <themeInfo.icon className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {themeInfo.title}
                </h1>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team: <span className="text-blue-300 font-semibold">{teamName}</span>
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                Stage {currentStage} of {totalStages}
              </span>
              {!canAdvance && currentStage > 1 && (
                <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                  Previous Stage Required
                </span>
              )}
              {isCurrentStageCompleted() && (
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                  Completed
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" aria-hidden="true" />
                <span className={`font-mono text-lg ${timeRemaining < 600 ? 'text-red-400' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
                <span className="sr-only">Time left</span>
              </div>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" aria-hidden="true" />
                <span>{hintsAvailable} hints left</span>
              </div>
              <button
                onClick={toggleAudio}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label={`${audioEnabled ? 'Turn off' : 'Turn on'} sound`}
              >
                {audioEnabled ? (
                  <Volume2 className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <VolumeX className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
              <button
                onClick={handleHomeClick}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Exit to home page"
              >
                <Home className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <ProgressBar
            currentStage={currentStage}
            totalStages={totalStages}
            progress={progress}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Puzzle Area */}
          <div className="lg:col-span-3">
            <section
              id="puzzle-content"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
              aria-labelledby="current-puzzle"
            >
              <h2 id="current-puzzle" className="text-2xl font-bold text-white mb-6">
                Stage {currentStage}: {getStageTitle(currentStage, theme)}
              </h2>
              <StageComponent
                stage={currentStage}
                onSolved={handlePuzzleSolved}
                audioEnabled={audioEnabled}
                theme={theme}
                canAdvance={canAdvance}
                isStageComplete={isCurrentStageCompleted()}
                onGoToPreviousStage={handleGoToPreviousStage}
                onGoToNextStage={handleGoToNextStage}
                stagesSolved={stagesSolved}
                totalStages={totalStages}
              />
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Team Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" aria-hidden="true" />
                Team Progress
              </h3>
              <div className="space-y-3">
                <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="font-semibold text-blue-300">{teamName}</div>
                  <div className="text-xs text-gray-400">Team Name</div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Stages Solved</span>
                  <span className="text-white">{stagesSolved.length}/{totalStages}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Hints Used</span>
                  <span className="text-white">{hintsUsed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Answers Revealed</span>
                  <span className="text-white">{answersRevealed.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Time Elapsed</span>
                  <span className="text-white">{formatTime(3600 - timeRemaining)}</span>
                </div>
              </div>
            </div>

            {/* Hint System */}
            <HintSystem
              stage={currentStage}
              hintsAvailable={hintsAvailable}
              onHintUsed={() => announceToScreenReader('Hint revealed')}
              theme={theme}
            />

            {/* Game Controls */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" aria-hidden="true" />
                Investigation Tools
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowHints(true)}
                  className="w-full px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 flex items-center justify-center gap-2"
                  aria-label="Request help from game master"
                >
                  <Lightbulb className="w-4 h-4" />
                  Request Help
                </button>
                <button
                  onClick={() => setShowAnswerReveal(true)}
                  disabled={isCurrentStageCompleted()}
                  className="w-full px-4 py-2 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 flex items-center justify-center gap-2"
                  aria-label="Reveal the answer for current stage"
                >
                  <Eye className="w-4 h-4" />
                  {isCurrentStageCompleted() ? 'Stage Completed' : 'Reveal Answer'}
                </button>
                <div className="flex gap-2">
                  {currentStage > 1 && (
                    <button
                      onClick={handleGoToPreviousStage}
                      className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-1 text-sm"
                      aria-label={`Go back to stage ${currentStage - 1}`}
                    >
                      <ArrowLeft className="w-3 h-3" />
                      {currentStage - 1}
                    </button>
                  )}
                  {canGoToNext() && (
                    <button
                      onClick={handleGoToNextStage}
                      className="flex-1 px-3 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center gap-1 text-sm"
                      aria-label={`Go to stage ${getNextAvailableStage(currentStage, stagesSolved, totalStages)}`}
                    >
                      {getNextAvailableStage(currentStage, stagesSolved, totalStages)}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowEndGameModal(true)}
                  className="w-full px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center gap-2"
                  aria-label="End current investigation"
                >
                  <XCircle className="w-4 h-4" />
                  End Investigation
                </button>
                <button
                  onClick={handleHomeClick}
                  className="w-full px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center justify-center gap-2"
                  aria-label="Exit to home page"
                >
                  <Home className="w-4 h-4" />
                  Exit to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Components */}
      <MusicController isAdmin={false} />
      <AnswerRevealModal
        isOpen={showAnswerReveal}
        onClose={() => setShowAnswerReveal(false)}
        onRevealAnswer={handleAnswerRevealed}
        stage={currentStage}
        theme={theme}
      />

      {/* Modals */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHints(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="help-dialog-title"
              aria-modal="true"
            >
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-8 h-8 text-yellow-400" />
                <h3 id="help-dialog-title" className="text-xl font-bold text-white">
                  Team {teamName} - Help Request
                </h3>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-300 mb-2">Game Master Assistance</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Help request sent for Team {teamName}! A game master will assist you shortly.
                  </p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-300 mb-2">Available Options</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowHints(false)}
                      className="w-full px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
                    >
                      Use Available Hints ({hintsAvailable} left)
                    </button>
                    <button
                      onClick={() => {
                        setShowHints(false);
                        setShowAnswerReveal(true);
                      }}
                      className="w-full px-3 py-2 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-colors text-sm"
                    >
                      Reveal Answer (Affects Rating)
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowHints(false)}
                className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Continue Investigation
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExitConfirmModal && (
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
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-blue-500/30"
              role="dialog"
              aria-labelledby="exit-confirm-dialog-title"
              aria-modal="true"
            >
              <div className="flex items-center gap-3 mb-4">
                <Home className="w-8 h-8 text-blue-400" />
                <h3 id="exit-confirm-dialog-title" className="text-xl font-bold text-white">
                  Exit Team {teamName}?
                </h3>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to exit the investigation and return to the home page? Team {teamName}'s current progress will be lost.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCancelExit}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Investigation
                </button>
                <button
                  onClick={handleConfirmExit}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Exit to Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEndGameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEndGameModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-red-500/30"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="end-game-dialog-title"
              aria-modal="true"
            >
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
                <h3 id="end-game-dialog-title" className="text-xl font-bold text-white">
                  End Team {teamName} Investigation?
                </h3>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to end Team {teamName}'s current investigation? You'll be returned to the home page.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowEndGameModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Continue Investigation
                </button>
                <button
                  onClick={handleEndGame}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  End & Go Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const getStageTitle = (stage, theme) => {
  const stageTitles = {
    'murder-mystery': {
      1: 'The Crime Scene',
      2: "The Suspect's Alibi",
      3: 'The Murder Weapon',
      4: 'The Final Accusation',
      5: 'Justice Served',
      6: 'Case Closed'
    },
    'haunted-mansion': {
      1: 'The Restless Spirits',
      2: 'The Family Secret',
      3: 'The Cursed Artifact',
      4: 'The Séance',
      5: 'Breaking the Curse',
      6: 'Eternal Rest'
    },
    'wizards-tower': {
      1: "The Apprentice's Trial",
      2: 'The Potion Formula',
      3: 'The Ancient Spell',
      4: 'The Magical Duel',
      5: 'The Final Test',
      6: 'Master of Magic'
    }
  };

  return stageTitles[theme]?.[stage] || 'Unknown Challenge';
};

export default PlayerInterface;