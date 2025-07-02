import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Settings, BarChart3, Shield, Zap } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';

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
    // Auto-authenticate and go directly to admin dashboard
    sessionStorage.setItem('adminAuthenticated', 'true');
    sessionStorage.setItem('adminUser', 'Admin');
    navigate('/admin/demo');
  };

  return (
    <div className="min-h-screen">
      {/* Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Navigation */}
      <nav className="relative z-10 p-6" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            Allfun.us
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleAdminAccess}
            className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Access admin dashboard directly"
          >
            Admin Dashboard
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content" className="relative">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Digital Escape Room
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Revolution
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the pinnacle of digital escape room technology with fully accessible, 
              adaptive gameplay designed by world-class experts.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartGame}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Start new escape room experience"
            >
              <Play className="w-6 h-6" aria-hidden="true" />
              Start Your Adventure
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300 interactive-element"
                role="article"
                aria-labelledby={`feature-${index}`}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-4">
                    <feature.icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 id={`feature-${index}`} className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Accessibility Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 text-center"
          >
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-8 border border-green-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">
                Accessibility First Design
              </h2>
              <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Our escape rooms are designed with universal accessibility in mind. Every puzzle, 
                interaction, and feature is fully compatible with screen readers, keyboard navigation, 
                and other assistive technologies. We believe great experiences should be available to everyone.
              </p>
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
        </div>
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>
    </div>
  );
};

export default LandingPage;