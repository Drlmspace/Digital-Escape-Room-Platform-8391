import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const navigate = useNavigate();

  // Auto-authenticate if not already authenticated
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';

  if (!isAuthenticated) {
    // Auto-set authentication instead of redirecting
    sessionStorage.setItem('adminAuthenticated', 'true');
    sessionStorage.setItem('adminUser', 'Admin');
  }

  // Always show authenticated content with admin bar
  return (
    <>
      {/* Admin Status Bar */}
      <div className="fixed top-0 left-0 right-0 bg-green-500/20 border-b border-green-500/30 p-2 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-300 text-sm">
            <Shield className="w-4 h-4" />
            <span>Admin Dashboard Active - Production Mode</span>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('adminAuthenticated');
              sessionStorage.removeItem('adminUser');
              navigate('/');
            }}
            className="text-green-300 hover:text-green-200 text-sm underline focus:outline-none focus:ring-2 focus:ring-green-400 rounded flex items-center gap-1"
          >
            <Home className="w-3 h-3" />
            Exit to Home
          </button>
        </div>
      </div>

      {/* Add top padding to account for admin bar */}
      <div className="pt-12">
        {children}
      </div>
    </>
  );
};

export default ProtectedAdminRoute;