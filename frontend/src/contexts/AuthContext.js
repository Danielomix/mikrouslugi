import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get('authToken');
    
    if (token) {
      try {
        api.setAuthToken(token);
        const response = await api.verifyToken();
        setUser(response.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    }
    
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      const { token, user } = response;
      
      Cookies.set('authToken', token, { expires: 1 }); // 1 day
      api.setAuthToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.register(name, email, password);
      const { token, user } = response;
      
      Cookies.set('authToken', token, { expires: 1 });
      api.setAuthToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    Cookies.remove('authToken');
    api.removeAuthToken();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}