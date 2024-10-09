import React from 'react';
import Checker from '../Checker/Checker';
import './Bar.css';

const Bar = ({ whitePieces, blackPieces }) => {
  // Ensure at least 1 checker is shown for each color
  debugger
  return (
    <div className="bar">
      <div className="bar-section top">
        {Array.from({ length: Math.min(blackPieces, 5) }, (_, i) => (
          <Checker key={i} color="black" />
        ))}
        {blackPieces > 5 && <div className="checker-count">{blackPieces}</div>}
      </div>
      <div className="bar-section bottom">
        {Array.from({ length: Math.min(whitePieces, 5) }, (_, i) => (
          <Checker key={i} color="white" />
        ))}
        {whitePieces > 5 && <div className="checker-count">{whitePieces}</div>}
      </div>
    </div>
  );
};

export default Bar;