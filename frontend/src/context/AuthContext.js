import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/profile`,
        { credentials: 'include' }
      );
      if (!res.ok) {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserId(null);
      } else {
        const data = await res.json();
        if (data.profileCompleted) {
          setIsLoggedIn(true);
          setUserRole(data.role);
          setUserId(data.userId);
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
          setUserId(null);
        }
      }
    } catch (err) {
      console.error('Session fetch failed:', err);
      setIsLoggedIn(false);
      setUserRole(null);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const refreshUser = () => {
    fetchSession();
  };

  const login = (id, role) => {
    setIsLoggedIn(true);
    setUserId(id);
    setUserRole(role);
    fetchSession();
  };

  const logout = async () => {
    try {
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`,
        { method: 'POST', credentials: 'include' }
      );
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserId(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userId, userRole, login, logout, loading, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
