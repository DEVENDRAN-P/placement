import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Student, College, Recruiter } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: User | null;
  profileData: Student | College | Recruiter | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<boolean>;
  updateProfile: (profileData: any) => void;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; profileData: any; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  profileData: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        profileData: action.payload.profileData,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        profileData: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        profileData: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profileData: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser() as any;
          if (response.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: response.data.user,
                profileData: response.data.profileData,
                token,
              },
            });
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.login({ email, password }) as any;
      
      if (response.success) {
        const { user, profileData, token } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, profileData, token },
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const register = async (userData: any) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.register(userData) as any;
      
      if (response.success) {
        // Registration successful, but user needs to verify email
        dispatch({ type: 'LOGIN_FAILURE' });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      const response = await authAPI.verifyEmail(token) as any;
      if (response.success) {
        // Email verified successfully
        return true;
      }
      throw new Error(response.message || 'Email verification failed');
    } catch (error: any) {
      throw error;
    }
  };

  const updateProfile = (profileData: any) => {
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: profileData,
    });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    verifyEmail,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
