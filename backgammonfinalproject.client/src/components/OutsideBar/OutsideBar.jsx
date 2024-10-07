import React from 'react';
import Checker from '../Checker/Checker';
import './OutsideBar.css';

const OutsideBar = ({ player, checkers }) => {
  return (
    <div className={`outside-bar ${player}`}>
      {Array(checkers).fill().map((_, i) => (
        <Checker key={i} color={player} />
      ))}
    </div>
  );
};

export default OutsideBar;