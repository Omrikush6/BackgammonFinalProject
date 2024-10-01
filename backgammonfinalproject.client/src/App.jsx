import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Lobby from './components/Lobby/Lobby';
import GameRoom from './components/GameRoom/GameRoom';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  const checkToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const tokenExpiration = payload.exp * 1000; // Convert to milliseconds
      return Date.now() <= tokenExpiration;
    }
    return false;
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(() => checkToken());

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoggedIn(checkToken());
    }, 600000); // Check token every 10 minutes

    return () => clearInterval(interval);
  }, [checkToken]);

  const handleLogout = async () => {
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
        localStorage.removeItem('token'); // Clear the token
        setIsLoggedIn(false); // Update the state
      }
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={isLoggedIn ? <Navigate to='/Lobby' /> : <Login />} />
        <Route path='/Lobby' element={isLoggedIn ? <Lobby onLogout={handleLogout} /> : <Navigate to='/' />} />
        <Route path='/GameRoom' element={isLoggedIn ? <GameRoom /> : <Navigate to='/' />} />
        <Route path='*' element={<Navigate to={isLoggedIn ? '/Lobby' : '/'} />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
