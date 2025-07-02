import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useGame } from '../providers/GameProvider';
import { useAccessibility } from '../providers/AccessibilityProvider';

const HintSystem = ({ stage, hintsAvailable, onHintUsed }) => {
  const { useHint } = useGame();
  const { announceToScreenReader } = useAccessibility();
  const [revealedHints, setRevealedHints] = useState([]);
  const [showHintModal, setShowHintModal] = useState(false);

  const stageHints = getHintsForStage(stage);

  const handleRevealHint = () => {
    if (hintsAvailable > 0 && revealedHints.length < stageHints.length) {
      const success = useHint();
      if (success) {
        const newHintIndex = revealedHints.length;
        setRevealedHints(prev => [...prev, newHintIndex]);
        announceToScreenReader(`Hint revealed: ${stageHints[newHintIndex]}`);
        onHintUsed();
      }
    }
  };

  const toggleHintVisibility = (index) => {
    const hintElement = document.getElementById(`hint-${index}`);
    const isHidden = hintElement.style.filter === 'blur(4px)';
    
    if (isHidden) {
      hintElement.style.filter = 'none';
      announceToScreenReader('Hint text revealed');
    } else {
      hintElement.style.filter = 'blur(4px)';
      announceToScreenReader('Hint text hidden');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" aria-hidden="true" />
          Hints
        </h3>
        <span className="text-sm text-gray-400">
          {hintsAvailable} remaining
        </span>
      </div>

      {/* Revealed Hints */}
      <div className="space-y-3 mb-4">
        <AnimatePresence>
          {revealedHints.map((hintIndex) => (
            <motion.div
              key={hintIndex}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded">
                      Hint #{hintIndex + 1}
                    </span>
                  </div>
                  <p
                    id={`hint-${hintIndex}`}
                    className="text-yellow-200 text-sm leading-relaxed"
                    style={{ filter: 'blur(4px)', transition: 'filter 0.3s ease' }}
                  >
                    {stageHints[hintIndex]}
                  </p>
                </div>
                <button
                  onClick={() => toggleHintVisibility(hintIndex)}
                  className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label="Toggle hint visibility"
                >
                  <Eye className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Request Hint Button */}
      <div className="space-y-3">
        <button
          onClick={handleRevealHint}
          disabled={hintsAvailable === 0 || revealedHints.length >= stageHints.length}
          className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-describedby="hint-button-help"
        >
          {revealedHints.length >= stageHints.length 
            ? 'All hints revealed' 
            : hintsAvailable === 0 
            ? 'No hints remaining' 
            : 'Request Hint'
          }
        </button>

        <p id="hint-button-help" className="text-xs text-gray-400 text-center">
          {hintsAvailable > 0 && revealedHints.length < stageHints.length
            ? 'Click the eye icon to reveal hint text after requesting'
            : hintsAvailable === 0
            ? 'Contact admin for additional assistance'
            : 'You have discovered all available hints for this stage'
          }
        </p>

        {/* Progressive Hint Info */}
        <button
          onClick={() => setShowHintModal(true)}
          className="w-full px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
          How hints work
        </button>
      </div>

      {/* Hint Info Modal */}
      <AnimatePresence>
        {showHintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHintModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="hint-modal-title"
              aria-modal="true"
            >
              <h4 id="hint-modal-title" className="text-xl font-bold text-white mb-4">
                Progressive Hint System
              </h4>
              
              <div className="space-y-4 text-gray-300">
                <div>
                  <h5 className="font-semibold text-yellow-400 mb-2">How it works:</h5>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Hints become more specific as you use them</li>
                    <li>First hints give general direction</li>
                    <li>Later hints provide more direct guidance</li>
                    <li>Hints are initially blurred for suspense</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold text-blue-400 mb-2">Accessibility:</h5>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Screen readers announce all hint content</li>
                    <li>Keyboard navigation fully supported</li>
                    <li>High contrast mode compatible</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowHintModal(false)}
                className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const getHintsForStage = (stage) => {
  const hints = {
    1: [
      "Look for patterns in the computer timeline images. Historical years are key.",
      "The dial-up sound contains a hidden sequence - check the visual display for clues.",
      "Combine the earliest computer network year, the hidden word 'ACCESS', and the current year in the format YEAR-WORD-YEAR."
    ],
    2: [
      "Watch the network diagnostic video carefully for node activation patterns.",
      "Pay attention to which nodes light up in sequence during the data flow.",
      "The pattern follows odd-numbered sequences: A1, C3, E5, G7."
    ],
    3: [
      "Study the flowchart for missing connections between algorithm steps.",
      "Think about the logical order of data processing: input → process → output.",
      "The sequence should be: INIT-SCAN-FILTER-SORT-OUTPUT."
    ],
    4: [
      "Listen carefully to the audio artifact - there may be hidden messages.",
      "Examine any visual patterns or waveforms that accompany the audio.",
      "The solution combines 'TEMPORAL', 'KEY', and the current year '2024'."
    ],
    5: [
      "This stage requires team coordination - share information with your teammates.",
      "Look for complementary clues that only make sense when combined.",
      "Synchronization means everyone needs to input their part simultaneously."
    ],
    6: [
      "This is the final challenge - it combines elements from all previous stages.",
      "Review your solutions from stages 1-5 for patterns or connections.",
      "The quantum lock requires a meta-solution using previous answers."
    ]
  };
  
  return hints[stage] || ["No hints available for this stage."];
};

export default HintSystem;