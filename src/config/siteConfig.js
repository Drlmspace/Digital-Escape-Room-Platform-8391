// Site Configuration - Easy to modify for different deployments
export const SITE_CONFIG = {
  // Main site branding
  name: "Digital Escape Room Platform",
  title: "Professional Digital Escape Room Experience",
  shortName: "Escape Room Platform",
  
  // Navigation branding
  navTitle: "Digital Escape Room Platform",
  
  // Meta information
  description: "Revolutionary digital escape room experience with full accessibility and real-time collaboration",
  version: "1.0.0",
  
  // Admin settings
  adminTitle: "Admin Dashboard",
  
  // Certificate settings
  certificateIssuer: "Digital Escape Room Platform",
  certificateFooter: "Powered by Advanced Puzzle Technology",
  
  // Theme settings
  themes: {
    'murder-mystery': {
      name: 'Murder Mystery',
      title: 'The Midnight Murder',
      description: 'Solve a classic whodunit in a Victorian mansion'
    },
    'haunted-mansion': {
      name: 'Haunted Mansion', 
      title: 'Cursed Manor',
      description: 'Escape from a supernatural mansion filled with ghosts and dark secrets'
    },
    'wizards-tower': {
      name: 'Wizard\'s Tower',
      title: 'The Enchanted Tower', 
      description: 'Master magical spells and overcome mystical challenges'
    }
  },
  
  // Feature flags
  features: {
    adminAccess: true,
    certificateDownload: true,
    contentEditor: true,
    musicController: true,
    accessibilityFeatures: true
  }
};