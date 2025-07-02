import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Save, X, RotateCcw, Eye, EyeOff, Copy, Check, AlertTriangle, FileText, Wand2, Search, Skull } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';

const ContentEditor = ({ onContentUpdate, currentTheme, isVisible, onClose }) => {
  const { announceToScreenReader } = useAccessibility();
  const [editingContent, setEditingContent] = useState({});
  const [originalContent, setOriginalContent] = useState({});
  const [activeEditStage, setActiveEditStage] = useState(null);
  const [activeEditField, setActiveEditField] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [copiedStage, setCopiedStage] = useState(null);

  // Initialize content from default templates
  useEffect(() => {
    const defaultContent = getDefaultContent(currentTheme);
    setEditingContent(defaultContent);
    setOriginalContent(JSON.parse(JSON.stringify(defaultContent)));
  }, [currentTheme]);

  const handleFieldEdit = (stage, field, value) => {
    setEditingContent(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
    announceToScreenReader(`Editing ${field} for stage ${stage}`);
  };

  const handleSaveStage = (stage) => {
    setActiveEditStage(null);
    setActiveEditField(null);
    announceToScreenReader(`Changes saved for stage ${stage}`);
    
    // Notify parent component of content update
    if (onContentUpdate) {
      onContentUpdate(editingContent);
    }
  };

  const handleResetStage = (stage) => {
    setEditingContent(prev => ({
      ...prev,
      [stage]: { ...originalContent[stage] }
    }));
    setActiveEditStage(null);
    setActiveEditField(null);
    announceToScreenReader(`Stage ${stage} reset to original content`);
  };

  const handleSaveAll = () => {
    setOriginalContent(JSON.parse(JSON.stringify(editingContent)));
    setHasUnsavedChanges(false);
    announceToScreenReader('All changes saved successfully');
    
    if (onContentUpdate) {
      onContentUpdate(editingContent);
    }
  };

  const handleResetAll = () => {
    const defaultContent = getDefaultContent(currentTheme);
    setEditingContent(defaultContent);
    setOriginalContent(JSON.parse(JSON.stringify(defaultContent)));
    setHasUnsavedChanges(false);
    setActiveEditStage(null);
    setActiveEditField(null);
    announceToScreenReader('All content reset to defaults');
  };

  const copyStageContent = (stage) => {
    const content = editingContent[stage];
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopiedStage(stage);
    announceToScreenReader(`Stage ${stage} content copied to clipboard`);
    setTimeout(() => setCopiedStage(null), 2000);
  };

  const getThemeInfo = (theme) => {
    const themes = {
      'murder-mystery': {
        name: 'Murder Mystery',
        icon: Search,
        color: 'from-red-500 to-orange-600',
        stages: 6
      },
      'haunted-mansion': {
        name: 'Haunted Mansion',
        icon: Skull,
        color: 'from-purple-500 to-pink-600',
        stages: 6
      },
      'wizards-tower': {
        name: 'Wizard\'s Tower',
        icon: Wand2,
        color: 'from-blue-500 to-cyan-600',
        stages: 6
      }
    };
    return themes[theme] || themes['murder-mystery'];
  };

  const themeInfo = getThemeInfo(currentTheme);

  if (!isVisible) return null;

  return (
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
        className="bg-slate-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="content-editor-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <themeInfo.icon className="w-8 h-8 text-blue-400" />
              <div>
                <h2 id="content-editor-title" className="text-2xl font-bold text-white">
                  Content Editor
                </h2>
                <p className="text-gray-400">
                  {themeInfo.name} - Edit stage titles and descriptions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-yellow-300">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
                aria-label={`${previewMode ? 'Exit' : 'Enter'} preview mode`}
              >
                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {previewMode ? 'Exit Preview' : 'Preview'}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label="Close content editor"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save All Changes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetAll}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All to Default
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {previewMode ? (
              <ContentPreview content={editingContent} theme={currentTheme} />
            ) : (
              <div className="space-y-6">
                {Array.from({ length: themeInfo.stages }, (_, i) => i + 1).map((stage) => (
                  <StageEditor
                    key={stage}
                    stage={stage}
                    content={editingContent[stage] || {}}
                    originalContent={originalContent[stage] || {}}
                    isEditing={activeEditStage === stage}
                    activeField={activeEditField}
                    onStartEdit={(field) => {
                      setActiveEditStage(stage);
                      setActiveEditField(field);
                    }}
                    onFieldChange={(field, value) => handleFieldEdit(stage, field, value)}
                    onSave={() => handleSaveStage(stage)}
                    onReset={() => handleResetStage(stage)}
                    onCopy={() => copyStageContent(stage)}
                    isCopied={copiedStage === stage}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StageEditor = ({
  stage,
  content,
  originalContent,
  isEditing,
  activeField,
  onStartEdit,
  onFieldChange,
  onSave,
  onReset,
  onCopy,
  isCopied
}) => {
  const hasChanges = JSON.stringify(content) !== JSON.stringify(originalContent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-700/50 rounded-xl p-6 border-2 transition-all duration-300 ${
        isEditing ? 'border-blue-500/40' : hasChanges ? 'border-yellow-500/40' : 'border-transparent'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
            {stage}
          </span>
          Stage {stage}
          {hasChanges && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
              Modified
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label={`Copy stage ${stage} content`}
          >
            {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          {hasChanges && (
            <button
              onClick={onReset}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label={`Reset stage ${stage} to original`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          {isEditing && (
            <button
              onClick={onSave}
              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label={`Save changes to stage ${stage}`}
            >
              <Save className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Title Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Stage Title
            </label>
            {!isEditing && (
              <button
                onClick={() => onStartEdit('title')}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label={`Edit title for stage ${stage}`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
          {isEditing && activeField === 'title' ? (
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => onFieldChange('title', e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter stage title..."
              autoFocus
            />
          ) : (
            <div className="p-3 bg-slate-600/50 rounded-lg border border-transparent hover:border-blue-500/30 transition-colors">
              <p className="text-white font-medium">
                {content.title || 'No title set'}
              </p>
            </div>
          )}
        </div>

        {/* Description Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Stage Description
            </label>
            {!isEditing && (
              <button
                onClick={() => onStartEdit('description')}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label={`Edit description for stage ${stage}`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
          {isEditing && activeField === 'description' ? (
            <textarea
              value={content.description || ''}
              onChange={(e) => onFieldChange('description', e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Enter stage description..."
              rows="4"
              autoFocus
            />
          ) : (
            <div className="p-3 bg-slate-600/50 rounded-lg border border-transparent hover:border-blue-500/30 transition-colors">
              <p className="text-gray-300 leading-relaxed">
                {content.description || 'No description set'}
              </p>
            </div>
          )}
        </div>

        {/* Backstory Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Backstory (Optional)
            </label>
            {!isEditing && (
              <button
                onClick={() => onStartEdit('backstory')}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label={`Edit backstory for stage ${stage}`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
          {isEditing && activeField === 'backstory' ? (
            <textarea
              value={content.backstory || ''}
              onChange={(e) => onFieldChange('backstory', e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Enter backstory..."
              rows="3"
              autoFocus
            />
          ) : (
            <div className="p-3 bg-slate-600/50 rounded-lg border border-transparent hover:border-blue-500/30 transition-colors">
              <p className="text-gray-300 text-sm leading-relaxed">
                {content.backstory || 'No backstory set'}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ContentPreview = ({ content, theme }) => {
  const getThemeInfo = (theme) => {
    const themes = {
      'murder-mystery': { name: 'Murder Mystery', icon: Search },
      'haunted-mansion': { name: 'Haunted Mansion', icon: Skull },
      'wizards-tower': { name: 'Wizard\'s Tower', icon: Wand2 }
    };
    return themes[theme] || themes['murder-mystery'];
  };

  const themeInfo = getThemeInfo(theme);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/20 rounded-lg mb-4">
          <themeInfo.icon className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Preview Mode</h3>
        </div>
        <p className="text-gray-400">
          This is how the content will appear to players during the game
        </p>
      </div>

      {Object.entries(content).map(([stage, stageContent]) => (
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {stage}
            </div>
            <h3 className="text-xl font-semibold text-white">
              {stageContent.title || `Stage ${stage}`}
            </h3>
          </div>

          <div className="space-y-4">
            {stageContent.description && (
              <p className="text-gray-300 leading-relaxed">
                {stageContent.description}
              </p>
            )}

            {stageContent.backstory && (
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-300 mb-2">Background:</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {stageContent.backstory}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const getDefaultContent = (theme) => {
  const defaultContents = {
    'murder-mystery': {
      1: {
        title: "The Crime Scene",
        description: "A wealthy businessman has been found dead in his locked study. Examine the evidence to determine what happened.",
        backstory: "Lord Blackwood was discovered this morning by his butler, slumped over his desk. The door was locked from the inside, and no weapon was found."
      },
      2: {
        title: "The Suspect's Alibi",
        description: "You've identified the poison, but who had access? Examine the testimonies to find inconsistencies.",
        backstory: "Three people had access to Lord Blackwood's study that morning: his butler, his business partner, and his niece."
      },
      3: {
        title: "The Hidden Evidence",
        description: "Search Margaret's belongings for the murder weapon and additional evidence of premeditation.",
        backstory: "With Margaret identified as the killer, the police search her possessions for the source of the cyanide."
      },
      4: {
        title: "The Final Confrontation",
        description: "Present your case to Margaret and get her to confess to the murder.",
        backstory: "With all evidence gathered, it's time to confront Margaret with the proof of her guilt."
      },
      5: {
        title: "Justice Served",
        description: "With Margaret's confession obtained, determine the appropriate charges and sentence.",
        backstory: "Margaret has confessed to the murder. Now the legal system must determine her fate."
      },
      6: {
        title: "Case Closed",
        description: "Complete the final case report and close the investigation.",
        backstory: "The murder of Lord Blackwood has been solved. Margaret Reynolds will face trial for premeditated murder."
      }
    },
    'haunted-mansion': {
      1: {
        title: "The Restless Spirits",
        description: "Strange phenomena plague this old mansion. Investigate the supernatural occurrences to understand what the spirits want.",
        backstory: "The Grimwood family has lived in this mansion for generations, but recently, ghostly apparitions and unexplained events have driven them out."
      },
      2: {
        title: "The Family Secret",
        description: "You've learned the spirits seek vengeance, but for what crime? Uncover the dark family secret hidden for generations.",
        backstory: "The spirit belongs to Eleanor Grimwood, who died mysteriously 100 years ago. Her death was ruled a suicide, but she claims otherwise."
      },
      3: {
        title: "The Cursed Mirror",
        description: "Find the cursed mirror that shows the truth of past events and reveals Eleanor's final moments.",
        backstory: "Eleanor's spirit grows stronger. She leads you to an antique mirror that supposedly shows the truth of what happened."
      },
      4: {
        title: "The Séance",
        description: "Conduct a séance to communicate directly with Eleanor's spirit and get her full testimony.",
        backstory: "With the mirror's revelations, you attempt to contact Eleanor directly to get the complete story of her murder."
      },
      5: {
        title: "Breaking the Curse",
        description: "Find the hidden evidence that will expose Charles's crime and free Eleanor's spirit.",
        backstory: "Eleanor has revealed where Charles hid the evidence of his crime. Find it to break the curse on the mansion."
      },
      6: {
        title: "Eternal Rest",
        description: "With the truth revealed, help Eleanor's spirit find peace and end the haunting of Grimwood Manor.",
        backstory: "The evidence has been found and the truth exposed. Eleanor can finally rest in peace."
      }
    },
    'wizards-tower': {
      1: {
        title: "The Apprentice's Trial",
        description: "You are a new apprentice in the wizard's tower. Learn the basic principles of magic by studying the ancient artifacts.",
        backstory: "Master Aldric has left you alone in his tower with instructions to prove your magical aptitude by understanding the four elements."
      },
      2: {
        title: "The Potion Formula",
        description: "Now that you understand magical harmony, brew the Elixir of Truth by combining the right ingredients in the proper proportions.",
        backstory: "Master Aldric's notes mention a powerful truth potion, but the formula is encoded. You must decipher the alchemical symbols."
      },
      3: {
        title: "The Ancient Spell",
        description: "Decode an ancient spell scroll to unlock the next level of magical knowledge.",
        backstory: "A mysterious scroll has appeared on the tower's desk. The runes are ancient, but they seem to respond to your newfound understanding."
      },
      4: {
        title: "The Magical Duel",
        description: "Face Master Aldric's magical construct in a test of your growing power and knowledge.",
        backstory: "Master Aldric has returned and activated a magical guardian to test your progress. You must prove worthy of advanced training."
      },
      5: {
        title: "The Master's Test",
        description: "Master Aldric presents you with the final test to become a true wizard apprentice.",
        backstory: "Impressed by your progress, Master Aldric offers you the chance to prove yourself worthy of the tower's greatest secrets."
      },
      6: {
        title: "Master of Magic",
        description: "With all tests completed, receive Master Aldric's final blessing and become a true wizard.",
        backstory: "You have proven yourself worthy. Master Aldric is ready to grant you the title of wizard and the secrets of the tower."
      }
    }
  };

  return defaultContents[theme] || defaultContents['murder-mystery'];
};

export default ContentEditor;