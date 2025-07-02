import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, X, RotateCcw, Globe, FileText, Check, AlertTriangle } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';
import { SITE_CONFIG } from '../config/siteConfig';

const SiteSettingsModal = ({ isOpen, onClose, onUpdateSettings }) => {
  const { announceToScreenReader } = useAccessibility();
  const [settings, setSettings] = useState({
    title: SITE_CONFIG.title,
    shortName: SITE_CONFIG.shortName,
    description: SITE_CONFIG.description,
    navTitle: SITE_CONFIG.navTitle,
    adminTitle: SITE_CONFIG.adminTitle
  });
  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', 'error'

  useEffect(() => {
    if (isOpen) {
      const currentSettings = {
        title: SITE_CONFIG.title,
        shortName: SITE_CONFIG.shortName,
        description: SITE_CONFIG.description,
        navTitle: SITE_CONFIG.navTitle,
        adminTitle: SITE_CONFIG.adminTitle
      };
      setSettings(currentSettings);
      setOriginalSettings(currentSettings);
      setHasChanges(false);
      setSaveStatus(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(hasChanges);
  }, [settings, originalSettings]);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveStatus(null);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    announceToScreenReader('Saving site settings...');
    
    try {
      // Update the SITE_CONFIG object
      Object.assign(SITE_CONFIG, settings);
      
      // Update localStorage for persistence
      localStorage.setItem('siteSettings', JSON.stringify(settings));
      
      // Update document title
      document.title = settings.title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.content = settings.description;
      }
      
      // Notify parent component
      if (onUpdateSettings) {
        onUpdateSettings(settings);
      }
      
      setOriginalSettings({ ...settings });
      setSaveStatus('saved');
      announceToScreenReader('Site settings saved successfully!');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      announceToScreenReader('Failed to save site settings. Please try again.');
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      title: "Professional Digital Escape Room Experience",
      shortName: "Escape Room Platform",
      description: "Revolutionary digital escape room experience with full accessibility and real-time collaboration",
      navTitle: "Digital Escape Room Platform",
      adminTitle: "Admin Dashboard"
    };
    
    setSettings(defaultSettings);
    setSaveStatus(null);
    announceToScreenReader('Settings reset to defaults');
  };

  const handleCancel = () => {
    setSettings({ ...originalSettings });
    setSaveStatus(null);
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
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-700"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="site-settings-title"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-400" />
                <div>
                  <h2 id="site-settings-title" className="text-2xl font-bold text-white">
                    Site Settings
                  </h2>
                  <p className="text-gray-400">
                    Customize site titles and descriptions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <div className="flex items-center gap-2 text-yellow-300">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm">Unsaved changes</span>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Close settings"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6 space-y-6">
              {/* Save Status */}
              <AnimatePresence>
                {saveStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-lg border ${
                      saveStatus === 'saved' 
                        ? 'bg-green-500/10 border-green-500/20 text-green-300'
                        : saveStatus === 'error'
                        ? 'bg-red-500/10 border-red-500/20 text-red-300'
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {saveStatus === 'saving' && (
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      )}
                      {saveStatus === 'saved' && <Check className="w-5 h-5" />}
                      {saveStatus === 'error' && <AlertTriangle className="w-5 h-5" />}
                      <span className="font-medium">
                        {saveStatus === 'saving' && 'Saving settings...'}
                        {saveStatus === 'saved' && 'Settings saved successfully!'}
                        {saveStatus === 'error' && 'Failed to save settings'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Title */}
              <div className="space-y-2">
                <label htmlFor="main-title" className="block text-sm font-medium text-gray-300">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Main Site Title
                </label>
                <input
                  id="main-title"
                  type="text"
                  value={settings.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter main site title..."
                  maxLength={100}
                />
                <p className="text-xs text-gray-400">
                  Used as the browser tab title and main heading
                </p>
              </div>

              {/* Short Name */}
              <div className="space-y-2">
                <label htmlFor="short-name" className="block text-sm font-medium text-gray-300">
                  Short Name
                </label>
                <input
                  id="short-name"
                  type="text"
                  value={settings.shortName}
                  onChange={(e) => handleInputChange('shortName', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter short name..."
                  maxLength={50}
                />
                <p className="text-xs text-gray-400">
                  Used in certificates and compact displays
                </p>
              </div>

              {/* Navigation Title */}
              <div className="space-y-2">
                <label htmlFor="nav-title" className="block text-sm font-medium text-gray-300">
                  Navigation Title
                </label>
                <input
                  id="nav-title"
                  type="text"
                  value={settings.navTitle}
                  onChange={(e) => handleInputChange('navTitle', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter navigation title..."
                  maxLength={80}
                />
                <p className="text-xs text-gray-400">
                  Displayed in the top navigation bar
                </p>
              </div>

              {/* Admin Title */}
              <div className="space-y-2">
                <label htmlFor="admin-title" className="block text-sm font-medium text-gray-300">
                  Admin Dashboard Title
                </label>
                <input
                  id="admin-title"
                  type="text"
                  value={settings.adminTitle}
                  onChange={(e) => handleInputChange('adminTitle', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter admin title..."
                  maxLength={50}
                />
                <p className="text-xs text-gray-400">
                  Title shown in the admin dashboard
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Site Description
                </label>
                <textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  placeholder="Enter site description..."
                  rows="3"
                  maxLength={300}
                />
                <p className="text-xs text-gray-400">
                  Used for SEO meta description and landing page subtitle
                </p>
              </div>

              {/* Character Counts */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Character Limits</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Title:</span>
                    <span className="text-white">{settings.title.length}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Short Name:</span>
                    <span className="text-white">{settings.shortName.length}/50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nav Title:</span>
                    <span className="text-white">{settings.navTitle.length}/80</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Admin Title:</span>
                    <span className="text-white">{settings.adminTitle.length}/50</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-400">Description:</span>
                    <span className="text-white">{settings.description.length}/300</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-3">Preview</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Browser Tab:</span>
                    <div className="bg-slate-700/50 rounded p-2 mt-1 font-mono text-white">
                      {settings.title}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Navigation Bar:</span>
                    <div className="bg-slate-700/50 rounded p-2 mt-1 text-white">
                      {settings.navTitle}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Description:</span>
                    <div className="bg-slate-700/50 rounded p-2 mt-1 text-gray-300 text-xs leading-relaxed">
                      {settings.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </motion.button>
              
              <div className="flex-1"></div>
              
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              
              <motion.button
                whileHover={{ scale: hasChanges ? 1.02 : 1 }}
                whileTap={{ scale: hasChanges ? 0.98 : 1 }}
                onClick={handleSave}
                disabled={!hasChanges || saveStatus === 'saving'}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center gap-2"
              >
                {saveStatus === 'saving' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SiteSettingsModal;