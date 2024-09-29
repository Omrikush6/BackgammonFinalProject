import React from 'react';
import './Board.css';

const Board = () => {
  // Initial setup for checkers
  const points = Array(24).fill(0);
  points[23] = 2; // 2 checkers on point 24
  points[12] = 5; // 5 checkers on point 13
  points[7] = 3;  // 3 checkers on point 8
  points[5] = 6;  // 6 checkers on point 6

  return (
    <div className="backgammon-board">
      {points.map((count, index) => (
        <div key={index} className={`triangle ${index < 12 ? 'top' : 'bottom'}`}>
          <div className="checkers-container">
            {Array.from({ length: count }).map((_, idx) => (
              <div key={idx} className={`checker ${index < 12 ? 'black' : 'red'}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Board;
