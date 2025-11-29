import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginUser, register as registerUser, getUserProfile } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await getUserProfile();
          setUser(response.data.user);
        } catch (err) {
          console.error('Failed to fetch user profile', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginUser({ email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      const { googleLogin } = await import('../services/api');
      const response = await googleLogin(googleToken);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Google login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
