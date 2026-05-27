import { createContext, useEffect, useState } from 'react';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });
  const [loading, setLoading] = useState(true);

  // Apply dark mode class to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // On mount, verify token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    const loadUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser({ id: data._id, name: data.name, email: data.email });
      } catch (e) {
        console.warn('Invalid token');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser({ id: data.user.id, name: data.user.name, email: data.user.email });
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser({ id: data.user.id, name: data.user.name, email: data.user.email });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, darkMode, toggleTheme, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
