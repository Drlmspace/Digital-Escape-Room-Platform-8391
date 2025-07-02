// Dynamic template generation system

export const generateEscapeRoom = (theme, difficulty, teamSize, sessionType) => {
  const baseTemplate = getBaseTemplate();
  const themeData = getThemeData(theme);
  const difficultyModifiers = getDifficultyModifiers(difficulty);
  const teamOptimizations = getTeamOptimizations(teamSize);
  
  return combineTemplateElements(baseTemplate, themeData, difficultyModifiers, teamOptimizations);
};

const getBaseTemplate = () => ({
  structure: {
    totalStages: 6,
    timePerStage: 10, // minutes
    collaborationRequired: true,
    progressiveHints: true
  },
  learningObjectives: [
    'Problem-solving skills',
    'Team collaboration',
    'Digital literacy',
    'Critical thinking',
    'Communication skills',
    'Creative synthesis'
  ],
  accessibilityFeatures: {
    screenReaderSupport: true,
    keyboardNavigation: true,
    captionsAvailable: true,
    audioDescriptions: true,
    highContrastMode: true
  }
});

const getThemeData = (theme) => {
  const themes = {
    'digital-time-vault': {
      name: 'Digital Time Vault',
      setting: 'Futuristic digital archaeology lab',
      narrative: 'Navigate through temporal puzzles and digital archaeology',
      visualStyle: 'cyber-tech',
      colorScheme: ['#3b82f6', '#8b5cf6', '#06b6d4'],
      stages: [
        {
          id: 1,
          title: 'Temporal Breach Detection',
          objective: 'Pattern recognition and digital literacy',
          puzzleType: 'cipher-analysis',
          multimedia: ['historical-timeline', 'audio-spectrogram']
        },
        {
          id: 2,
          title: 'Network Restoration Protocol',
          objective: 'Systems thinking and logical sequencing',
          puzzleType: 'network-diagram',
          multimedia: ['network-animation', 'data-flow-video']
        },
        {
          id: 3,
          title: 'Algorithm Reconstruction',
          objective: 'Computational thinking and logic',
          puzzleType: 'flowchart-completion',
          multimedia: ['algorithm-visualization', 'code-fragments']
        },
        {
          id: 4,
          title: 'Data Archaeological Dig',
          objective: 'Information synthesis and analysis',
          puzzleType: 'evidence-analysis',
          multimedia: ['historical-footage', 'audio-artifacts', 'documents']
        },
        {
          id: 5,
          title: 'Temporal Synchronization',
          objective: 'Teamwork and communication',
          puzzleType: 'collaborative-puzzle',
          multimedia: ['communication-tools', 'sync-challenges']
        },
        {
          id: 6,
          title: 'Quantum Lock Resolution',
          objective: 'Synthesis and creative problem-solving',
          puzzleType: 'meta-puzzle',
          multimedia: ['interactive-finale', 'team-creation-tools']
        }
      ]
    },
    
    'murder-mystery': {
      name: 'The Digital Detective',
      setting: 'Victorian mansion with smart home technology',
      narrative: 'Solve a Victorian mansion murder with smart home technology',
      visualStyle: 'gothic-tech',
      colorScheme: ['#dc2626', '#7c2d12', '#374151'],
      stages: [
        {
          id: 1,
          title: 'Crime Scene Analysis',
          objective: 'Evidence gathering and observation',
          puzzleType: 'scene-investigation',
          multimedia: ['crime-scene-photos', 'forensic-tools']
        },
        {
          id: 2,
          title: 'Witness Interview Reconstruction',
          objective: 'Audio/video analysis and deduction',
          puzzleType: 'testimony-analysis',
          multimedia: ['interview-recordings', 'body-language-clues']
        },
        {
          id: 3,
          title: 'Alibi Timeline Construction',
          objective: 'Logic puzzle and timeline reasoning',
          puzzleType: 'timeline-puzzle',
          multimedia: ['calendar-data', 'movement-tracking']
        },
        {
          id: 4,
          title: 'Forensic Evidence Processing',
          objective: 'Pattern matching and analysis',
          puzzleType: 'forensic-analysis',
          multimedia: ['lab-equipment', 'evidence-database']
        },
        {
          id: 5,
          title: 'Suspect Interrogation',
          objective: 'Deduction and reasoning',
          puzzleType: 'interrogation-puzzle',
          multimedia: ['suspect-profiles', 'questioning-tools']
        },
        {
          id: 6,
          title: 'Case Resolution',
          objective: 'Synthesis and accusation',
          puzzleType: 'final-accusation',
          multimedia: ['courtroom-simulation', 'evidence-presentation']
        }
      ]
    },
    
    'space-adventure': {
      name: 'Starship Emergency',
      setting: 'Malfunctioning generation ship',
      narrative: 'Repair a malfunctioning generation ship before it\'s too late',
      visualStyle: 'space-tech',
      colorScheme: ['#059669', '#0ea5e9', '#6366f1'],
      stages: [
        {
          id: 1,
          title: 'System Diagnostics',
          objective: 'Technical troubleshooting',
          puzzleType: 'system-analysis',
          multimedia: ['diagnostic-panels', 'error-logs']
        },
        {
          id: 2,
          title: 'Navigation Correction',
          objective: 'Mathematical calculations',
          puzzleType: 'navigation-math',
          multimedia: ['star-charts', 'calculation-tools']
        },
        {
          id: 3,
          title: 'Life Support Restoration',
          objective: 'Resource management',
          puzzleType: 'resource-allocation',
          multimedia: ['atmospheric-data', 'system-controls']
        },
        {
          id: 4,
          title: 'Communication Array Repair',
          objective: 'Signal processing',
          puzzleType: 'signal-puzzle',
          multimedia: ['radio-equipment', 'signal-analysis']
        },
        {
          id: 5,
          title: 'Crew Coordination',
          objective: 'Teamwork challenges',
          puzzleType: 'crew-management',
          multimedia: ['crew-assignments', 'coordination-tools']
        },
        {
          id: 6,
          title: 'Emergency Landing',
          objective: 'Time-pressure synthesis',
          puzzleType: 'landing-sequence',
          multimedia: ['landing-simulation', 'emergency-protocols']
        }
      ]
    }
  };
  
  return themes[theme] || themes['digital-time-vault'];
};

const getDifficultyModifiers = (difficulty) => {
  const modifiers = {
    easy: {
      timeMultiplier: 1.5,
      hintsAvailable: 5,
      puzzleComplexity: 'simplified',
      skipOptions: 'available',
      visualAids: 'enhanced',
      instructions: 'detailed'
    },
    medium: {
      timeMultiplier: 1.0,
      hintsAvailable: 3,
      puzzleComplexity: 'standard',
      skipOptions: 'limited',
      visualAids: 'standard',
      instructions: 'standard'
    },
    difficult: {
      timeMultiplier: 0.8,
      hintsAvailable: 1,
      puzzleComplexity: 'advanced',
      skipOptions: 'none',
      visualAids: 'minimal',
      instructions: 'brief',
      redHerrings: 'added'
    }
  };
  
  return modifiers[difficulty] || modifiers.medium;
};

const getTeamOptimizations = (teamSize) => {
  const optimizations = {
    small: { // 1-3 players
      collaborationLevel: 'individual-focused',
      puzzleDistribution: 'sequential',
      communicationTools: 'minimal',
      roleAssignment: 'flexible'
    },
    medium: { // 4-6 players
      collaborationLevel: 'balanced',
      puzzleDistribution: 'parallel-and-sequential',
      communicationTools: 'standard',
      roleAssignment: 'suggested'
    },
    large: { // 7-10 players
      collaborationLevel: 'highly-collaborative',
      puzzleDistribution: 'parallel',
      communicationTools: 'enhanced',
      roleAssignment: 'defined-roles'
    }
  };
  
  const category = teamSize <= 3 ? 'small' : teamSize <= 6 ? 'medium' : 'large';
  return optimizations[category];
};

const combineTemplateElements = (base, theme, difficulty, team) => {
  return {
    ...base,
    theme: theme,
    difficulty: difficulty,
    teamOptimization: team,
    
    // Combined time allocation
    totalTime: base.structure.totalStages * base.structure.timePerStage * difficulty.timeMultiplier,
    
    // Enhanced stages with difficulty and team adjustments
    stages: theme.stages.map(stage => ({
      ...stage,
      timeAllowed: base.structure.timePerStage * difficulty.timeMultiplier,
      hintsAvailable: difficulty.hintsAvailable,
      complexity: difficulty.puzzleComplexity,
      teamRole: assignTeamRoles(stage, team),
      accessibility: base.accessibilityFeatures
    })),
    
    // Adaptive features
    adaptiveFeatures: {
      realTimeDifficultyAdjustment: true,
      progressiveHintSystem: true,
      collaborationTracking: true,
      accessibilityMonitoring: true
    }
  };
};

const assignTeamRoles = (stage, teamOptimization) => {
  if (teamOptimization.roleAssignment === 'flexible') {
    return { type: 'any-player', specialization: 'none' };
  }
  
  if (teamOptimization.roleAssignment === 'suggested') {
    return {
      type: 'suggested-roles',
      roles: ['analyst', 'communicator', 'technical-specialist', 'coordinator']
    };
  }
  
  return {
    type: 'defined-roles',
    roles: [
      'lead-investigator',
      'technical-analyst', 
      'communication-specialist',
      'pattern-recognition-expert',
      'synthesis-coordinator',
      'quality-assurance',
      'documentation-manager'
    ]
  };
};

export const generateCustomTemplate = (specifications) => {
  // Allow for custom template creation
  return {
    id: `custom-${Date.now()}`,
    name: specifications.name,
    description: specifications.description,
    stages: specifications.stages.map((stage, index) => ({
      id: index + 1,
      ...stage,
      accessibility: getBaseTemplate().accessibilityFeatures
    })),
    customFeatures: specifications.features || {}
  };
};