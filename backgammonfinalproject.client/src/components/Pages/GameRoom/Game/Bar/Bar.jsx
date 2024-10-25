import React from 'react';
import Checker from '../GameBoard/Checker/Checker';
import './Bar.css';

const Bar = ({ whitePieces, blackPieces, onBarClick, selectedBar }) => {
  return (
    <div className="bar">
      <div 
        className={`bar-section top ${selectedBar === 'barBlack' ? 'selected' : ''}`}
        onClick={() => onBarClick('black')}
      >
        {Array.from({ length: Math.min(blackPieces, 5) }, (_, i) => (
          <Checker key={i} color="black" />
        ))}
        {blackPieces > 5 && <div className="checker-count">{blackPieces}</div>}
      </div>
      <div 
        className={`bar-section bottom ${selectedBar === 'barWhite' ? 'selected' : ''}`}
        onClick={() => onBarClick('white')}
      >
        {Array.from({ length: Math.min(whitePieces, 5) }, (_, i) => (
          <Checker key={i} color="white" />
        ))}
        {whitePieces > 5 && <div className="checker-count">{whitePieces}</div>}
      </div>
    </div>
  );
};

export default Bar;