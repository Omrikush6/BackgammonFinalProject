import React, { useContext } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { UserContext } from '../../App';
import Login from '../Pages/Login/Login';
import Lobby from '../Pages/Lobby/Lobby';
import GameRoom from '../Pages/GameRoom/GameRoom';
import Profile from '../Pages/Profile/Profile';
import Contact from '../Pages/Contact/Contact';
import Join from '../Pages/Join/Join';
import './AnimatedRoutes.css';

const transitions = {
    default: {
      initial: { opacity: 0.5, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      transition: { type: 'spring', stiffness: 100, damping: 20, duration: 0.6 }
    },
    login: {
      initial: { opacity: 0, y: 100, rotate: -10 },
      animate: { opacity: 1, y: 0, rotate: 0 },
      exit: { opacity: 0, y: -100, rotate: 10 },
      transition: { type: 'spring', stiffness: 120, damping: 15, duration: 0.6 }
    },
    lobby: {
      initial: { opacity: 0, x: 200, scale: 0.8 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -200, scale: 0.8 },
      transition: { type: 'tween', ease: 'anticipate', duration: 0.7 }
    },
    gameRoom: {
      initial: { scale: 0.6, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.6, opacity: 0, rotate: -10 },
      transition: { type: 'spring', stiffness: 100, damping: 20, duration: 0.8 }
    },
    profile: {
      initial: { opacity: 0, rotateY: -90 },
      animate: { opacity: 1, rotateY: 0 },
      exit: { opacity: 0, rotateY: 90 },
      transition: { type: 'tween', ease: 'easeInOut', duration: 0.8 }
    },
    contact: {
      initial: { x: '100%', rotate: 10, opacity: 0 },
      animate: { x: 0, rotate: 0, opacity: 1 },
      exit: { x: '-100%', rotate: -10, opacity: 0 },
      transition: { type: 'tween', ease: 'backInOut', duration: 0.8 }
    },
    join: {
      initial: { opacity: 0, y: -50, scale: 0.8, rotateX: -15 },
      animate: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
      exit: { opacity: 0, y: 50, scale: 0.8, rotateX: 15 },
      transition: { type: 'spring', stiffness: 120, damping: 15, duration: 0.6 }
    }
  };
  

const getTransition = (path) => {
  switch (path) {
    case '/': return transitions.login;
    case '/lobby': return transitions.lobby;
    case '/game/:gameId': return transitions.gameRoom;
    case '/profile': return transitions.profile;
    case '/contact': return transitions.contact;
    case '/join': return transitions.join;
    default: return transitions.default;
  }
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isLoggedIn } = useContext(UserContext);
  const transition = getTransition(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={transition.initial}
        animate={transition.animate}
        exit={transition.exit}
        transition={transition.transition}
        className="animated-container"
      >
        <Routes location={location} key={location.pathname}>
          <Route 
            path="/" 
            element={
              <motion.div className="page-wrap">
                {isLoggedIn ? <Navigate to="/lobby" /> : <Login />}
              </motion.div>
            } 
          />
          <Route 
            path="/lobby" 
            element={
              <motion.div className="page-wrap">
                {isLoggedIn ? <Lobby /> : <Navigate to="/" />}
              </motion.div>
            } 
          />
          <Route 
            path="/game/:gameId" 
            element={
              <motion.div className="page-wrap">
                {isLoggedIn ? <GameRoom /> : <Navigate to="/" />}
              </motion.div>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <motion.div className="page-wrap">
                {isLoggedIn ? <Profile /> : <Navigate to="/" />}
              </motion.div>
            } 
          />
          <Route 
            path="/contact" 
            element={
              <motion.div className="page-wrap">
                <Contact />
              </motion.div>
            } 
          />
          <Route 
            path="/join" 
            element={
              <motion.div className="page-wrap">
                {isLoggedIn ? <Join /> : <Navigate to="/lobby" />}
              </motion.div>
            } 
          />
          <Route 
            path="*" 
            element={
              <Navigate to={isLoggedIn ? '/lobby' : '/'} />
            } 
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
