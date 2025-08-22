import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    push: boolean;
    email: boolean;
    reminders: boolean;
    dailyTips: boolean;
  };
  privacy: {
    analyticsConsent: boolean;
    dataSharing: boolean;
  };
}

interface AppState {
  notifications: AppNotification[];
  settings: AppSettings;
  isOnline: boolean;
  lastSync: number | null;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    push: true,
    email: true,
    reminders: true,
    dailyTips: true,
  },
  privacy: {
    analyticsConsent: false,
    dataSharing: false,
  },
};

const initialState: AppState = {
  notifications: [],
  settings: defaultSettings,
  isOnline: navigator.onLine,
  lastSync: null,
  loading: false,
  error: null,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 10), // Keep only latest 10
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  syncData: () => Promise<void>;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('mindflow_settings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('mindflow_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-remove notifications after their duration
  useEffect(() => {
    const timers = state.notifications
      .filter(n => n.duration && n.duration > 0)
      .map(notification => {
        return setTimeout(() => {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
        }, notification.duration);
      });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [state.notifications]);

  const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const fullNotification: AppNotification = {
      ...notification,
      id: 'notif_' + Date.now(),
      timestamp: Date.now(),
      duration: notification.duration || 5000,
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: fullNotification });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const syncData = async () => {
    if (!state.isOnline) {
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: 'You are currently offline. Please check your connection.',
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      dispatch({ type: 'SET_LAST_SYNC', payload: Date.now() });
      
      addNotification({
        type: 'success',
        title: 'Sync Complete',
        message: 'Your data has been synchronized successfully.',
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Sync failed. Please try again.' });
      
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: 'Unable to synchronize your data. Please try again later.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AppContext.Provider value={{
      state,
      addNotification,
      removeNotification,
      clearNotifications,
      updateSettings,
      syncData,
      clearError,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};