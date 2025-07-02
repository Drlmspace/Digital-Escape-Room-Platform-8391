import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, LogIn } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { announceToScreenReader } = useAccessibility();

  // Auto-login on page load
  useEffect(() => {
    announceToScreenReader('Accessing admin dashboard automatically...');
    
    // Set admin session immediately
    sessionStorage.setItem('adminAuthenticated', 'true');
    sessionStorage.setItem('adminUser', 'Admin');
    
    // Redirect to admin dashboard after brief delay
    setTimeout(() => {
      navigate('/admin/demo');
    }, 1000);
  }, [navigate, announceToScreenReader]);

  const handleBackClick = () => {
    announceToScreenReader('Returning to home page');
    navigate('/');
  };

  const handleDirectAccess = () => {
    announceToScreenReader('Accessing admin dashboard...');
    sessionStorage.setItem('adminAuthenticated', 'true');
    sessionStorage.setItem('adminUser', 'Admin');
    navigate('/admin/demo');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBackClick}
          className="mb-8 p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center gap-2"
          aria-label="Go back to home page"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          <span>Back to Home</span>
        </motion.button>

        {/* Auto-Access Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center"
          role="main"
          aria-labelledby="admin-access-heading"
        >
          {/* Header */}
          <header className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h1 id="admin-access-heading" className="text-2xl font-bold text-white mb-2">
              Admin Dashboard Access
            </h1>
            <p className="text-gray-400">
              Direct access to the admin dashboard - no login required
            </p>
          </header>

          {/* Loading Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full"
              />
            </div>
            <p className="text-green-300 font-semibold">
              Accessing Admin Dashboard...
            </p>
            <p className="text-gray-400 text-sm mt-2">
              You will be redirected automatically
            </p>
          </motion.div>

          {/* Direct Access Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDirectAccess}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center gap-2"
            aria-label="Access admin dashboard immediately"
          >
            <LogIn className="w-5 h-5" aria-hidden="true" />
            <span>Access Dashboard Now</span>
          </motion.button>

          {/* Info Message */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h3 className="font-semibold text-blue-300 mb-2">✨ Instant Access</h3>
            <p className="text-blue-200 text-sm">
              Login requirements have been removed for easier access to the admin dashboard. 
              Click the button above or wait for automatic redirect.
            </p>
          </div>

          {/* Features Preview */}
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h3 className="font-semibold text-green-300 mb-2">🎮 Admin Features</h3>
            <ul className="text-green-200 text-sm space-y-1 text-left">
              <li>• Real-time team monitoring</li>
              <li>• Answer key access for all stages</li>
              <li>• Content editing and customization</li>
              <li>• Hint management system</li>
              <li>• Analytics and progress tracking</li>
              <li>• Music and content management</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;