import React, { useRef, useEffect } from "react";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import "./DrawOffer.css";

const DrawOffer = ({ onAccept, onDecline }) => {
  const controls = useAnimation();
  const popupRef = useRef(null);
  const containerRef = useRef(null);


  // Use motion values for smoother animations
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (popupRef.current) {
      // Get the popup and container dimensions
      const popupRect = popupRef.current.getBoundingClientRect();
      const container = popupRef.current.parentElement;
      const containerRect = container.getBoundingClientRect();

      // Calculate initial centered position relative to the container
      const startX = (containerRect.width + popupRect.width) / 2;
      const startY = (containerRect.height + popupRect.height) / 2;
      
      x.set(startX);
      y.set(startY);
    }
  }, [x, y]);

  const handleDragEnd = (event, info) => {
    const BOUNCE_FACTOR = 0.8;
    const FRICTION = 0.98;

    let velocityX = info.velocity.x * BOUNCE_FACTOR;
    let velocityY = info.velocity.y * BOUNCE_FACTOR;

    const animateBounce = () => {
      const container = popupRef.current.parentElement;
      const containerRect = container.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();

      let newPosX = x.get() + velocityX / 60;
      let newPosY = y.get() + velocityY / 60;

      const minX = 0;
      const maxX = containerRect.width - popupRect.width;
      const minY = 0;
      const maxY = containerRect.height - popupRect.height;

      // Handle horizontal bounce
      if (newPosX < minX) {
        newPosX = minX;
        velocityX = Math.abs(velocityX) * BOUNCE_FACTOR;
      } else if (newPosX > maxX) {
        newPosX = maxX;
        velocityX = -Math.abs(velocityX) * BOUNCE_FACTOR;
      }

      // Handle vertical bounce
      if (newPosY < minY) {
        newPosY = minY;
        velocityY = Math.abs(velocityY) * BOUNCE_FACTOR;
      } else if (newPosY > maxY) {
        newPosY = maxY;
        velocityY = -Math.abs(velocityY) * BOUNCE_FACTOR;
      }

      // Apply friction
      velocityX *= FRICTION;
      velocityY *= FRICTION;

      // Update motion values for position
      x.set(newPosX);
      y.set(newPosY);

      // Continue the animation loop if movement is above a certain threshold
      if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
        requestAnimationFrame(animateBounce);
      }
    };

    requestAnimationFrame(animateBounce);
  };

  return (
    <motion.div
      ref={popupRef}
      className="draw-offer-popup"
      style={{ x, y }}
      drag
      dragMomentum={false}
      onDragStart={() => (document.body.style.cursor = "grabbing")}
      onDragEnd={handleDragEnd}
    >
      <div className="draw-offer-content">
        <h3>Your opponent has offered a draw. Do you accept?</h3>
        <div className="draw-offer-buttons">
          <motion.button
            className="accept-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAccept}
          >
            Accept
          </motion.button>
          <motion.button
            className="decline-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDecline}
          >
            Decline
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default DrawOffer;
