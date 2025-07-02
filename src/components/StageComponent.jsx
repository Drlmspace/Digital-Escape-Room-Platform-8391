import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Play, Pause, Volume2, Image, FileText, Search, Skull, Wand2, Eye, Camera, Book, Lock, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';
import { useContent } from '../providers/ContentProvider';

const StageComponent = ({ 
  stage, 
  onSolved, 
  audioEnabled, 
  theme, 
  canAdvance, 
  isStageComplete, 
  onGoToPreviousStage, 
  onGoToNextStage, 
  stagesSolved, 
  totalStages 
}) => {
  const { announceToScreenReader } = useAccessibility();
  const { getContent } = useContent();
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [reviewedEvidence, setReviewedEvidence] = useState(new Set());
  const [allEvidenceReviewed, setAllEvidenceReviewed] = useState(false);

  useEffect(() => {
    const puzzle = getPuzzleForStage(stage, theme);
    // Get custom content if available
    const customContent = getContent(theme, stage);
    if (customContent) {
      puzzle.title = customContent.title || puzzle.title;
      puzzle.description = customContent.description || puzzle.description;
      puzzle.backstory = customContent.backstory || puzzle.backstory;
    }
    
    setCurrentPuzzle(puzzle);
    setUserInput('');
    setAttempts(0);
    setShowHint(false);
    setReviewedEvidence(new Set());
    setAllEvidenceReviewed(false);

    // Block access if this is not stage 1 and previous stage not completed
    if (stage > 1 && !canAdvance) {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, [stage, theme, canAdvance, getContent]);

  // Check if all evidence has been reviewed
  useEffect(() => {
    if (currentPuzzle?.evidence) {
      const totalEvidenceItems = getTotalEvidenceItems(currentPuzzle.evidence);
      const allReviewed = reviewedEvidence.size >= totalEvidenceItems;
      if (allReviewed !== allEvidenceReviewed) {
        setAllEvidenceReviewed(allReviewed);
        if (allReviewed) {
          announceToScreenReader('Excellent! You have thoroughly examined all evidence. You may now present your findings.');
        }
      }
    } else {
      // If no evidence section, allow immediate submission
      setAllEvidenceReviewed(true);
    }
  }, [reviewedEvidence, currentPuzzle, allEvidenceReviewed, announceToScreenReader]);

  const handleEvidenceReviewed = (evidenceId) => {
    setReviewedEvidence(prev => {
      const newSet = new Set(prev);
      newSet.add(evidenceId);
      announceToScreenReader(`Evidence item reviewed. ${newSet.size} of ${getTotalEvidenceItems(currentPuzzle.evidence)} items examined.`);
      return newSet;
    });
  };

  const getTotalEvidenceItems = (evidence) => {
    if (!evidence) return 0;
    switch (evidence.type) {
      case 'crime-scene':
        return evidence.items ? evidence.items.length : 0;
      case 'supernatural-investigation':
        return evidence.phenomena ? evidence.phenomena.length : 0;
      case 'magical-artifacts':
        return evidence.artifacts ? evidence.artifacts.length : 0;
      case 'document':
        return 1; // Single document
      case 'audio':
        return 1; // Single audio file
      default:
        return 0;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isStageComplete) {
      announceToScreenReader('This stage is already completed!');
      return;
    }

    // Check if all evidence has been reviewed
    if (!allEvidenceReviewed) {
      announceToScreenReader('WARNING: You must examine all evidence before presenting your findings. Click on each piece of evidence to review it thoroughly.');
      return;
    }

    setAttempts(prev => prev + 1);

    if (checkSolution(userInput, currentPuzzle)) {
      announceToScreenReader('Excellent work! You solved it!');
      onSolved();
    } else {
      announceToScreenReader('Not quite right. Keep investigating!');
      if (attempts >= 2) {
        setShowHint(true);
      }
    }
  };

  const handleGoToPrevious = () => {
    if (onGoToPreviousStage) {
      announceToScreenReader(`Going back to stage ${stage - 1}`);
      onGoToPreviousStage();
    }
  };

  const handleGoToNext = () => {
    if (onGoToNextStage) {
      const nextStage = getNextAvailableStage(stage, stagesSolved, totalStages);
      announceToScreenReader(`Going to stage ${nextStage}`);
      onGoToNextStage();
    }
  };

  // Helper function to determine next available stage
  const getNextAvailableStage = (currentStage, solvedStages, totalStages) => {
    // If current stage is solved, next stage is available
    if (solvedStages.includes(currentStage)) {
      return Math.min(currentStage + 1, totalStages);
    }
    // If current stage is not solved, find the highest solved stage + 1
    const maxSolvedStage = Math.max(0, ...solvedStages.filter(s => s < totalStages));
    return Math.min(maxSolvedStage + 1, totalStages);
  };

  const canGoToNext = () => {
    const nextStage = getNextAvailableStage(stage, stagesSolved, totalStages);
    return nextStage > stage && nextStage <= totalStages;
  };

  if (!currentPuzzle) return null;

  // Show blocked stage message
  if (isBlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-4">Stage Locked</h3>
        <p className="text-gray-300 text-lg mb-6">
          You must complete the previous stage before accessing this one.
        </p>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-md mx-auto mb-6">
          <p className="text-yellow-300 text-sm mb-4">
            Complete Stage {stage - 1} to unlock this stage, or use hints and reveal answers for guidance.
          </p>
        </div>
        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoToPrevious}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-2"
            aria-label={`Go back to stage ${stage - 1}`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Stage {stage - 1}
          </motion.button>
        </div>
        <div className="mt-6 text-sm text-gray-400">
          <p>You can also use the sidebar tools to get hints or reveal answers for the previous stage.</p>
        </div>
      </motion.div>
    );
  }

  // Show completed stage
  if (isStageComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-4">Stage Completed!</h3>
        <p className="text-gray-300 text-lg mb-6">
          Excellent work! You've successfully solved this stage.
        </p>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 max-w-md mx-auto mb-6">
          <p className="text-green-300 text-sm">
            Solution: <code className="font-mono bg-slate-700 px-2 py-1 rounded">{currentPuzzle.solution}</code>
          </p>
        </div>
        {/* Navigation for completed stages */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
          {stage > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToPrevious}
              className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-2"
              aria-label={`Go back to stage ${stage - 1}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Stage {stage - 1}
            </motion.button>
          )}
          {canGoToNext() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToNext}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center gap-2"
              aria-label={`Go to stage ${getNextAvailableStage(stage, stagesSolved, totalStages)}`}
            >
              Stage {getNextAvailableStage(stage, stagesSolved, totalStages)}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
        {/* Progress indicator */}
        <div className="mt-6 text-sm text-gray-400">
          {canGoToNext() ? (
            <p>Continue to the next available stage or review previous stages.</p>
          ) : stage === totalStages ? (
            <p>Congratulations! You've completed all available stages!</p>
          ) : (
            <p>Complete the current progression to unlock more stages.</p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stage Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {stage > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToPrevious}
              className="px-4 py-2 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-600/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
              aria-label={`Go back to stage ${stage - 1}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Stage {stage - 1}
            </motion.button>
          )}
        </div>
        <div className="text-sm text-gray-400 text-center">
          Stage {stage} of {totalStages}
        </div>
        <div className="flex items-center gap-2">
          {canGoToNext() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToNext}
              className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center gap-2"
              aria-label={`Go to stage ${getNextAvailableStage(stage, stagesSolved, totalStages)}`}
            >
              Stage {getNextAvailableStage(stage, stagesSolved, totalStages)}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Evidence Review Progress */}
      {currentPuzzle.evidence && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" />
              Investigation Progress
            </h4>
            <div className="flex items-center gap-2">
              {allEvidenceReviewed ? (
                <div className="flex items-center gap-2 text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Complete</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-300">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-medium">In Progress</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Evidence Examined</span>
                <span>{reviewedEvidence.size} / {getTotalEvidenceItems(currentPuzzle.evidence)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(reviewedEvidence.size / getTotalEvidenceItems(currentPuzzle.evidence)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-2 rounded-full transition-colors duration-300 ${allEvidenceReviewed 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}
                />
              </div>
            </div>
          </div>
          {!allEvidenceReviewed && (
            <p className="text-yellow-200 text-sm mt-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Click on each piece of evidence to examine it thoroughly before presenting your findings.
            </p>
          )}
        </div>
      )}

      {/* Puzzle Description */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-3">{currentPuzzle.title}</h3>
        <p className="text-gray-300 leading-relaxed">{currentPuzzle.description}</p>
        {currentPuzzle.backstory && (
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-300 mb-2">Background:</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{currentPuzzle.backstory}</p>
          </div>
        )}
      </div>

      {/* Evidence/Investigation Section */}
      {currentPuzzle.evidence && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            {theme === 'murder-mystery' && <Search className="w-5 h-5" />}
            {theme === 'haunted-mansion' && <Skull className="w-5 h-5" />}
            {theme === 'wizards-tower' && <Wand2 className="w-5 h-5" />}
            {getEvidenceTitle(theme)}
          </h4>
          <EvidenceComponent 
            evidence={currentPuzzle.evidence}
            audioEnabled={audioEnabled}
            theme={theme}
            onEvidenceReviewed={handleEvidenceReviewed}
            reviewedEvidence={reviewedEvidence}
          />
        </div>
      )}

      {/* Interactive Puzzle */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h4 className="text-lg font-semibold text-white mb-4">Present Your Findings</h4>
        <PuzzleInterface
          puzzle={currentPuzzle}
          userInput={userInput}
          setUserInput={setUserInput}
          onSubmit={handleSubmit}
          theme={theme}
          disabled={isStageComplete}
          allEvidenceReviewed={allEvidenceReviewed}
          reviewedCount={reviewedEvidence.size}
          totalEvidence={getTotalEvidenceItems(currentPuzzle.evidence)}
        />

        {/* Evidence Review Reminder */}
        {!allEvidenceReviewed && currentPuzzle.evidence && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h5 className="font-semibold text-yellow-300">Investigation Required</h5>
            </div>
            <p className="text-yellow-200 text-sm">
              You must examine all {getTotalEvidenceItems(currentPuzzle.evidence)} pieces of evidence before presenting your findings. 
              Currently reviewed: {reviewedEvidence.size}/{getTotalEvidenceItems(currentPuzzle.evidence)}
            </p>
          </div>
        )}

        {/* Attempts Counter */}
        {attempts > 0 && (
          <div className="mt-4 text-sm text-gray-400">
            Investigation attempts: {attempts}
          </div>
        )}
      </div>

      {/* Progressive Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-blue-300 mb-3">Clue</h4>
            <p className="text-blue-200">
              {currentPuzzle.hints[Math.min(attempts - 3, currentPuzzle.hints.length - 1)]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Evidence Component (simplified for space - would contain full implementation)
const EvidenceComponent = ({ evidence, audioEnabled, theme, onEvidenceReviewed, reviewedEvidence }) => {
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const handleEvidenceClick = (index) => {
    setSelectedEvidence(selectedEvidence === index ? null : index);
    if (!reviewedEvidence.has(index)) {
      onEvidenceReviewed(index);
    }
  };

  // Simplified evidence display
  return (
    <div className="space-y-4">
      <div className="bg-slate-700 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-red-400" />
          Investigation Evidence
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidence.items?.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`cursor-pointer p-3 rounded-lg transition-all duration-300 border-2 ${
                reviewedEvidence.has(index)
                  ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15'
                  : selectedEvidence === index
                  ? 'bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/25'
                  : 'bg-slate-600/30 border-transparent hover:bg-slate-600/50'
              }`}
              onClick={() => handleEvidenceClick(index)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  reviewedEvidence.has(index) ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {reviewedEvidence.has(index) ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <span className="text-red-300 font-bold text-sm">{index + 1}</span>
                  )}
                </div>
                <h6 className="font-semibold text-white">{item.name}</h6>
                {reviewedEvidence.has(index) && (
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                    Examined
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-sm mb-2">{item.description}</p>
              <AnimatePresence>
                {selectedEvidence === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-slate-600/50 rounded-lg"
                  >
                    <div className="space-y-2 text-sm">
                      {item.details && (
                        <p className="text-gray-300">{item.details}</p>
                      )}
                      {item.clue && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                          <span className="font-medium text-yellow-300">Evidence Found: </span>
                          <span className="text-yellow-200">{item.clue}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))} 
        </div>
      </div>
    </div>
  );
};

// Puzzle Interface Component
const PuzzleInterface = ({ puzzle, userInput, setUserInput, onSubmit, theme, disabled, allEvidenceReviewed, reviewedCount, totalEvidence }) => {
  switch (puzzle.type) {
    case 'text-input':
      return (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="puzzle-input" className="block text-sm text-gray-400 mb-2">
              {puzzle.inputLabel}
            </label>
            <input
              id="puzzle-input"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={puzzle.placeholder}
              disabled={disabled || !allEvidenceReviewed}
              className={`w-full p-3 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                !allEvidenceReviewed 
                  ? 'bg-gray-700/50 border-gray-600 focus:ring-gray-400 cursor-not-allowed' 
                  : 'bg-white/10 border-white/20 focus:ring-blue-400'
              }`}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={disabled || !allEvidenceReviewed}
            className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
              !allEvidenceReviewed 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed focus:ring-gray-400' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-400'
            }`}
          >
            {!allEvidenceReviewed ? 'Review All Evidence First' : getSubmitButtonText(theme)}
          </button>
        </form>
      );

    case 'multiple-choice':
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            {puzzle.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setUserInput(option.value)}
                disabled={disabled || !allEvidenceReviewed}
                className={`w-full p-4 text-left rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
                  !allEvidenceReviewed 
                    ? 'bg-gray-700/50 border border-gray-600 text-gray-400 cursor-not-allowed focus:ring-gray-400'
                    : userInput === option.value 
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300 focus:ring-blue-400' 
                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/15 focus:ring-blue-400'
                }`}
              >
                <div className="font-semibold mb-1">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-gray-400">{option.description}</div>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={onSubmit}
            disabled={!userInput || disabled || !allEvidenceReviewed}
            className={`w-full px-6 py-3 font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
              !allEvidenceReviewed 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed focus:ring-gray-400'
                : !userInput 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed focus:ring-gray-400' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-400'
            }`}
          >
            {!allEvidenceReviewed ? `Review All Evidence First (${reviewedCount}/${totalEvidence})` : getSubmitButtonText(theme)}
          </button>
        </div>
      );

    default:
      return <div className="text-gray-400">Puzzle type not ready</div>;
  }
};

const getEvidenceTitle = (theme) => {
  switch (theme) {
    case 'murder-mystery': return 'Crime Scene Evidence';
    case 'haunted-mansion': return 'Paranormal Investigation';
    case 'wizards-tower': return 'Magical Discoveries';
    default: return 'Evidence';
  }
};

const getSubmitButtonText = (theme) => {
  switch (theme) {
    case 'murder-mystery': return 'Present Evidence';
    case 'haunted-mansion': return 'Perform Ritual';
    case 'wizards-tower': return 'Cast Spell';
    default: return 'Submit Answer';
  }
};

const checkSolution = (userInput, puzzle) => {
  if (!puzzle || !userInput) return false;
  const normalizedInput = userInput.toString().toLowerCase().trim();
  const normalizedSolution = puzzle.solution.toLowerCase().trim();
  return normalizedInput === normalizedSolution;
};

const getPuzzleForStage = (stage, theme) => {
  // Simplified puzzle data - full implementation would be much larger
  const puzzleLibrary = {
    'murder-mystery': {
      1: {
        title: "The Crime Scene",
        description: "A wealthy businessman has been found dead in his locked study. Examine the evidence to determine what happened.",
        backstory: "Lord Blackwood was discovered this morning by his butler, slumped over his desk. The door was locked from the inside, and no weapon was found.",
        type: "multiple-choice",
        inputLabel: "What was the cause of death?",
        solution: "cyanide-poisoning",
        evidence: {
          type: "crime-scene",
          items: [
            {
              name: "Tea Cup",
              description: "Half-empty teacup on the desk, still warm",
              details: "The tea has an unusual bitter smell and slight discoloration at the bottom.",
              clue: "Chemical residue detected - appears to be cyanide"
            },
            {
              name: "Locked Door", 
              description: "Study door was locked from the inside",
              details: "The key was still in the lock on the inside. No other way in or out.",
              clue: "The killer was someone Lord Blackwood trusted enough to share tea with"
            }
          ]
        },
        options: [
          { value: "knife-stabbing", label: "Stabbing", description: "Killed with a sharp weapon" },
          { value: "cyanide-poisoning", label: "Cyanide Poisoning", description: "Killed with poison in the tea" },
          { value: "heart-attack", label: "Heart Attack", description: "Natural causes from stress" },
          { value: "gunshot-wound", label: "Shooting", description: "Shot with a gun" }
        ],
        hints: [
          "Look carefully at what Lord Blackwood was doing when he died.",
          "The bitter smell from the teacup is suspicious.",
          "No weapon was found, so think about other methods.",
          "The chemical residue in the teacup is the key evidence."
        ]
      }
      // Additional stages would be defined here...
    }
    // Other themes would be defined here...
  };

  const themeStages = puzzleLibrary[theme] || puzzleLibrary['murder-mystery'];
  return themeStages[stage] || themeStages[1];
};

export default StageComponent;