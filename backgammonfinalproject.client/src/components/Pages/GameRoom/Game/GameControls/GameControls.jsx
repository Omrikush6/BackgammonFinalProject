import React from 'react';
import './GameControls.css';

const GameControls = ({ gameStatus, onStartGame, onForfeit, onOfferDraw }) => (
  <div className="game-controls">
    {gameStatus == '1' && <button className="start-game" onClick={onStartGame}>Start Game</button>}
    {gameStatus == '2' && (
      <>
        <button className="forfeit-game" onClick={onForfeit}>Forfeit Game</button>
        <button className="offer-draw" onClick={onOfferDraw}>Offer Draw</button>
      </>
    )}
  </div>
);

export default GameControls;