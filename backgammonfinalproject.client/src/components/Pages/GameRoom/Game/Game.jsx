import React from 'react';
import GameBoard from './GameBoard/GameBoard';
import DiceContainer from './DiceContainer/DiceContainer';
import './Game.css';


const Game = ({ game, onRollDice , onMove }) => {
  return (
    <div className="game">
      <GameBoard game={game} onMove={onMove} />
      <DiceContainer diceValues={game.diceValues} onRollDice={onRollDice} isRolled={game.isRolled} />
    </div>
  );
};

export default Game;