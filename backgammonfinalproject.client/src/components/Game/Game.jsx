import React, { useState } from 'react';
import GameBoard from '../GameBoard/GameBoard';
import DiceContainer from '../DiceContainer/DiceContainer';
import './Game.css';


const Game = ({ game, onRollDice , onMove }) => {
  return (
    <div className="game">
      <GameBoard game={game} onMove={onMove} />
      <DiceContainer diceValues={game.diceValues} onRollDice={onRollDice} />
    </div>
  );
};

export default Game;