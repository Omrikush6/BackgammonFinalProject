import React from 'react';
import './DiceContainer.css';

const DiceContainer = ({ diceValues, onRollDice }) => {
  return (
    <div className="dice-container">
      <div className="dice">{diceValues[0]}</div>
      <div className="dice">{diceValues[1]}</div>
      <button onClick={onRollDice}>Roll Dice</button>
    </div>
  );
};

export default DiceContainer;