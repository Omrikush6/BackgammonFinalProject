import React, { useState } from 'react';
import GameBoard from '../GameBoard/GameBoard';
import DiceContainer from '../DiceContainer/DiceContainer';
import './Game.css';

const Game = ({ game, onGameStateChange }) => {
  const [diceValues, setDiceValues] = useState([0, 0]);
  


  const rollDice = () => {
    const newDiceValues = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    setDiceValues(newDiceValues);
    // Update game state with new dice values
    onGameStateChange({ ...game, diceValues: newDiceValues });
  };

  return (
    <div className="game">
      <GameBoard game={game} />
      <DiceContainer diceValues={diceValues} onRollDice={rollDice} />
    </div>
  );
};

export default Game;