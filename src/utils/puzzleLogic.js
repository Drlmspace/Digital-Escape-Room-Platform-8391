// Puzzle solution checking and validation logic

export const checkSolution = (userInput, puzzle) => {
  if (!puzzle || !userInput) return false;
  
  const normalizedInput = userInput.toString().toLowerCase().trim();
  const normalizedSolution = puzzle.solution.toLowerCase().trim();
  
  switch (puzzle.type) {
    case 'text-input':
      return normalizedInput === normalizedSolution;
    
    case 'pattern-matching':
      return normalizedInput === normalizedSolution;
    
    case 'multiple-choice':
      return normalizedInput === normalizedSolution;
    
    case 'sequence':
      return checkSequence(userInput, puzzle.solution);
    
    default:
      return false;
  }
};

const checkSequence = (userSequence, correctSequence) => {
  if (!Array.isArray(userSequence) || !Array.isArray(correctSequence)) {
    return false;
  }
  
  if (userSequence.length !== correctSequence.length) {
    return false;
  }
  
  return userSequence.every((item, index) => 
    item.toString().toLowerCase() === correctSequence[index].toString().toLowerCase()
  );
};

export const generateDifficultyVariant = (basePuzzle, difficulty) => {
  const variants = {
    easy: {
      timeMultiplier: 1.5,
      hintsAvailable: 5,
      simplifyInstructions: true,
      addVisualAids: true
    },
    medium: {
      timeMultiplier: 1.0,
      hintsAvailable: 3,
      simplifyInstructions: false,
      addVisualAids: false
    },
    difficult: {
      timeMultiplier: 0.8,
      hintsAvailable: 1,
      simplifyInstructions: false,
      addVisualAids: false,
      addRedHerrings: true
    }
  };
  
  const variant = variants[difficulty] || variants.medium;
  
  return {
    ...basePuzzle,
    difficulty,
    timeAllowed: basePuzzle.baseTime * variant.timeMultiplier,
    hintsAvailable: variant.hintsAvailable,
    description: variant.simplifyInstructions 
      ? simplifyDescription(basePuzzle.description)
      : basePuzzle.description,
    visualAids: variant.addVisualAids ? generateVisualAids(basePuzzle) : null,
    redHerrings: variant.addRedHerrings ? generateRedHerrings(basePuzzle) : null
  };
};

const simplifyDescription = (description) => {
  // Simplify language for easier difficulty
  return description
    .replace(/analyze/gi, 'look at')
    .replace(/examine/gi, 'check')
    .replace(/investigate/gi, 'find')
    .replace(/determine/gi, 'figure out');
};

const generateVisualAids = (puzzle) => {
  // Generate additional visual aids for easier difficulty
  return {
    stepByStep: true,
    highlightedClues: true,
    progressIndicator: true
  };
};

const generateRedHerrings = (puzzle) => {
  // Add false clues for difficult mode
  return {
    falseClues: true,
    ambiguousInstructions: true,
    additionalComplexity: true
  };
};

export const validateAccessibility = (puzzle) => {
  const issues = [];
  
  // Check for screen reader compatibility
  if (!puzzle.ariaLabel) {
    issues.push('Missing aria-label for screen readers');
  }
  
  // Check for keyboard navigation
  if (!puzzle.keyboardAccessible) {
    issues.push('Puzzle not accessible via keyboard');
  }
  
  // Check for color contrast
  if (puzzle.media && !puzzle.media.altText) {
    issues.push('Media missing alternative text');
  }
  
  // Check for audio descriptions
  if (puzzle.media?.type === 'video' && !puzzle.media.audioDescription) {
    issues.push('Video missing audio description');
  }
  
  return {
    isAccessible: issues.length === 0,
    issues
  };
};

export const adaptForAssistiveTechnology = (puzzle, technology) => {
  switch (technology) {
    case 'screen-reader':
      return {
        ...puzzle,
        enhancedAriaLabels: true,
        structuredContent: true,
        verbalInstructions: true
      };
    
    case 'keyboard-only':
      return {
        ...puzzle,
        tabNavigation: true,
        keyboardShortcuts: true,
        focusIndicators: true
      };
    
    case 'high-contrast':
      return {
        ...puzzle,
        highContrastMode: true,
        boldOutlines: true,
        enhancedColors: true
      };
    
    default:
      return puzzle;
  }
};