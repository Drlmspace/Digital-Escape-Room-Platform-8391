import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';

const AnswerRevealModal = ({ isOpen, onClose, onRevealAnswer, stage, theme }) => {
  const { announceToScreenReader } = useAccessibility();
  const [showWarning, setShowWarning] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const handleRevealAnswer = () => {
    if (!confirmed) {
      setConfirmed(true);
      announceToScreenReader('Answer revealed. This will affect your achievement rating.');
      onRevealAnswer();
    }
  };

  const handleClose = () => {
    setShowWarning(true);
    setConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="reveal-modal-title"
          aria-modal="true"
        >
          {showWarning && !confirmed ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
                <h3 id="reveal-modal-title" className="text-xl font-bold text-white">
                  Reveal Answer?
                </h3>
              </div>
              <div className="space-y-4 mb-6">
                <p className="text-gray-300">
                  Are you sure you want to see the answer for Stage {stage}? This action cannot be undone.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-300 mb-2">⚠️ Impact on Achievement:</h4>
                  <ul className="text-yellow-200 text-sm space-y-1">
                    <li>• Your performance rating will be affected</li>
                    <li>• Certificate will show "Answer Revealed" status</li>
                    <li>• Consider using hints first for better learning</li>
                  </ul>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-300 mb-2">💡 Alternative Options:</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Use available hints for guidance</li>
                    <li>• Request help from game master</li>
                    <li>• Take a break and return with fresh perspective</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Keep Trying
                </button>
                <button
                  onClick={() => setShowWarning(false)}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  Reveal Answer
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-8 h-8 text-green-400" />
                <h3 id="reveal-modal-title" className="text-xl font-bold text-white">
                  Stage {stage} Answer
                </h3>
              </div>
              <div className="space-y-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-300 mb-2">✅ Correct Answer:</h4>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <code className="text-green-300 font-mono text-lg">
                      {getAnswerForStage(stage, theme)}
                    </code>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-300 mb-2">📝 Explanation:</h4>
                  <p className="text-blue-200 text-sm">
                    {getExplanationForStage(stage, theme)}
                  </p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                  <CheckCircle className="w-6 h-6 text-yellow-300 mx-auto mb-2" />
                  <p className="text-yellow-200 text-sm">
                    Answer revealed! You can now proceed to the next stage.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRevealAnswer}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Continue to Next Stage
              </button>
            </>
          )}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const getAnswerForStage = (stage, theme) => {
  const answers = {
    'murder-mystery': {
      1: 'cyanide-poisoning',
      2: 'margaret-reynolds',
      3: 'photography-darkroom',
      4: 'complete-timeline',
      5: 'premeditated-murder',
      6: 'trial-conviction'
    },
    'haunted-mansion': {
      1: 'vengeance-truth',
      2: 'brother-poison',
      3: 'charles-arsenic-tea',
      4: 'where-evidence-hidden',
      5: 'arsenic-bottle-confession',
      6: 'truth-revealed-justice'
    },
    'wizards-tower': {
      1: 'elemental-harmony',
      2: 'moon-star-sun-earth',
      3: 'ignis-aqua-ventus-terra',
      4: 'combine-all-elements',
      5: 'wisdom-over-power',
      6: 'protect-harmony-serve-wisdom'
    }
  };

  return answers[theme]?.[stage] || 'mystery-answer';
};

const getExplanationForStage = (stage, theme) => {
  const explanations = {
    'murder-mystery': {
      1: 'Lord Blackwood died from cyanide poisoning. The tea cup contained cyanide, evidenced by the bitter smell and chemical residue found during analysis.',
      2: 'Margaret Reynolds had the motive (inheritance), opportunity (access during time of death), and means (poison). Her initials match the threatening letter.',
      3: 'Margaret obtained cyanide from photography supplies. Potassium cyanide is legitimately used in photo development for silver recovery.',
      4: 'Presenting the complete timeline with all evidence chronologically is most convincing and harder to deny than partial evidence.',
      5: 'Margaret planned the murder for a week, purchasing poison in advance. This level of planning constitutes premeditated murder.',
      6: 'With confession and evidence, Margaret will face trial for premeditated murder, leading to conviction and sentencing.'
    },
    'haunted-mansion': {
      1: 'The spirits seek vengeance and truth. Eleanor was murdered and wants her death exposed and justice served.',
      2: 'Eleanor was poisoned by her brother Charles with arsenic. He killed her to inherit her fortune before she could marry.',
      3: 'The cursed mirror reveals Charles adding arsenic to Eleanor\'s evening tea while she trusted him.',
      4: 'Asking where evidence is hidden helps Eleanor guide you to proof of her murder that Charles kept.',
      5: 'The arsenic bottle and Charles\'s confession letter provide concrete proof that breaks the curse.',
      6: 'Eleanor finds peace when the truth about her murder is revealed and justice is finally served.'
    },
    'wizards-tower': {
      1: 'Magic comes from elemental harmony between opposing forces, not raw power from any single element.',
      2: 'The potion sequence follows the celestial cycle: Moon (night), Star (eternal), Sun (dawn), Earth (foundation).',
      3: 'The ancient spell requires the four elements spoken in Latin: Ignis-Aqua-Ventus-Terra (Fire-Water-Wind-Earth).',
      4: 'The magical construct is immune to single elements but cannot handle all four elements combined in harmony.',
      5: 'The highest magical principle is wisdom over power - knowing when and how to use magical abilities responsibly.',
      6: 'The wizard\'s oath contains four principles: Protect the innocent, maintain Harmony, Serve wisdom, use Wisdom in decisions.'
    }
  };

  return explanations[theme]?.[stage] || 'The answer reveals the next step in your journey.';
};

export default AnswerRevealModal;