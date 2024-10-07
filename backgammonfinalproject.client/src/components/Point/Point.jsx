import React from 'react';
import Checker from '../Checker/Checker';
import './Point.css';

const Point = ({ index, checkers, isTop }) => {
const isEven = index % 2 === 0;
const color = isEven ? 'dark' : 'light';

const checkerArray = Array.isArray(checkers) ? checkers : [];
return (
    <div className={`point ${color} ${isTop ? 'top' : 'bottom'}`}>
      <div className="triangle"></div>
      <div className="checkers">
        {checkers.checkers > 0 && Array.from({ length: Math.min(checkers.checkers, 5) }, (_, i) => (
          <Checker key={i} color={checkers.player === 1 ? 'white' : 'black'} />
        ))}
        {checkers.checkers > 5 && (
          <div className="checker-count">{checkers.checkers}</div>
        )}
      </div>
    </div>
  );
};

export default Point;