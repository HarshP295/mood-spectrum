import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'peer' | 'moderator';
  timestamp: number;
  edited?: boolean;
  reactions?: Record<string, number>;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isActive: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  rooms: ChatRoom[];
  currentRoom: string;
  onlineUsers: number;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'LOAD_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_ROOMS'; payload: ChatRoom[] }
  | { type: 'SET_CURRENT_ROOM'; payload: string }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ONLINE_USERS'; payload: number }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: ChatState = {
  messages: [],
  rooms: [
    { id: 'general', name: 'General Support', description: 'Open discussion for all topics', memberCount: 42, isActive: true },
    { id: 'anxiety', name: 'Anxiety Support', description: 'Share and support anxiety experiences', memberCount: 28, isActive: true },
    { id: 'depression', name: 'Depression Support', description: 'Depression support and coping strategies', memberCount: 35, isActive: true },
    { id: 'mindfulness', name: 'Mindfulness', description: 'Meditation and mindfulness practices', memberCount: 21, isActive: true },
  ],
  currentRoom: 'general',
  onlineUsers: 0,
  isConnected: false,
  loading: false,
  error: null,
};

// Mock responses for peer chat simulation
const mockResponses = [
  "Thanks for sharing that. You're not alone in feeling this way.",
  "I've been through something similar. It does get better with time.",
  "Have you tried the breathing exercises in the mindfulness section?",
  "Sending you positive thoughts. Take care of yourself today.",
  "That's a great insight. Thanks for helping me see things differently.",
  "I find journaling really helps when I'm feeling overwhelmed.",
  "Virtual hug! Remember that it's okay to have difficult days.",
  "Your courage in sharing this is inspiring. Thank you.",
];

// Reducer
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        ),
      };
    
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload),
      };
    
    case 'LOAD_MESSAGES':
      return {
        ...state,
        messages: action.payload,
        loading: false,
      };
    
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    
    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Context
interface ChatContextType {
  state: ChatState;
  sendMessage: (content: string) => Promise<void>;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (id: string) => void;
  joinRoom: (roomId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Simulate connection and load initial data
  useEffect(() => {
    const connect = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Load stored messages
        const storedMessages = localStorage.getItem('mindflow_chat_messages');
        if (storedMessages) {
          const messages = JSON.parse(storedMessages);
          dispatch({ type: 'LOAD_MESSAGES', payload: messages });
        }
        
        dispatch({ type: 'SET_CONNECTED', payload: true });
        dispatch({ type: 'SET_ONLINE_USERS', payload: Math.floor(Math.random() * 20) + 10 });
        
        // Simulate online user count updates
        const interval = setInterval(() => {
          dispatch({ type: 'SET_ONLINE_USERS', payload: Math.floor(Math.random() * 20) + 10 });
        }, 30000);
        
        return () => clearInterval(interval);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to chat' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    connect();
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (state.messages.length > 0) {
      localStorage.setItem('mindflow_chat_messages', JSON.stringify(state.messages));
    }
  }, [state.messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    try {
      const userMessage: ChatMessage = {
        id: 'msg_' + Date.now(),
        content: content.trim(),
        sender: 'user',
        timestamp: Date.now(),
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
      
      // Simulate peer response with delay
      setTimeout(() => {
        const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        const peerMessage: ChatMessage = {
          id: 'msg_' + (Date.now() + 1),
          content: response,
          sender: 'peer',
          timestamp: Date.now() + 1000,
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: peerMessage });
      }, 2000 + Math.random() * 3000);
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
    }
  };

  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
  };

  const deleteMessage = (id: string) => {
    dispatch({ type: 'DELETE_MESSAGE', payload: id });
  };

  const joinRoom = (roomId: string) => {
    dispatch({ type: 'SET_CURRENT_ROOM', payload: roomId });
    // In a real app, this would load room-specific messages
  };

  const addReaction = (messageId: string, emoji: string) => {
    const message = state.messages.find(msg => msg.id === messageId);
    if (message) {
      const reactions = { ...message.reactions };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      updateMessage(messageId, { reactions });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <ChatContext.Provider value={{
      state,
      sendMessage,
      updateMessage,
      deleteMessage,
      joinRoom,
      addReaction,
      clearError,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};