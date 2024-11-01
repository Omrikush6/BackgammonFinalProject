import React, { useState, useEffect, useCallback, createContext, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AnimatedRoutes from './components/AnimatedRoutes/AnimatedRoutes';
import Footer from './components/Footer/Footer';
import { useAuth } from './hooks/useAuth';
import './App.css';

export const UserContext = createContext(null);

function App() {
  const { 
    isInitialized,
    isLoggedIn,
    user,
    login,
    logout,
    refreshToken
  } = useAuth();

  const contextValue = {
    isLoggedIn,
    user,
    login,
    logout,
    refreshToken
  };

  if (!isInitialized) {     
    return (
        <div className="flex justify-center items-center h-screen w-full">
            Loading...
        </div>
    );
}

  return (
    <UserContext.Provider value={contextValue}>
      <BrowserRouter>
        <AnimatedRoutes />
        <Footer />
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;