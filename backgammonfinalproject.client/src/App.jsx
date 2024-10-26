import React, { useState, useEffect, useCallback, createContext } from 'react';
import { BrowserRouter} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AnimatedRoutes from './components/AnimatedRoutes/AnimatedRoutes';
import Footer from './components/Footer/Footer';
import './App.css';

export const UserContext = createContext(null);

function App() {
  const checkToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = jwtDecode(token);
      const tokenExpiration = payload.exp * 1000;
      return Date.now() <= tokenExpiration;
    }
    return false;
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('https://localhost:7027/api/Auth/refresh', {
        method: 'POST',
        credentials: 'include', // This is important for including cookies
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.Token);
        const decodedToken = jwtDecode(data.Token);
        setUser({
          id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
          name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        });
        setIsLoggedIn(true);
        return true;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    }
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(() => checkToken());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const isValidToken = checkToken(); // Check if the token is valid

        setUser({
          id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
          name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        });

        // Set isLoggedIn based on token validity
        setIsLoggedIn(isValidToken);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false); 
    }
  }, [checkToken]);

  useEffect(() => {
    const interval = setInterval(async() => { 
      if (!checkToken()) {
        const refreshed = await refreshToken();
        if (refreshed) {
        setUser(null);
        setIsLoggedIn(false);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [checkToken, refreshToken]);

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('https://localhost:7027/api/Auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    const decodedToken = jwtDecode(token);
    setUser({
      id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
    });
    setIsLoggedIn(true);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, isLoggedIn }}>
    <BrowserRouter>
      <AnimatedRoutes />
      <Footer />
    </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
