import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    reminderTime: string;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    
    case 'LOGIN_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Context
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Simulate checking for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = localStorage.getItem('mindflow_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user data
      const user: User = {
        id: 'user_' + Date.now(),
        email,
        name: email.split('@')[0],
        avatar: '',
        createdAt: new Date().toISOString(),
        preferences: {
          theme: 'system',
          notifications: true,
          reminderTime: '09:00',
        },
      };

      // Store in localStorage
      localStorage.setItem('mindflow_user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: 'Login failed. Please try again.' });
    }
  };

  const logout = () => {
    localStorage.removeItem('mindflow_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
    
    // Update localStorage
    if (state.user) {
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem('mindflow_user', JSON.stringify(updatedUser));
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      state,
      login,
      logout,
      updateUser,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};