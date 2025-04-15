import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skipFetch, setSkipFetch] = useState(false);


  useEffect(() => {
    if (skipFetch) return;
  
    const fetchSession = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile`, {
          credentials: "include"
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched user profile role from /profile:", data.role);
  
          setIsLoggedIn(true);
          setUserRole(data.role ?? null);
          setUserId(data.userId ?? data.id ?? null);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSession();
  }, [skipFetch]);

  useEffect(() => {
    if (skipFetch) {
      const timeout = setTimeout(() => setSkipFetch(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [skipFetch]);
  

  const login = (id, role) => {
    setIsLoggedIn(true);
    setUserId(id);
    setUserRole(role);
    setSkipFetch(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setUserRole(null);
  };

  return (  
    <AuthContext.Provider value={{ isLoggedIn, userId, userRole, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
