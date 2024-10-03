import React, { useState, useEffect, useCallback, createContext } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login/Login';
import Lobby from './components/Lobby/Lobby';
import GameRoom from './components/GameRoom/GameRoom';
import Footer from './components/Footer/Footer';
import Contact from './components/Contact/Contact'
import './App.css';

export const UserContext = createContext(null);

function App() {

  const checkToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const tokenExpiration = payload.exp * 1000;
      return Date.now() <= tokenExpiration;
    }
    return false;
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(() => checkToken());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({
          id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
          name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
        });
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const tokenValid = checkToken();
      setIsLoggedIn(tokenValid);
      if (!tokenValid) {
        setUser(null);
      }
    }, 600000);

    return () => clearInterval(interval);
  }, [checkToken]);

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
      <Routes>
        <Route path='/' element={isLoggedIn ? <Navigate to='/Lobby' /> : <Login />} />
        <Route path='/lobby' element={isLoggedIn ? <Lobby onLogout={logout} /> : <Navigate to='/' />} />
        <Route path='/game/:gameId' element={isLoggedIn ? <GameRoom /> : <Navigate to='/' />} />
        <Route path="/contact" element={<Contact />} />
        <Route path='*' element={<Navigate to={isLoggedIn ? '/Lobby' : '/'} />} />
      </Routes>
      <Footer />
    </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
