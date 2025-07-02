import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Settings, BarChart3, Shield, Zap } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';
import { SITE_CONFIG } from '../config/siteConfig';

const LandingPage = () => {
  const navigate = useNavigate();
  const { announceToScreenReader } = useAccessibility();

  const features = [
    {
      icon: Play,
      title: 'Immersive Gameplay',
      description: 'Dynamic puzzles that adapt to your team\'s skill level in real-time'
    },
    {
      icon: Users,
      title: 'Team Collaboration', 
      description: 'Built for 1-10 players with role-based challenges and communication tools'
    },
    {
      icon: Shield,
      title: 'Fully Accessible',
      description: 'WCAG 2.1 AA compliant with screen reader support and keyboard navigation'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Live monitoring and performance tracking for enhanced learning outcomes'
    },
    {
      icon: Settings,
      title: 'Admin Controls',
      description: 'Dynamic difficulty adjustment and hint management during gameplay'
    },
    {
      icon: Zap,
      title: 'Multiple Themes',
      description: 'Expandable template system with various scenarios and difficulty levels'
    }
  ];

  const handleStartGame = () => {
    announceToScreenReader('Navigating to game setup');
    navigate('/setup');
  };

  const handleAdminAccess = () => {
    announceToScreenReader('Accessing admin dashboard');
    sessionStorage.setItem('adminAuthenticated', 'true');
    sessionStorage.setItem('adminUser', 'Admin');
    navigate('/admin/demo');
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            {SITE_CONFIG.navTitle}
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleAdminAccess}
            className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Admin Dashboard
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {SITE_CONFIG.title}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Experience
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {SITE_CONFIG.description}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartGame}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <Play className="w-6 h-6" />
              Start Your Adventure
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Demo Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-8 border border-green-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">
                Interactive Demo Experience
              </h2>
              <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
                Explore our fully functional escape room with three immersive themes: Murder Mystery, Haunted Mansion, and Wizard's Tower. Each features unique puzzles, progressive hints, and accessible design for all players.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                {Object.entries(SITE_CONFIG.themes).map(([key, theme]) => (
                  <div key={key} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-300 mb-2">{theme.name}</h3>
                    <p className="text-gray-400 text-sm">{theme.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                <span>WCAG 2.1 AA Compliant</span>
                <span>•</span>
                <span>Screen Reader Optimized</span>
                <span>•</span>
                <span>Keyboard Navigation</span>
                <span>•</span>
                <span>High Contrast Support</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Start Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-blue-300 mb-4 text-center">Quick Start Guide</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">1</div>
                <p className="text-white font-semibold">Choose Your Theme</p>
                <p className="text-gray-400">Select from 3 immersive scenarios</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">2</div>
                <p className="text-white font-semibold">Set Team Name</p>
                <p className="text-gray-400">Enter your team name for certificates</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">3</div>
                <p className="text-white font-semibold">Start Playing!</p>
                <p className="text-gray-400">Solve puzzles and escape together</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;