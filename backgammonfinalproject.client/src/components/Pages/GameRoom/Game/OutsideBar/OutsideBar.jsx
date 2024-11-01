import React from 'react';
import Checker from '../GameBoard/Checker/Checker';
import './OutsideBar.css';

const OutsideBar = ({ player, checkers, onClick }) => {
  return (
    <div className={`outside-bar ${player}`} onClick={onClick}>
      <div className="checkers-container">
        {Array(checkers).fill().map((_, i) => (
          <Checker key={i} color={player} />
        ))}
      </div>
      {checkers > 5 && (
        <div className="checker-count">
          {checkers}
        </div>
      )}
    </div>
  );
};

export default OutsideBar;