import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    if (pb.authStore.isValid && pb.authStore.model) {
      setCurrentUser(pb.authStore.model);
      setIsAuthenticated(true);
    }
    setInitialLoading(false);

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
      setIsAuthenticated(!!model);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      setIsAuthenticated(true);
      return { success: true, user: authData.record };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  };

  const signup = async (email, password, name) => {
    try {
      const userData = {
        email,
        password,
        passwordConfirm: password,
        name,
      };
      
      const record = await pb.collection('users').create(userData);
      
      // Auto-login after signup
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      setIsAuthenticated(true);
      
      return { success: true, user: authData.record };
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  };

  const loginWithOAuth = (provider) => {
    // CRITICAL: Use .then() pattern to avoid Safari popup blocking
    pb.collection('users').authWithOAuth2({ provider })
      .then((authData) => {
        setCurrentUser(authData.record);
        setIsAuthenticated(true);
        return { success: true, user: authData.record };
      })
      .catch((error) => {
        console.error('OAuth login error:', error);
        throw new Error(error.message || 'OAuth login failed.');
      });
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    initialLoading,
    login,
    signup,
    loginWithOAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};