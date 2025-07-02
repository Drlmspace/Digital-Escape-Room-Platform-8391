import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import SetupInterface from './pages/SetupInterface';
import PlayerInterface from './pages/PlayerInterface';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AccessibilityProvider from './providers/AccessibilityProvider';
import { GameProvider } from './providers/GameProvider';
import { AdminProvider } from './providers/AdminProvider';
import { ContentProvider } from './providers/ContentProvider';
import './App.css';

function App() {
  return (
    <AccessibilityProvider>
      <ContentProvider>
        <GameProvider>
          <AdminProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Live announcements for screen readers */}
                <div id="live-announcements" aria-live="polite" aria-atomic="true" className="sr-only"></div>
                
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/setup" element={<SetupInterface />} />
                  <Route path="/game/:sessionId" element={<PlayerInterface />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/:sessionId" element={<AdminDashboard />} />
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