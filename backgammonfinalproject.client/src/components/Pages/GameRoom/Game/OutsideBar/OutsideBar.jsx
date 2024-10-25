import React from 'react';
import Checker from '../GameBoard/Checker/Checker';
import './OutsideBar.css';

const OutsideBar = ({ player, checkers , onClick }) => {
  return (
    <div className={`outside-bar ${player}`} onClick={onClick}>
      {Array(checkers).fill().map((_, i) => (
        <Checker key={i} color={player} />
      ))}
      
      
    </div>
  );
};

export default OutsideBar;