import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const navigate = useNavigate();

  const login = (newToken) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
    navigate('/admin/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    navigate('/admin/login');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
