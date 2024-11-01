import React from 'react';
import './Die.css';

const Die = ({ value, isRolling, index }) => {
  return (
    <div 
      className={`die ${isRolling ? 'rolling' : ''} ${index === 1 ? 'delay' : ''}`} 
      data-value={value}
    >
      {[1, 2, 3, 4, 5, 6].map((faceValue) => (
        <div key={faceValue} className={`die-face die-${faceValue}`}>
          {Array.from({ length: faceValue }, (_, index) => (
            <div key={index} className={`dot dot-${index + 1}`} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Die;