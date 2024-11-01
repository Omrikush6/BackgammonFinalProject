import React from 'react';
import { useState} from 'react';
import Die from './Die/Die'
import './DiceContainer.css';

const DiceContainer = ({ diceValues, onRollDice, isRolled }) => {
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    if (!isRolling && !isRolled) {
      setIsRolling(true);
      onRollDice();
      // Match timeout with animation duration
      setTimeout(() => setIsRolling(false), 2000);
    }
  else {
    onRollDice();
  }
  };


  return (
    <div className="dice-container">
      <div className="dice-area">
        <div className="dice-animation-container">
          {
          diceValues.map((value, index) => (
            value > 0 && (
              <Die 
                key={index}
                value={value}
                isRolling={isRolling}
                index = {index}
              />
            )
          ))}
        </div>
      </div>

      <div className="roll-button-container">
        <button 
          className="roll-button" 
          onClick={handleRoll}
          disabled={isRolling}
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </button>
      </div>
    </div>
  );
};

export default DiceContainer;