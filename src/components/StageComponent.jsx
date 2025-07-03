import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Play, Pause, Volume2, Image, FileText, Search, Skull, Wand2, Eye, Camera, Book, Lock, ArrowLeft, ArrowRight, AlertTriangle, Microscope, MapPin, Clock as ClockIcon, Users as UsersIcon, Fingerprint, Flask, FileSearch, MessageCircle } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';
import { useContent } from '../providers/ContentProvider';

const StageComponent = ({ stage, onSolved, audioEnabled, theme, canAdvance, isStageComplete, onGoToPreviousStage, onGoToNextStage, stagesSolved, totalStages }) => {
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
    
    // Check evidence requirements
    const hasEvidence = puzzle?.evidence?.items && Array.isArray(puzzle.evidence.items);
    setAllEvidenceReviewed(!hasEvidence); // If no evidence, allow submission immediately

    // Block access if this is not stage 1 and previous stage not completed
    if (stage > 1 && !canAdvance) {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, [stage, theme, canAdvance, getContent]);

  // Check if all evidence has been reviewed
  useEffect(() => {
    if (currentPuzzle?.evidence?.items && Array.isArray(currentPuzzle.evidence.items)) {
      const totalEvidenceItems = currentPuzzle.evidence.items.length;
      const allReviewed = reviewedEvidence.size >= totalEvidenceItems;
      if (allReviewed !== allEvidenceReviewed) {
        setAllEvidenceReviewed(allReviewed);
        if (allReviewed) {
          announceToScreenReader('Excellent! You have thoroughly examined all evidence. You may now present your findings.');
        }
      }
    }
  }, [reviewedEvidence, currentPuzzle, allEvidenceReviewed, announceToScreenReader]);

  const handleEvidenceReviewed = (evidenceId) => {
    setReviewedEvidence(prev => {
      const newSet = new Set(prev);
      newSet.add(evidenceId);
      const totalItems = currentPuzzle?.evidence?.items?.length || 0;
      announceToScreenReader(`Evidence item reviewed. ${newSet.size} of ${totalItems} items examined.`);
      return newSet;
    });
  };

  const getTotalEvidenceItems = (evidence) => {
    if (!evidence?.items || !Array.isArray(evidence.items)) return 0;
    return evidence.items.length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isStageComplete) {
      announceToScreenReader('This stage is already completed!');
      return;
    }

    // Check if all evidence has been reviewed (only if evidence exists)
    const hasEvidence = currentPuzzle?.evidence?.items && Array.isArray(currentPuzzle.evidence.items);
    if (hasEvidence && !allEvidenceReviewed) {
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
    if (solvedStages.includes(currentStage)) {
      return Math.min(currentStage + 1, totalStages);
    }
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
      </motion.div>
    );
  }

  const hasEvidence = currentPuzzle?.evidence?.items && Array.isArray(currentPuzzle.evidence.items);

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

      {/* Evidence Review Progress - Only show if evidence exists */}
      {hasEvidence && (
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
                  className={`h-2 rounded-full transition-colors duration-300 ${
                    allEvidenceReviewed 
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

      {/* Evidence/Investigation Section - Only show if evidence exists */}
      {hasEvidence && (
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
          hasEvidence={hasEvidence}
        />

        {/* Evidence Review Reminder - Only show if evidence exists and not all reviewed */}
        {hasEvidence && !allEvidenceReviewed && (
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
        {showHint && currentPuzzle.hints && (
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

// Enhanced Evidence Component with detailed crime scenes
const EvidenceComponent = ({ evidence, audioEnabled, theme, onEvidenceReviewed, reviewedEvidence }) => {
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const handleEvidenceClick = (index) => {
    setSelectedEvidence(selectedEvidence === index ? null : index);
    if (!reviewedEvidence.has(index)) {
      onEvidenceReviewed(index);
    }
  };

  const getEvidenceIcon = (evidenceType) => {
    const iconMap = {
      'physical': <Fingerprint className="w-5 h-5 text-red-400" />,
      'chemical': <Flask className="w-5 h-5 text-blue-400" />,
      'document': <FileSearch className="w-5 h-5 text-yellow-400" />,
      'location': <MapPin className="w-5 h-5 text-green-400" />,
      'temporal': <ClockIcon className="w-5 h-5 text-purple-400" />,
      'witness': <UsersIcon className="w-5 h-5 text-orange-400" />,
      'testimony': <MessageCircle className="w-5 h-5 text-cyan-400" />,
      'forensic': <Microscope className="w-5 h-5 text-pink-400" />
    };
    return iconMap[evidenceType] || <Camera className="w-5 h-5 text-red-400" />;
  };

  if (!evidence?.items || !Array.isArray(evidence.items)) {
    return <div className="text-gray-400">No evidence available for this stage.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-700 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-red-400" />
          {evidence.title || 'Investigation Evidence'}
        </h5>
        
        {evidence.description && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-200 text-sm">{evidence.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidence.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`cursor-pointer p-4 rounded-lg transition-all duration-300 border-2 ${
                reviewedEvidence.has(index)
                  ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15'
                  : selectedEvidence === index
                  ? 'bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/25'
                  : 'bg-slate-600/30 border-transparent hover:bg-slate-600/50'
              }`}
              onClick={() => handleEvidenceClick(index)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  reviewedEvidence.has(index) ? 'bg-green-500/20' : 'bg-slate-500/20'
                }`}>
                  {reviewedEvidence.has(index) ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    getEvidenceIcon(item.type)
                  )}
                </div>
                <div className="flex-1">
                  <h6 className="font-semibold text-white">{item.name}</h6>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{item.type} Evidence</p>
                </div>
                {reviewedEvidence.has(index) && (
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                    Examined
                  </span>
                )}
              </div>
              
              <p className="text-gray-300 text-sm mb-2">{item.description}</p>
              
              {item.significance && (
                <div className="mb-2 p-2 bg-yellow-500/10 border-l-4 border-yellow-500/30">
                  <p className="text-yellow-200 text-xs">
                    <strong>Significance:</strong> {item.significance}
                  </p>
                </div>
              )}

              <AnimatePresence>
                {selectedEvidence === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-slate-600/50 rounded-lg"
                  >
                    <div className="space-y-3 text-sm">
                      {item.details && (
                        <div>
                          <h6 className="font-medium text-white mb-1">Detailed Analysis:</h6>
                          <p className="text-gray-300">{item.details}</p>
                        </div>
                      )}
                      
                      {item.findings && Array.isArray(item.findings) && (
                        <div>
                          <h6 className="font-medium text-blue-300 mb-1">Key Findings:</h6>
                          <ul className="text-gray-300 space-y-1">
                            {item.findings.map((finding, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {item.clue && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                          <h6 className="font-medium text-yellow-300 mb-1">Critical Clue:</h6>
                          <p className="text-yellow-200">{item.clue}</p>
                        </div>
                      )}

                      {item.questions && Array.isArray(item.questions) && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded p-3">
                          <h6 className="font-medium text-purple-300 mb-1">Questions to Consider:</h6>
                          <ul className="text-purple-200 space-y-1">
                            {item.questions.map((question, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-purple-400 mt-1">?</span>
                                <span>{question}</span>
                              </li>
                            ))}
                          </ul>
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
const PuzzleInterface = ({ puzzle, userInput, setUserInput, onSubmit, theme, disabled, allEvidenceReviewed, reviewedCount, totalEvidence, hasEvidence }) => {
  switch (puzzle.type) {
    case 'text-input':
      return (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="puzzle-input" className="block text-sm text-gray-400 mb-2">
              {puzzle.inputLabel || 'Your answer:'}
            </label>
            <input
              id="puzzle-input"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={puzzle.placeholder || 'Enter your answer...'}
              disabled={disabled || (hasEvidence && !allEvidenceReviewed)}
              className={`w-full p-3 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                hasEvidence && !allEvidenceReviewed
                  ? 'bg-gray-700/50 border-gray-600 focus:ring-gray-400 cursor-not-allowed'
                  : 'bg-white/10 border-white/20 focus:ring-blue-400'
              }`}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={disabled || (hasEvidence && !allEvidenceReviewed)}
            className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
              hasEvidence && !allEvidenceReviewed
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed focus:ring-gray-400'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-400'
            }`}
          >
            {hasEvidence && !allEvidenceReviewed ? 'Review All Evidence First' : getSubmitButtonText(theme)}
          </button>
        </form>
      );

    case 'multiple-choice':
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            {puzzle.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => setUserInput(option.value)}
                disabled={disabled || (hasEvidence && !allEvidenceReviewed)}
                className={`w-full p-4 text-left rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
                  hasEvidence && !allEvidenceReviewed
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
            disabled={!userInput || disabled || (hasEvidence && !allEvidenceReviewed)}
            className={`w-full px-6 py-3 font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
              hasEvidence && !allEvidenceReviewed
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed focus:ring-gray-400'
                : !userInput
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed focus:ring-gray-400'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-400'
            }`}
          >
            {hasEvidence && !allEvidenceReviewed 
              ? `Review All Evidence First (${reviewedCount}/${totalEvidence})`
              : getSubmitButtonText(theme)
            }
          </button>
        </div>
      );

    default:
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">Puzzle interface loading...</div>
          <div className="text-sm text-gray-500">Puzzle type: {puzzle.type || 'unknown'}</div>
        </div>
      );
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
  const puzzleLibrary = {
    'murder-mystery': {
      1: {
        title: "The Crime Scene",
        description: "Lord Blackwood has been found dead in his locked study. As the detective, examine all evidence carefully to determine the cause of death.",
        backstory: "Lord Blackwood was discovered this morning by his butler, slumped over his desk. The door was locked from the inside, and no weapon was found at the scene.",
        type: "multiple-choice",
        inputLabel: "What was the cause of death?",
        solution: "cyanide-poisoning",
        evidence: {
          type: "crime-scene",
          title: "Lord Blackwood's Study - Crime Scene Analysis",
          description: "A thorough investigation of the locked study where Lord Blackwood was found dead. Each piece of evidence must be carefully examined.",
          items: [
            {
              name: "Tea Cup on Desk",
              type: "chemical",
              description: "Half-empty porcelain teacup still sitting on the mahogany desk, positioned near the victim's right hand.",
              significance: "The victim's final consumption before death",
              details: "The ornate china teacup contains residual liquid with an unusual bitter almond scent. The liquid has a slight brownish discoloration at the bottom, suggesting chemical contamination.",
              findings: [
                "Bitter almond smell indicates possible cyanide presence",
                "Liquid temperature suggests recent consumption",
                "No fingerprints other than victim's on the handle",
                "Chemical residue visible in porcelain"
              ],
              clue: "Chemical analysis reveals cyanide residue - this was the murder weapon",
              questions: [
                "Who had access to serve tea to Lord Blackwood?",
                "When was this tea prepared and by whom?",
                "Why would the killer use this specific method?"
              ]
            },
            {
              name: "Locked Study Door",
              type: "physical",
              description: "Heavy oak door with brass lock mechanism, found locked from the inside with the key still in place.",
              significance: "Establishes the closed-room nature of the crime",
              details: "The door shows no signs of forced entry. The lock mechanism is intact and functional. The brass key was found turned in the inside lock, making entry impossible from the outside.",
              findings: [
                "No scratches or damage to lock mechanism",
                "Key positioned in locked position from inside",
                "Door frame intact with no signs of tampering",
                "Only one key exists for this particular lock"
              ],
              clue: "The killer was someone Lord Blackwood trusted enough to let into his private study",
              questions: [
                "How did the killer escape from a locked room?",
                "Who had access before the door was locked?",
                "Was the victim alone when the door was locked?"
              ]
            },
            {
              name: "Victim's Position",
              type: "forensic",
              description: "Lord Blackwood found slumped forward over his writing desk, pen still in hand, appearing to have died while writing.",
              significance: "Indicates the timing and manner of death",
              details: "The victim's body position suggests sudden incapacitation while engaged in writing. There are no signs of struggle, defensive wounds, or attempts to seek help. His final letter remains unfinished on the desk.",
              findings: [
                "No signs of physical struggle or violence",
                "Peaceful expression suggests quick, painless death",
                "Writing interrupted mid-sentence",
                "Body temperature indicates death 2-3 hours before discovery"
              ],
              clue: "Death was sudden and unexpected - victim had no time to react or call for help",
              questions: [
                "What was Lord Blackwood writing when he died?",
                "Why didn't he attempt to seek help?",
                "Was he expecting someone at the time of death?"
              ]
            },
            {
              name: "Unfinished Letter",
              type: "document",
              description: "Partially written letter on expensive stationery, ink still wet when body was discovered.",
              significance: "Provides timeline and possible motive clues",
              details: "The letter appears to be addressed to Lord Blackwood's solicitor regarding changes to his will. The writing stops abruptly mid-sentence, with the pen still gripped in his hand.",
              findings: [
                "Letter discusses will modifications",
                "Mentions concerns about family members",
                "Writing stops at 'I suspect that Margaret...'",
                "Handwriting shows no signs of distress until it stops"
              ],
              clue: "Lord Blackwood was about to reveal suspicions about someone named Margaret",
              questions: [
                "What was Lord Blackwood going to say about Margaret?",
                "Why was he changing his will?",
                "Who knew about these intended changes?"
              ]
            }
          ]
        },
        options: [
          {
            value: "knife-stabbing",
            label: "Stabbing with concealed weapon",
            description: "Death by sharp weapon like a knife or letter opener"
          },
          {
            value: "cyanide-poisoning",
            label: "Cyanide poisoning via tea",
            description: "Chemical poisoning through contaminated beverage"
          },
          {
            value: "heart-attack",
            label: "Natural heart attack",
            description: "Death from natural causes due to cardiac arrest"
          },
          {
            value: "gunshot-wound",
            label: "Gunshot from hidden weapon",
            description: "Death by firearm discharged in the room"
          }
        ],
        hints: [
          "Focus on what Lord Blackwood was doing when he died - examine the tea cup carefully.",
          "The bitter almond smell from the teacup is a classic indicator of a specific poison.",
          "No weapon was found at the scene, so consider non-physical methods of murder.",
          "The chemical residue in the teacup is the key evidence - cyanide has a distinctive bitter almond scent."
        ]
      },
      2: {
        title: "The Suspect's Alibi",
        description: "With cyanide poisoning confirmed, investigate who had opportunity to poison Lord Blackwood's tea. Examine the testimonies and timeline carefully.",
        backstory: "Three people had access to Lord Blackwood's study on the morning of his death: his butler James, his business partner Robert, and his niece Margaret.",
        type: "multiple-choice",
        inputLabel: "Who is the primary suspect?",
        solution: "margaret-reynolds",
        options: [
          {
            value: "james-butler",
            label: "James the Butler",
            description: "Loyal servant who served the poisoned tea"
          },
          {
            value: "robert-sterling",
            label: "Robert Sterling", 
            description: "Business partner present during time of death"
          },
          {
            value: "margaret-reynolds",
            label: "Margaret Reynolds",
            description: "Niece with financial motive and opportunity"
          },
          {
            value: "unknown-intruder",
            label: "Unknown intruder",
            description: "Outside person who somehow entered the study"
          }
        ],
        hints: [
          "Compare each person's timeline with the estimated time of death.",
          "Look for who had both motive and opportunity to poison the tea.",
          "Consider financial motives and family relationships.",
          "The person with the strongest motive was present during the critical time window."
        ]
      },
      3: {
        title: "The Murder Weapon Source",
        description: "Search for where the killer obtained the cyanide used in the murder.",
        backstory: "With Margaret identified as the prime suspect, investigate how she acquired the poison.",
        type: "multiple-choice",
        inputLabel: "Where did Margaret obtain the cyanide?",
        solution: "photography-darkroom",
        options: [
          {
            value: "pharmacy-purchase",
            label: "Pharmacy chemicals",
            description: "Obtained from medical or pharmaceutical sources"
          },
          {
            value: "photography-darkroom",
            label: "Photography darkroom chemicals",
            description: "Potassium cyanide from photo development supplies"
          },
          {
            value: "industrial-theft",
            label: "Stolen from factory",
            description: "Industrial chemicals taken from workplace"
          },
          {
            value: "online-purchase",
            label: "Internet purchase",
            description: "Ordered chemicals online illegally"
          }
        ],
        hints: [
          "Look at Margaret's hobbies and personal interests.",
          "Check what legitimate uses cyanide has in everyday activities.",
          "Photography development historically used potassium cyanide.",
          "The source would need to be easily accessible to Margaret."
        ]
      },
      4: {
        title: "The Confrontation",
        description: "Present your case to Margaret and get her to confess to the murder.",
        backstory: "With all evidence gathered, it's time to confront Margaret with the proof of her guilt.",
        type: "multiple-choice",
        inputLabel: "What evidence will be most convincing?",
        solution: "complete-timeline",
        options: [
          {
            value: "fingerprint-evidence",
            label: "Fingerprint evidence alone",
            description: "Focus on physical fingerprints on the poison bottle"
          },
          {
            value: "financial-motive",
            label: "Financial motive only",
            description: "Present her desperate financial situation"
          },
          {
            value: "complete-timeline",
            label: "Complete timeline with all evidence",
            description: "Present the full chronological case with all evidence"
          },
          {
            value: "witness-testimony",
            label: "Witness statements",
            description: "Rely on testimony from other people"
          }
        ],
        hints: [
          "Consider what would be most convincing to someone who committed the crime.",
          "A complete picture is harder to deny than individual pieces.",
          "The timeline shows how all elements fit together perfectly.",
          "Overwhelming evidence often leads to confession."
        ]
      },
      5: {
        title: "Justice Served",
        description: "With Margaret's confession obtained, determine the appropriate charges.",
        backstory: "Margaret has confessed to the murder. Now determine what charges she should face.",
        type: "multiple-choice",
        inputLabel: "What charges should Margaret face?",
        solution: "premeditated-murder",
        options: [
          {
            value: "manslaughter",
            label: "Voluntary manslaughter",
            description: "Killing in the heat of passion without premeditation"
          },
          {
            value: "second-degree-murder",
            label: "Second-degree murder",
            description: "Intentional killing without premeditation"
          },
          {
            value: "premeditated-murder",
            label: "Premeditated murder (First-degree)",
            description: "Planned and deliberate killing with malice aforethought"
          },
          {
            value: "negligent-homicide",
            label: "Negligent homicide",
            description: "Unintentional killing through negligence"
          }
        ],
        hints: [
          "Consider how much planning went into the crime.",
          "Margaret had been planning this for a significant time.",
          "The evidence shows deliberate preparation and execution.",
          "First-degree murder requires premeditation and intent."
        ]
      },
      6: {
        title: "Case Closed",
        description: "Complete the final case report and close the investigation.",
        backstory: "The murder has been solved. Determine the final outcome of the case.",
        type: "multiple-choice",
        inputLabel: "What is the final outcome?",
        solution: "trial-conviction",
        options: [
          {
            value: "case-dismissed",
            label: "Case dismissed",
            description: "Charges dropped due to insufficient evidence"
          },
          {
            value: "plea-bargain",
            label: "Plea bargain agreement",
            description: "Margaret pleads guilty to lesser charges"
          },
          {
            value: "trial-conviction",
            label: "Trial and conviction",
            description: "Margaret faces trial and is convicted of murder"
          },
          {
            value: "mistrial-declared",
            label: "Mistrial declared",
            description: "Trial ends without resolution"
          }
        ],
        hints: [
          "Margaret will face the legal system for her crimes.",
          "The evidence is strong enough for prosecution.",
          "A trial will determine her final guilt and sentence.",
          "Justice requires the case to proceed through the courts."
        ]
      }
    },
    'haunted-mansion': {
      1: {
        title: "The Restless Spirits",
        description: "Strange supernatural phenomena plague Grimwood Manor. Investigate the paranormal occurrences to understand what the spirits want.",
        backstory: "The Grimwood family has lived in this mansion for generations, but recently, ghostly apparitions and unexplained events have driven them out.",
        type: "multiple-choice",
        inputLabel: "What do the spirits seek?",
        solution: "vengeance-truth",
        options: [
          {
            value: "vengeance-truth",
            label: "Vengeance and truth about their death",
            description: "The spirits seek justice for a wrongful death"
          },
          {
            value: "treasure-location",
            label: "Location of hidden family treasure",
            description: "Ghosts want to reveal hidden wealth"
          },
          {
            value: "peaceful-rest",
            label: "Peaceful rest and religious blessing",
            description: "Spirits need proper burial rites"
          },
          {
            value: "family-reunion",
            label: "Reunion with living family members",
            description: "Ghosts want to reconnect with descendants"
          }
        ],
        hints: [
          "Pay attention to the spirit's messages and behavior.",
          "The supernatural activity seems focused on revealing something.",
          "Consider why a spirit would be unable to rest.",
          "The manifestations suggest unfinished business related to injustice."
        ]
      },
      2: {
        title: "The Family Secret",
        description: "You've learned the spirits seek vengeance, but for what crime? Uncover the dark family secret.",
        backstory: "The spirit belongs to Eleanor Grimwood, who died mysteriously 100 years ago. Her death was ruled a suicide, but she claims otherwise.",
        type: "text-input",
        inputLabel: "What happened to Eleanor?",
        solution: "murdered-by-brother",
        placeholder: "Enter what you discovered about Eleanor's fate...",
        hints: [
          "Eleanor's death was not what it appeared to be.",
          "Family members may not always be trustworthy.",
          "The circumstances of her death were suspicious.",
          "Someone close to Eleanor had motive to harm her."
        ]
      },
      3: {
        title: "The Cursed Mirror",
        description: "Find the cursed mirror that shows the truth of past events and reveals Eleanor's final moments.",
        backstory: "Eleanor's spirit grows stronger. She leads you to an antique mirror that supposedly shows the truth of what happened.",
        type: "text-input",
        inputLabel: "What does the mirror reveal?",
        solution: "charles-poisoned-eleanor",
        placeholder: "Describe what you see in the mirror...",
        hints: [
          "The mirror shows events from the past.",
          "Look for signs of foul play in Eleanor's final moments.",
          "Pay attention to who was present when Eleanor died.",
          "The truth about her death involves poison and betrayal."
        ]
      },
      4: {
        title: "The Séance",
        description: "Conduct a séance to communicate directly with Eleanor's spirit and get her full testimony.",
        backstory: "With the mirror's revelations, you attempt to contact Eleanor directly to get the complete story of her murder.",
        type: "text-input",
        inputLabel: "What message does Eleanor give you?",
        solution: "brother-wanted-inheritance",
        placeholder: "Record Eleanor's spiritual message...",
        hints: [
          "Eleanor can now communicate more clearly.",
          "Ask about her brother's motives.",
          "The inheritance was worth killing for.",
          "Charles stood to gain everything from Eleanor's death."
        ]
      },
      5: {
        title: "Breaking the Curse",
        description: "Find the hidden evidence that will expose Charles's crime and free Eleanor's spirit.",
        backstory: "Eleanor has revealed where Charles hid the evidence of his crime. Find it to break the curse.",
        type: "text-input",
        inputLabel: "What evidence do you find?",
        solution: "poison-bottle-and-confession",
        placeholder: "Describe the hidden evidence...",
        hints: [
          "Charles kept evidence of his crime hidden.",
          "Look for the murder weapon and documentation.",
          "The evidence includes both physical proof and written confession.",
          "Charles documented his crime in a hidden confession letter."
        ]
      },
      6: {
        title: "Eternal Rest",
        description: "With the truth revealed, help Eleanor's spirit find peace and end the haunting.",
        backstory: "The evidence has been found and the truth exposed. Eleanor can finally rest in peace.",
        type: "text-input",
        inputLabel: "How does Eleanor find peace?",
        solution: "truth-revealed-justice-served",
        placeholder: "Describe how the curse is broken...",
        hints: [
          "Eleanor needed the truth to be known.",
          "Justice has finally been served after 100 years.",
          "The family curse is broken when truth comes to light.",
          "Eleanor can rest knowing her murder has been exposed."
        ]
      }
    },
    'wizards-tower': {
      1: {
        title: "The Apprentice's Trial",
        description: "You are a new apprentice in Master Aldric's tower. Learn the basic principles of magic by studying the ancient artifacts.",
        backstory: "Master Aldric has left you alone in his tower with instructions to prove your magical aptitude by understanding the four elements.",
        type: "multiple-choice",
        inputLabel: "What is the fundamental principle of magic?",
        solution: "elemental-harmony",
        options: [
          {
            value: "elemental-dominance",
            label: "Dominance over the elements",
            description: "Magic comes from controlling and overpowering elemental forces"
          },
          {
            value: "elemental-harmony",
            label: "Harmony between opposing elements",
            description: "Magic flows from balancing and harmonizing elemental forces"
          },
          {
            value: "personal-willpower",
            label: "Pure personal willpower",
            description: "Magic is generated by strength of individual will and determination"
          },
          {
            value: "divine-blessing",
            label: "Divine blessing and favor",
            description: "Magic is granted by gods and supernatural beings"
          }
        ],
        hints: [
          "Study how the elemental crystals interact with each other.",
          "Master Aldric's notes emphasize balance over force.",
          "Observe what happens when elements work together versus separately.",
          "True magical power comes from harmony, not dominance."
        ]
      },
      2: {
        title: "The Potion Formula",
        description: "Now that you understand magical harmony, brew the Elixir of Truth by combining the right ingredients in the proper proportions.",
        backstory: "Master Aldric's notes mention a powerful truth potion, but the formula is encoded in alchemical symbols.",
        type: "text-input",
        inputLabel: "What is the correct potion sequence?",
        solution: "moon-star-sun-earth",
        placeholder: "Enter the ingredient sequence...",
        hints: [
          "The sequence follows celestial order.",
          "Start with the night and progress to day.",
          "The pattern represents the cycle of time and elements.",
          "Moon, Star, Sun, Earth represents the natural progression."
        ]
      },
      3: {
        title: "The Ancient Spell",
        description: "Decode an ancient spell scroll to unlock the next level of magical knowledge.",
        backstory: "A mysterious scroll has appeared with ancient runes that respond to your growing understanding.",
        type: "text-input",
        inputLabel: "What is the ancient incantation?",
        solution: "ignis-aqua-ventus-terra",
        placeholder: "Speak the ancient words...",
        hints: [
          "The spell uses the ancient language of magic.",
          "Each word represents one of the four elements.",
          "The order follows the classical elemental sequence.",
          "Fire, Water, Wind, Earth in the old tongue."
        ]
      },
      4: {
        title: "The Magical Duel",
        description: "Face Master Aldric's magical construct in a test of your growing power and knowledge.",
        backstory: "Master Aldric has returned and activated a magical guardian to test your progress.",
        type: "text-input",
        inputLabel: "How do you defeat the construct?",
        solution: "combine-all-elements",
        placeholder: "Describe your strategy...",
        hints: [
          "The construct is immune to single-element attacks.",
          "Use everything you've learned about elemental harmony.",
          "Combine all four elements in perfect balance.",
          "Unity of elements creates power beyond individual parts."
        ]
      },
      5: {
        title: "The Master's Test",
        description: "Master Aldric presents you with the final test to become a true wizard apprentice.",
        backstory: "Impressed by your progress, Master Aldric offers you the chance to prove yourself worthy of the tower's greatest secrets.",
        type: "text-input",
        inputLabel: "What is the highest magical principle?",
        solution: "wisdom-over-power",
        placeholder: "State the highest principle...",
        hints: [
          "Consider what makes a true master wizard.",
          "Raw power without guidance can be dangerous.",
          "The greatest magical principle involves restraint and understanding.",
          "Wisdom in using magic is more important than the power itself."
        ]
      },
      6: {
        title: "Master of Magic",
        description: "With all tests completed, receive Master Aldric's final blessing and become a true wizard.",
        backstory: "You have proven yourself worthy. Master Aldric is ready to grant you the title of wizard and the secrets of the tower.",
        type: "text-input",
        inputLabel: "What is the wizard's oath?",
        solution: "protect-harmony-serve-wisdom",
        placeholder: "Recite the sacred oath...",
        hints: [
          "The oath encompasses all you have learned.",
          "It includes protecting others and maintaining balance.",
          "Wisdom and harmony are central themes.",
          "A wizard's duty is to protect, maintain harmony, and serve wisdom."
        ]
      }
    }
  };

  const themeStages = puzzleLibrary[theme] || puzzleLibrary['murder-mystery'];
  return themeStages[stage] || {
    title: `Stage ${stage}`,
    description: "Challenge loading...",
    type: "text-input",
    inputLabel: "Your answer:",
    solution: "test-answer",
    placeholder: "Enter your answer...",
    hints: ["This is a test stage.", "Try entering 'test-answer'."]
  };
};

export default StageComponent;