import React, { useState } from 'react';
import GameBoard from '../GameBoard/GameBoard';
import DiceContainer from '../DiceContainer/DiceContainer';
import './Game.css';


const Game = ({ game, onGameStateChange, onRollDice , onMove }) => {
debugger;
  return (
    <div className="game">
      <GameBoard game={game} onMove={onMove} onGameStateChange={onGameStateChange} />
      <DiceContainer diceValues={game.diceValues} onRollDice={onRollDice} />
    </div>
  );
};

export default Game;