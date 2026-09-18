import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('placement_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('placement_token') || null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    if (token) {
      try {
        const res = await API.get('/auth/me');
        setUser(res.data.data.user);
        localStorage.setItem('placement_user', JSON.stringify(res.data.data.user));
        return res.data.data.user;
      } catch (err) {
        console.error('Failed to verify session token:', err);
        logout();
      }
    }
  };

  useEffect(() => {
    fetchMe().finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data;

    setToken(newToken);
    setUser(userData);
    localStorage.setItem('placement_token', newToken);
    localStorage.setItem('placement_user', JSON.stringify(userData));

    return userData;
  };

  const register = async (formData) => {
    const res = await API.post('/auth/register', formData);
    const { token: newToken, user: userData } = res.data.data;

    setToken(newToken);
    setUser(userData);
    localStorage.setItem('placement_token', newToken);
    localStorage.setItem('placement_user', JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('placement_token');
    localStorage.removeItem('placement_user');
  };

  const updateUserProfileState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('placement_user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    return await fetchMe();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserProfileState, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
