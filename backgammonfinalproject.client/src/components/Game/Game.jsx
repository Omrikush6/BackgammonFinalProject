import React, { useState } from 'react';
import GameBoard from '../GameBoard/GameBoard';
import DiceContainer from '../DiceContainer/DiceContainer';
import './Game.css';


const Game = ({ game,onStartGame, onRollDice , onMove }) => {
  return (
    <div className="game">
      <GameBoard game={game} onMove={onMove} />
      <DiceContainer diceValues={game.diceValues} onRollDice={onRollDice} />
      {game.gameStatus == '1' && (
        <button className='start-game' onClick={onStartGame}>Start Game</button>
      )}
    </div>
  );
};

export default Game;