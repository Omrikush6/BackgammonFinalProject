import React from 'react';
import Checker from '../Checker/Checker';
import './Point.css';

const Point = ({ index, checkers, isTop, isSelected, onClick }) => {
const isEven = index % 2 === 0;
const color = isEven ? 'dark' : 'light';
return (
  <div 
  className={`point ${color} ${isTop ? 'top' : 'bottom'} 
  ${isSelected ? 'selected' : ''}`}
  onClick={onClick}>
      <div className="triangle"/>
      <div className="checkers">
        {checkers.checkers > 0 && Array.from({ length: Math.min(checkers.checkers, 5) }, (_, i) => (
          <Checker key={i} color={checkers.playerColor} />
        ))}
        {checkers.checkers > 5 && (
          <div className="checker-count">{checkers.checkers}</div>
        )}
      </div>
    </div>
  );
};

export default Point;