import React, { useContext , useMemo  } from 'react';
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

const AnimatedRoutes = () => {
    const location = useLocation();
    const { isLoggedIn, isInitialized } = useContext(UserContext);
  
    // Memoize transitions to prevent unnecessary re-renders
    const transitions = useMemo(() => ({
      default: {
        initial: { opacity: 0.5, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
        transition: { type: 'spring', stiffness: 100, damping: 20, duration: 0.6 },
        drag: false
      },
      login: {
        initial: { opacity: 0, y: 100, rotate: -10 },
        animate: { opacity: 1, y: 0, rotate: 0 },
        exit: { opacity: 0, y: -100, rotate: 10 },
        transition: { type: 'spring', stiffness: 120, damping: 15, duration: 0.6 },
        drag: true,
        dragConstraints: { top: -50, left: -50, right: 50, bottom: 50 },
        dragElastic: 0.7,
        whileDrag: { scale: 1.02, boxShadow: "0px 10px 25px rgba(0,0,0,0.3)" }
      },
      lobby: {
        initial: { opacity: 0, x: 200, scale: 0.8 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: -200, scale: 0.8 },
        transition: { type: 'tween', ease: 'anticipate', duration: 0.7 },
        drag: true,
        dragConstraints: { top: -50, left: -50, right: 50, bottom: 50 },
        dragElastic: 0.5,
        whileDrag: { scale: 1.01, boxShadow: "0px 5px 15px rgba(0,0,0,0.2)" }
      },
      gameRoom: {
        initial: { scale: 0.6, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.6, opacity: 0, rotate: -10 },
        transition: { type: 'spring', stiffness: 100, damping: 20, duration: 0.8 },
        drag: false
      },
      profile: {
        initial: { opacity: 0, rotateY: -90 },
        animate: { opacity: 1, rotateY: 0 },
        exit: { opacity: 0, rotateY: 90 },
        transition: { type: 'tween', ease: 'easeInOut', duration: 0.8 },
        drag: true,
        dragConstraints: { top: -50, left: -50, right: 50, bottom: 50 },
        dragElastic: 0.5,
        whileDrag: { scale: 1.02, boxShadow: "0px 8px 20px rgba(0,0,0,0.25)" }
      },
      contact: {
        initial: { x: '100%', rotate: 10, opacity: 0 },
        animate: { x: 0, rotate: 0, opacity: 1 },
        exit: { x: '-100%', rotate: -10, opacity: 0 },
        transition: { type: 'tween', ease: 'backInOut', duration: 0.8 },
        drag: true,
        dragConstraints: { top: -50, left: -50, right: 50, bottom: 50 },
        dragElastic: 0.6,
        whileDrag: { scale: 1.015, boxShadow: "0px 6px 18px rgba(0,0,0,0.2)" }
      },
      join: {
        initial: { opacity: 0, y: -50, scale: 0.8, rotateX: -15 },
        animate: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
        exit: { opacity: 0, y: 50, scale: 0.8, rotateX: 15 },
        transition: { type: 'spring', stiffness: 120, damping: 15, duration: 0.6 },
        drag: true,
        dragConstraints: { top: -50, left: -50, right: 50, bottom: 50 },
        dragElastic: 0.6,
        whileDrag: { scale: 1.02, boxShadow: "0px 8px 20px rgba(0,0,0,0.25)" }
      }
    }), []);
  
    // Memoize transition selection
    const getTransition = useMemo(() => {
      const transitionMap = {
        '/': transitions.login,
        '/lobby': transitions.lobby,
        '/game/:gameId': transitions.gameRoom,
        '/profile': transitions.profile,
        '/contact': transitions.contact,
        '/join': transitions.join,
      };
      
      return (path) => transitionMap[path] || transitions.default;
    }, [transitions]);
  
    // Memoize DraggablePage component
    const DraggablePage = useMemo(() => ({ children, transition, className = "" }) => {
      const dragProps = transition.drag ? {
        drag: true,
        dragConstraints: transition.dragConstraints,
        dragElastic: transition.dragElastic,
        whileDrag: transition.whileDrag,
        dragMomentum: false,
        whileHover: { scale: 1.005 },
        onDragStart: () => {
          document.body.style.cursor = 'grabbing';
        },
        onDragEnd: () => {
          document.body.style.cursor = 'default';
        }
      } : {};
    
      return (
        <motion.div 
          className={`page-wrap ${className} ${transition.drag ? 'draggable' : ''}`}
          initial={transition.initial}
          animate={transition.animate}
          exit={transition.exit}
          transition={transition.transition}
          {...dragProps}
        >
          {children}
        </motion.div>
      );
    }, []);
  
    // Select transition based on current path
    const currentTransition = useMemo(() => 
      getTransition(location.pathname), 
      [getTransition, location.pathname]
    );
  
    // Render routes with memoized components and transitions
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/lobby" replace />
              ) : (
                <motion.div
                  key="login"
                  initial={transitions.login.initial}
                  animate={transitions.login.animate}
                  exit={transitions.login.exit}
                  transition={transitions.login.transition}
                  className="animated-container"
                >
                  <DraggablePage transition={transitions.login}>
                    <Login />
                  </DraggablePage>
                </motion.div>
              )
            }
          />
          <Route
            path="/lobby"
            element={
              isLoggedIn ? (
                <motion.div
                  key="lobby"
                  initial={transitions.lobby.initial}
                  animate={transitions.lobby.animate}
                  exit={transitions.lobby.exit}
                  transition={transitions.lobby.transition}
                  className="animated-container"
                >
                  <DraggablePage transition={transitions.lobby}>
                    <Lobby />
                  </DraggablePage>
                </motion.div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/game/:gameId"
            element={
              isLoggedIn ? (
                <motion.div
                  key="game"
                  initial={transitions.gameRoom.initial}
                  animate={transitions.gameRoom.animate}
                  exit={transitions.gameRoom.exit}
                  transition={transitions.gameRoom.transition}
                  className="animated-container"
                >
                  <DraggablePage transition={transitions.gameRoom}>
                    <GameRoom />
                  </DraggablePage>
                </motion.div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isLoggedIn ? (
                <motion.div
                  key="profile"
                  initial={transitions.profile.initial}
                  animate={transitions.profile.animate}
                  exit={transitions.profile.exit}
                  transition={transitions.profile.transition}
                  className="animated-container"
                >
                  <DraggablePage transition={transitions.profile}>
                    <Profile />
                  </DraggablePage>
                </motion.div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/contact"
            element={
              <motion.div
                key="contact"
                initial={transitions.contact.initial}
                animate={transitions.contact.animate}
                exit={transitions.contact.exit}
                transition={transitions.contact.transition}
                className="animated-container"
              >
                <DraggablePage transition={transitions.contact}>
                  <Contact />
                </DraggablePage>
              </motion.div>
            }
          />
          <Route
            path="/join"
            element={
              isLoggedIn ? (
                <motion.div
                  key="join"
                  initial={transitions.join.initial}
                  animate={transitions.join.animate}
                  exit={transitions.join.exit}
                  transition={transitions.join.transition}
                  className="animated-container"
                >
                  <DraggablePage transition={transitions.join}>
                    <Join />
                  </DraggablePage>
                </motion.div>
              ) : (
                <Navigate to="/lobby" replace />
              )
            }
          />
          <Route
            path="*"
            element={
              <motion.div
                key="404"
                initial={transitions.default.initial}
                animate={transitions.default.animate}
                exit={transitions.default.exit}
                transition={transitions.default.transition}
                className="animated-container"
              >
                <Navigate to={isLoggedIn ? '/lobby' : '/'} replace />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
    );
  };
  
export default AnimatedRoutes;