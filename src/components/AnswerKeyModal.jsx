import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Eye, EyeOff, Copy, Check, Volume2, VolumeX } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';

const AnswerKeyModal = ({ isOpen, onClose, stage }) => {
  const { announceToScreenReader } = useAccessibility();
  const [copiedAnswer, setCopiedAnswer] = useState(null);
  const [showSolutions, setShowSolutions] = useState({});

  const answerKey = getAnswerKeyForStage(stage);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAnswer(type);
      announceToScreenReader(`${type} copied to clipboard`);
      setTimeout(() => setCopiedAnswer(null), 2000);
    });
  };

  const toggleSolution = (solutionId) => {
    setShowSolutions(prev => ({
      ...prev,
      [solutionId]: !prev[solutionId]
    }));
  };

  if (!isOpen || !answerKey) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-slate-700"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="answer-key-title"
          aria-modal="true"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Key className="w-8 h-8 text-yellow-400" />
              <h2 id="answer-key-title" className="text-2xl font-bold text-white">
                Stage {stage} Answer Key
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close answer key"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Main Solution */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-green-300 mb-4">Main Answer</h3>
              <div className="flex items-center gap-4 mb-4">
                <code className="flex-1 px-4 py-3 bg-slate-700 rounded-lg text-green-300 font-mono text-lg">
                  {answerKey.mainAnswer}
                </code>
                <button
                  onClick={() => copyToClipboard(answerKey.mainAnswer, 'Main Answer')}
                  className="px-3 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
                  aria-label="Copy main answer"
                >
                  {copiedAnswer === 'Main Answer' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {answerKey.explanation}
              </p>
            </div>

            {/* Alternative Answers */}
            {answerKey.alternatives && answerKey.alternatives.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-blue-300 mb-4">Other Correct Answers</h3>
                <div className="space-y-3">
                  {answerKey.alternatives.map((alt, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <code className="flex-1 px-3 py-2 bg-slate-700 rounded-lg text-blue-300 font-mono">
                        {alt.answer}
                      </code>
                      <button
                        onClick={() => copyToClipboard(alt.answer, `Alternative ${index + 1}`)}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors"
                        aria-label={`Copy alternative answer ${index + 1}`}
                      >
                        {copiedAnswer === `Alternative ${index + 1}` ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step-by-Step Solution */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-purple-300">How to Solve</h3>
                <button
                  onClick={() => toggleSolution('steps')}
                  className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2"
                >
                  {showSolutions.steps ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide Steps
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show Steps
                    </>
                  )}
                </button>
              </div>
              <AnimatePresence>
                {showSolutions.steps && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {answerKey.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-200 mb-1">{step.title}</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Common Mistakes */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-red-300">Common Wrong Answers</h3>
                <button
                  onClick={() => toggleSolution('mistakes')}
                  className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  {showSolutions.mistakes ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show
                    </>
                  )}
                </button>
              </div>
              <AnimatePresence>
                {showSolutions.mistakes && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {answerKey.commonMistakes.map((mistake, index) => (
                      <div key={index} className="bg-red-500/5 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="px-2 py-1 bg-red-500/20 text-red-300 rounded font-mono text-sm">
                            {mistake.wrongAnswer}
                          </code>
                          <span className="text-red-400 text-sm">❌ Wrong</span>
                        </div>
                        <p className="text-gray-300 text-sm">{mistake.reason}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hints to Give */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-yellow-300 mb-4">Hints to Give Players</h3>
              <div className="space-y-3">
                {answerKey.adminHints.map((hint, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg text-xs font-medium">
                      Level {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm leading-relaxed">{hint}</p>
                      <button
                        onClick={() => copyToClipboard(hint, `Hint ${index + 1}`)}
                        className="mt-2 px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs hover:bg-yellow-500/30 transition-colors flex items-center gap-1"
                      >
                        {copiedAnswer === `Hint ${index + 1}` ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        Copy Hint
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const getAnswerKeyForStage = (stage) => {
  const answerKeys = {
    1: {
      mainAnswer: "cyanide-poisoning",
      explanation: "Lord Blackwood died from cyanide poisoning. The tea cup contained cyanide, evidenced by the bitter smell and chemical residue.",
      alternatives: [
        { answer: "poison", note: "General term accepted" }
      ],
      steps: [
        { title: "Examine the crime scene", description: "Look at all evidence items carefully, especially the tea cup." },
        { title: "Notice the tea cup clues", description: "The bitter smell and discoloration indicate poison." },
        { title: "Check for chemical residue", description: "The analysis reveals cyanide in the tea." },
        { title: "Determine cause of death", description: "Cyanide poisoning through the tea." }
      ],
      commonMistakes: [
        { wrongAnswer: "knife-stabbing", reason: "No weapon was found at the scene." },
        { wrongAnswer: "gunshot-wound", reason: "No gun or bullet wounds were discovered." },
        { wrongAnswer: "heart-attack", reason: "The chemical residue proves poisoning, not natural causes." }
      ],
      adminHints: [
        "Look carefully at what Lord Blackwood was drinking when he died.",
        "The tea cup has unusual characteristics - smell and appearance.",
        "No physical weapons were found, so consider other methods.",
        "The chemical analysis of the tea reveals the murder method."
      ]
    },
    2: {
      mainAnswer: "margaret-reynolds",
      explanation: "Margaret Reynolds is the killer. She had motive (inheritance), opportunity (present during time of death), and means (access to poison).",
      alternatives: [
        { answer: "margaret", note: "First name accepted" }
      ],
      steps: [
        { title: "Check the timeline", description: "Compare when each person was present with the time of death." },
        { title: "Look for motive", description: "Who would benefit from Lord Blackwood's death?" },
        { title: "Match the threatening letter", description: "The letter signed 'M.R.' matches Margaret Reynolds' initials." },
        { title: "Confirm opportunity", description: "Margaret was present during the crucial time window (10:15-10:45 AM)." }
      ],
      commonMistakes: [
        { wrongAnswer: "james", reason: "The butler left before the murder occurred and had no motive." },
        { wrongAnswer: "robert", reason: "The business partner was waiting in another room and had no access." },
        { wrongAnswer: "butler", reason: "James had already left the study before the poisoning occurred." }
      ],
      adminHints: [
        "Compare each person's timeline with the estimated time of death.",
        "Look at who had the opportunity to poison the tea after it was served.",
        "Check the initials on the threatening letter found at the scene.",
        "Margaret Reynolds was present during the crucial time and matches the letter signature."
      ]
    },
    3: {
      mainAnswer: "photography-darkroom",
      explanation: "Margaret obtained cyanide from photography supplies. Potassium cyanide is used in photo development for silver recovery.",
      alternatives: [
        { answer: "photography-supplies", note: "Alternative phrasing accepted" },
        { answer: "camera-chemicals", note: "Related term accepted" }
      ],
      steps: [
        { title: "Examine Margaret's belongings", description: "Search through her personal items for clues." },
        { title: "Find the photography equipment", description: "Discover her darkroom setup and chemical supplies." },
        { title: "Check the purchase receipt", description: "Find evidence of recent chemical purchases." },
        { title: "Connect cyanide to photography", description: "Potassium cyanide is legitimately used in photo development." }
      ],
      commonMistakes: [
        { wrongAnswer: "pharmacy", reason: "No evidence of pharmaceutical purchases was found." },
        { wrongAnswer: "garden-supplies", reason: "While cyanide can be in pesticides, the evidence points to photography." },
        { wrongAnswer: "laboratory", reason: "Margaret had no access to chemistry labs." }
      ],
      adminHints: [
        "Look at Margaret's hobbies and personal interests.",
        "Check what legitimate uses cyanide has in everyday activities.",
        "Examine the purchase receipt found in her belongings.",
        "Photography development historically used potassium cyanide for silver recovery."
      ]
    },
    4: {
      mainAnswer: "complete-timeline",
      explanation: "The complete case timeline with all evidence presented chronologically is most convincing and harder to deny than partial evidence.",
      alternatives: [],
      steps: [
        { title: "Gather all evidence", description: "Compile fingerprints, motive, timeline, and confession." },
        { title: "Present chronologically", description: "Show how events unfolded from planning to execution." },
        { title: "Connect all elements", description: "Demonstrate how motive, means, and opportunity align." },
        { title: "Leave no doubt", description: "A complete picture is harder to deny than individual pieces." }
      ],
      commonMistakes: [
        { wrongAnswer: "fingerprints-only", reason: "Physical evidence alone may not be enough for confession." },
        { wrongAnswer: "motive-alone", reason: "Motive without proof of execution is insufficient." },
        { wrongAnswer: "witness-testimony", reason: "Witnesses can be questioned; hard evidence is more convincing." }
      ],
      adminHints: [
        "Consider what would be most convincing to someone who committed the crime.",
        "A complete picture is harder to deny than individual pieces of evidence.",
        "The timeline shows how all elements fit together perfectly.",
        "When confronted with overwhelming evidence, most guilty parties confess."
      ]
    },
    5: {
      mainAnswer: "premeditated-murder",
      explanation: "Margaret planned the murder for a week in advance, purchasing poison and carefully timing the crime. This constitutes premeditated murder.",
      alternatives: [
        { answer: "first-degree-murder", note: "Legal equivalent accepted" }
      ],
      steps: [
        { title: "Review the confession", description: "Margaret admits to planning the crime for a week." },
        { title: "Check the evidence timeline", description: "Poison purchased a week before the murder." },
        { title: "Assess the planning level", description: "She studied his routine and chose the perfect timing." },
        { title: "Determine the charge", description: "Planned murder is premeditated murder in the first degree." }
      ],
      commonMistakes: [
        { wrongAnswer: "manslaughter", reason: "This was planned, not a crime of passion or accident." },
        { wrongAnswer: "second-degree-murder", reason: "The week of planning makes this first-degree/premeditated." },
        { wrongAnswer: "voluntary-manslaughter", reason: "There was clear premeditation, not emotional reaction." }
      ],
      adminHints: [
        "Consider how much planning went into the crime.",
        "Margaret purchased the poison a full week before using it.",
        "She admits to carefully planning the timing and method.",
        "Murder with this level of planning is called premeditated murder."
      ]
    },
    6: {
      mainAnswer: "trial-conviction",
      explanation: "With confession and evidence, Margaret will face trial for premeditated murder, leading to conviction and sentencing.",
      alternatives: [
        { answer: "court-trial", note: "Alternative phrasing accepted" },
        { answer: "prosecution", note: "Next step accepted" }
      ],
      steps: [
        { title: "Complete the investigation", description: "All evidence gathered and confession obtained." },
        { title: "Forward to prosecutor", description: "Send case file to Crown Prosecutor for trial." },
        { title: "Prepare for trial", description: "Evidence will be presented in court." },
        { title: "Await conviction", description: "With strong evidence, conviction is likely." }
      ],
      commonMistakes: [
        { wrongAnswer: "immediate-sentencing", reason: "A trial must occur before sentencing." },
        { wrongAnswer: "plea-bargain", reason: "With this much evidence, full prosecution is likely." },
        { wrongAnswer: "case-dismissed", reason: "Strong evidence and confession make dismissal unlikely." }
      ],
      adminHints: [
        "Margaret will face the legal system for her crimes.",
        "The next step after investigation is prosecution in court.",
        "A trial will determine her final guilt and sentence.",
        "The case moves from police investigation to court prosecution."
      ]
    }
  };

  return answerKeys[stage] || null;
};

export default AnswerKeyModal;