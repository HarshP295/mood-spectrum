import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
export interface MoodEntry {
  id: string;
  mood: string;
  intensity: number;
  note: string;
  date: string;
  timestamp: number;
  tags: string[];
}

export interface MoodStats {
  averageMood: number;
  dominantMood: string;
  entriesThisWeek: number;
  streakDays: number;
  moodTrends: Array<{
    date: string;
    mood: string;
    intensity: number;
  }>;
}

interface MoodState {
  entries: MoodEntry[];
  currentMood: string;
  stats: MoodStats;
  loading: boolean;
  error: string | null;
}

type MoodAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_ENTRY'; payload: MoodEntry }
  | { type: 'UPDATE_ENTRY'; payload: { id: string; updates: Partial<MoodEntry> } }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'SET_CURRENT_MOOD'; payload: string }
  | { type: 'LOAD_ENTRIES'; payload: MoodEntry[] }
  | { type: 'UPDATE_STATS'; payload: MoodStats }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: MoodState = {
  entries: [],
  currentMood: '',
  stats: {
    averageMood: 0,
    dominantMood: 'neutral',
    entriesThisWeek: 0,
    streakDays: 0,
    moodTrends: [],
  },
  loading: false,
  error: null,
};

// Helper functions
const calculateStats = (entries: MoodEntry[]): MoodStats => {
  if (entries.length === 0) return initialState.stats;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recentEntries = entries.filter(entry => 
    new Date(entry.timestamp) >= weekAgo
  );

  const averageMood = entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length;
  
  const moodCounts = entries.reduce((counts, entry) => {
    counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  const dominantMood = Object.entries(moodCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

  // Calculate streak (simplified)
  const streakDays = Math.min(entries.length, 30); // Mock calculation

  const moodTrends = entries
    .slice(-7)
    .map(entry => ({
      date: new Date(entry.timestamp).toLocaleDateString(),
      mood: entry.mood,
      intensity: entry.intensity,
    }));

  return {
    averageMood: Math.round(averageMood * 10) / 10,
    dominantMood,
    entriesThisWeek: recentEntries.length,
    streakDays,
    moodTrends,
  };
};

// Reducer
const moodReducer = (state: MoodState, action: MoodAction): MoodState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'ADD_ENTRY': {
      const newEntries = [action.payload, ...state.entries];
      return {
        ...state,
        entries: newEntries,
        stats: calculateStats(newEntries),
        error: null,
      };
    }
    
    case 'UPDATE_ENTRY': {
      const newEntries = state.entries.map(entry =>
        entry.id === action.payload.id
          ? { ...entry, ...action.payload.updates }
          : entry
      );
      return {
        ...state,
        entries: newEntries,
        stats: calculateStats(newEntries),
      };
    }
    
    case 'DELETE_ENTRY': {
      const newEntries = state.entries.filter(entry => entry.id !== action.payload);
      return {
        ...state,
        entries: newEntries,
        stats: calculateStats(newEntries),
      };
    }
    
    case 'SET_CURRENT_MOOD':
      return { ...state, currentMood: action.payload };
    
    case 'LOAD_ENTRIES':
      return {
        ...state,
        entries: action.payload,
        stats: calculateStats(action.payload),
        loading: false,
      };
    
    case 'UPDATE_STATS':
      return { ...state, stats: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Context
interface MoodContextType {
  state: MoodState;
  addEntry: (mood: string, intensity: number, note: string, tags?: string[]) => Promise<void>;
  updateEntry: (id: string, updates: Partial<MoodEntry>) => void;
  deleteEntry: (id: string) => void;
  setCurrentMood: (mood: string) => void;
  clearError: () => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

// Provider component
export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(moodReducer, initialState);

  // Load entries from localStorage on mount
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('mindflow_mood_entries');
      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        dispatch({ type: 'LOAD_ENTRIES', payload: entries });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load mood entries' });
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    if (state.entries.length > 0) {
      localStorage.setItem('mindflow_mood_entries', JSON.stringify(state.entries));
    }
  }, [state.entries]);

  const addEntry = async (mood: string, intensity: number, note: string, tags: string[] = []) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const entry: MoodEntry = {
        id: 'entry_' + Date.now(),
        mood,
        intensity,
        note,
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        timestamp: Date.now(),
        tags,
      };
      
      dispatch({ type: 'ADD_ENTRY', payload: entry });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save mood entry' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateEntry = (id: string, updates: Partial<MoodEntry>) => {
    dispatch({ type: 'UPDATE_ENTRY', payload: { id, updates } });
  };

  const deleteEntry = (id: string) => {
    dispatch({ type: 'DELETE_ENTRY', payload: id });
  };

  const setCurrentMood = (mood: string) => {
    dispatch({ type: 'SET_CURRENT_MOOD', payload: mood });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <MoodContext.Provider value={{
      state,
      addEntry,
      updateEntry,
      deleteEntry,
      setCurrentMood,
      clearError,
    }}>
      {children}
    </MoodContext.Provider>
  );
};

// Hook
export const useMood = () => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};