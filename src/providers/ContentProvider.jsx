import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ContentContext = createContext();

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
};

export const ContentProvider = ({ children }) => {
  const [customContent, setCustomContent] = useState({});
  const [activeTheme, setActiveTheme] = useState('murder-mystery');
  const [isLoading, setIsLoading] = useState(false);

  // Load custom content from Supabase on initialization
  useEffect(() => {
    loadCustomContent();
  }, []);

  const loadCustomContent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_content_er2024')
        .select('*');

      if (error) throw error;

      const contentByTheme = {};
      data?.forEach(item => {
        if (!contentByTheme[item.theme]) {
          contentByTheme[item.theme] = {};
        }
        contentByTheme[item.theme][item.stage_number] = {
          title: item.title,
          description: item.description,
          backstory: item.backstory
        };
      });

      setCustomContent(contentByTheme);
    } catch (error) {
      console.error('Failed to load custom content:', error);
      // Fallback to localStorage if Supabase fails
      const savedContent = localStorage.getItem('escaperoom_custom_content');
      if (savedContent) {
        try {
          setCustomContent(JSON.parse(savedContent));
        } catch (parseError) {
          console.error('Failed to parse localStorage content:', parseError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = async (theme, content) => {
    setCustomContent(prev => ({
      ...prev,
      [theme]: content
    }));

    // Save to localStorage as backup
    localStorage.setItem('escaperoom_custom_content', JSON.stringify({
      ...customContent,
      [theme]: content
    }));

    // Save to Supabase
    try {
      // Delete existing content for this theme
      await supabase
        .from('custom_content_er2024')
        .delete()
        .eq('theme', theme);

      // Insert new content
      const inserts = Object.entries(content).map(([stage, stageContent]) => ({
        theme,
        stage_number: parseInt(stage),
        title: stageContent.title,
        description: stageContent.description,
        backstory: stageContent.backstory,
        created_by: 'Admin'
      }));

      if (inserts.length > 0) {
        const { error } = await supabase
          .from('custom_content_er2024')
          .insert(inserts);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Failed to save content to Supabase:', error);
    }
  };

  const getContent = (theme, stage) => {
    // Return custom content if available, otherwise return default content
    const themeContent = customContent[theme];
    if (themeContent && themeContent[stage]) {
      return themeContent[stage];
    }
    return getDefaultContent(theme, stage);
  };

  const getAllContent = (theme) => {
    return customContent[theme] || getDefaultThemeContent(theme);
  };

  const resetContent = async (theme) => {
    setCustomContent(prev => {
      const newContent = { ...prev };
      delete newContent[theme];
      return newContent;
    });

    // Update localStorage
    const newContent = { ...customContent };
    delete newContent[theme];
    localStorage.setItem('escaperoom_custom_content', JSON.stringify(newContent));

    // Delete from Supabase
    try {
      await supabase
        .from('custom_content_er2024')
        .delete()
        .eq('theme', theme);
    } catch (error) {
      console.error('Failed to reset content in Supabase:', error);
    }
  };

  const resetAllContent = async () => {
    setCustomContent({});
    localStorage.removeItem('escaperoom_custom_content');

    // Delete all from Supabase
    try {
      await supabase
        .from('custom_content_er2024')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    } catch (error) {
      console.error('Failed to reset all content in Supabase:', error);
    }
  };

  const exportContent = (theme) => {
    const content = customContent[theme];
    if (content) {
      const dataStr = JSON.stringify(content, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `${theme}_content.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const importContent = async (theme, contentData) => {
    try {
      const parsedContent = typeof contentData === 'string' ? JSON.parse(contentData) : contentData;
      await updateContent(theme, parsedContent);
      return true;
    } catch (error) {
      console.error('Failed to import content:', error);
      return false;
    }
  };

  const hasCustomContent = (theme) => {
    return customContent[theme] && Object.keys(customContent[theme]).length > 0;
  };

  const value = {
    customContent,
    activeTheme,
    setActiveTheme,
    updateContent,
    getContent,
    getAllContent,
    resetContent,
    resetAllContent,
    exportContent,
    importContent,
    hasCustomContent,
    isLoading,
    loadCustomContent
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

const getDefaultContent = (theme, stage) => {
  const defaultContents = {
    'murder-mystery': {
      1: {
        title: "The Crime Scene",
        description: "A wealthy businessman has been found dead in his locked study. Examine the evidence to determine what happened.",
        backstory: "Lord Blackwood was discovered this morning by his butler, slumped over his desk. The door was locked from the inside, and no weapon was found."
      },
      2: {
        title: "The Suspect's Alibi",
        description: "You've identified the poison, but who had access? Examine the testimonies to find inconsistencies.",
        backstory: "Three people had access to Lord Blackwood's study that morning: his butler, his business partner, and his niece."
      },
      3: {
        title: "The Hidden Evidence",
        description: "Search Margaret's belongings for the murder weapon and additional evidence of premeditation.",
        backstory: "With Margaret identified as the killer, the police search her possessions for the source of the cyanide."
      },
      4: {
        title: "The Final Confrontation",
        description: "Present your case to Margaret and get her to confess to the murder.",
        backstory: "With all evidence gathered, it's time to confront Margaret with the proof of her guilt."
      },
      5: {
        title: "Justice Served",
        description: "With Margaret's confession obtained, determine the appropriate charges and sentence.",
        backstory: "Margaret has confessed to the murder. Now the legal system must determine her fate."
      },
      6: {
        title: "Case Closed",
        description: "Complete the final case report and close the investigation.",
        backstory: "The murder of Lord Blackwood has been solved. Margaret Reynolds will face trial for premeditated murder."
      }
    },
    'haunted-mansion': {
      1: {
        title: "The Restless Spirits",
        description: "Strange phenomena plague this old mansion. Investigate the supernatural occurrences to understand what the spirits want.",
        backstory: "The Grimwood family has lived in this mansion for generations, but recently, ghostly apparitions and unexplained events have driven them out."
      },
      2: {
        title: "The Family Secret",
        description: "You've learned the spirits seek vengeance, but for what crime? Uncover the dark family secret hidden for generations.",
        backstory: "The spirit belongs to Eleanor Grimwood, who died mysteriously 100 years ago. Her death was ruled a suicide, but she claims otherwise."
      },
      3: {
        title: "The Cursed Mirror",
        description: "Find the cursed mirror that shows the truth of past events and reveals Eleanor's final moments.",
        backstory: "Eleanor's spirit grows stronger. She leads you to an antique mirror that supposedly shows the truth of what happened."
      },
      4: {
        title: "The Séance",
        description: "Conduct a séance to communicate directly with Eleanor's spirit and get her full testimony.",
        backstory: "With the mirror's revelations, you attempt to contact Eleanor directly to get the complete story of her murder."
      },
      5: {
        title: "Breaking the Curse",
        description: "Find the hidden evidence that will expose Charles's crime and free Eleanor's spirit.",
        backstory: "Eleanor has revealed where Charles hid the evidence of his crime. Find it to break the curse on the mansion."
      },
      6: {
        title: "Eternal Rest",
        description: "With the truth revealed, help Eleanor's spirit find peace and end the haunting of Grimwood Manor.",
        backstory: "The evidence has been found and the truth exposed. Eleanor can finally rest in peace."
      }
    },
    'wizards-tower': {
      1: {
        title: "The Apprentice's Trial",
        description: "You are a new apprentice in the wizard's tower. Learn the basic principles of magic by studying the ancient artifacts.",
        backstory: "Master Aldric has left you alone in his tower with instructions to prove your magical aptitude by understanding the four elements."
      },
      2: {
        title: "The Potion Formula",
        description: "Now that you understand magical harmony, brew the Elixir of Truth by combining the right ingredients in the proper proportions.",
        backstory: "Master Aldric's notes mention a powerful truth potion, but the formula is encoded. You must decipher the alchemical symbols."
      },
      3: {
        title: "The Ancient Spell",
        description: "Decode an ancient spell scroll to unlock the next level of magical knowledge.",
        backstory: "A mysterious scroll has appeared on the tower's desk. The runes are ancient, but they seem to respond to your newfound understanding."
      },
      4: {
        title: "The Magical Duel",
        description: "Face Master Aldric's magical construct in a test of your growing power and knowledge.",
        backstory: "Master Aldric has returned and activated a magical guardian to test your progress. You must prove worthy of advanced training."
      },
      5: {
        title: "The Master's Test",
        description: "Master Aldric presents you with the final test to become a true wizard apprentice.",
        backstory: "Impressed by your progress, Master Aldric offers you the chance to prove yourself worthy of the tower's greatest secrets."
      },
      6: {
        title: "Master of Magic",
        description: "With all tests completed, receive Master Aldric's final blessing and become a true wizard.",
        backstory: "You have proven yourself worthy. Master Aldric is ready to grant you the title of wizard and the secrets of the tower."
      }
    }
  };

  return defaultContents[theme]?.[stage] || {
    title: `Stage ${stage}`,
    description: "Stage description not available.",
    backstory: ""
  };
};

const getDefaultThemeContent = (theme) => {
  const content = {};
  for (let i = 1; i <= 6; i++) {
    content[i] = getDefaultContent(theme, i);
  }
  return content;
};