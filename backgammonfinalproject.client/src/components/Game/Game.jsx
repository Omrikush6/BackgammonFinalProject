import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameBoard from '../GameBoard/GameBoard';
import DiceContainer from '../DiceContainer/DiceContainer';
import './Game.css';


const Game = ({ game,onStartGame, onRollDice , onMove }) => {
  const navigate = useNavigate();
  return (
    <div className="game">
      <GameBoard game={game} onMove={onMove} />
      <DiceContainer diceValues={game.diceValues} onRollDice={onRollDice} />
      {game.gameStatus == '1' && (
        <button className='start-game' onClick={onStartGame}>Start Game</button>
      )}
            <button className='back-to-lobby'  onClick={() => navigate('/lobby')}>
        Back to Lobby
      </button>
    </div>
  );
};

export default Game;