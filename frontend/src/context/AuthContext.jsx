import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Base URL for API calls
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Set Axios default authorization header on state change
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Sync profile details on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get(`${API_URL}/auth/profile`);
        setUser(res.data.user);
      } catch (err) {
        console.error('Failed to sync profile', err);
        // Clear expired or broken token
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const register = async (name, email, password, registerNo, deptYear) => {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
      registerNo,
      deptYear,
    });
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login` /* wait, URL fallback check */, { email, password });
    // Note: fallback mapping below will safely target correctly
    return res.data;
  };

  // Safe wrapper mapping for all login requests
  const loginUserApi = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return res.data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const res = await axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword });
    return res.data;
  };

  const updateProfile = async (profileData) => {
    const res = await axios.put(`${API_URL}/auth/profile`, profileData);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        verifyOtp,
        login: loginUserApi,
        forgotPassword,
        resetPassword,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
