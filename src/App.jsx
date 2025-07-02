import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import AccessibilityProvider from './providers/AccessibilityProvider';
import { GameProvider } from './providers/GameProvider';
import { AdminProvider } from './providers/AdminProvider';
import { ContentProvider } from './providers/ContentProvider';
import './App.css';

// Import pages directly instead of lazy loading to fix initial load
import LandingPage from './pages/LandingPage';
import SetupInterface from './pages/SetupInterface';
import PlayerInterface from './pages/PlayerInterface';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Simple loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading Escape Room...</p>
    </motion.div>
  </div>
);

function App() {
  return (
    <AccessibilityProvider>
      <ContentProvider>
        <GameProvider>
          <AdminProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Live announcements for screen readers */}
                <div
                  id="live-announcements"
                  aria-live="polite"
                  aria-atomic="true"
                  className="sr-only"
                ></div>

                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/setup" element={<SetupInterface />} />
                  <Route path="/game/:sessionId" element={<PlayerInterface />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Routes>
              </div>
            </Router>
          </AdminProvider>
        </GameProvider>
      </ContentProvider>
    </AccessibilityProvider>
  );
}

export default App;