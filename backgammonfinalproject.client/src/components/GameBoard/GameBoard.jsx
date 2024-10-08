import React from 'react';
import { useState } from 'react';
import GameLogic from '../../Services/GameLogic';
import Point from '../Point/Point';
import Bar from '../Bar/Bar';
import OutsideBar from '../OutsideBar/OutsideBar';
import './GameBoard.css';

const GameBoard = ({ game, onMove, handleGameStateChange }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);

  const handlePointClick = (index) => {
    if (selectedPoint === null) {
      // Selecting a point with checkers
      if (game.points[index].checkers > 0) {
        setSelectedPoint(index);
      }
      //alert(selectedPoint);
    } else {
      // Attempt to move the checker
      onMove(selectedPoint, index);
      setSelectedPoint(null);
    }
  };
  
  const renderPoints = (start, end) => {
    if (!game || !game.points) {
      console.error('Game or game.points is undefined');
      return null;
    }

    const points = [];
    const step = start < end ? 1 : -1;

    for (let i = start; i !== end + step; i += step) {
      if (i < 0 || i >= 24 || !game.points[i]) {
        console.warn(`Invalid point index: ${i}`);
        continue;
      }

      points.push(
        <Point 
          key={i} 
          index={i} 
          checkers={game.points[i]} 
          isTop={i >= 12}
          isSelected={selectedPoint === i}
          onClick={() => handlePointClick(parseInt(i))}
        />
      );
    }

    return points;
  };

  return (
    <div className="game-board">
      <OutsideBar 
      player="white" 
      checkers={game?.outsideBarWhite ?? 0}
      onClick={() => handlePointClick('outsideWhite')} />
      <div className="board-left">
        <div className="board-quadrant top-left">{renderPoints(12, 17)}</div>
        <div className="board-quadrant bottom-left">{renderPoints(11, 6)}</div>
      </div>
      <Bar checkersWhite={game?.barWhite ?? 1} checkersBlack={game?.barBlack ?? 1}
      onWhiteClick={() => handlePointClick('barWhite')}
      onBlackClick={() => handlePointClick('barBlack')}
      />
      <div className="board-right">
        <div className="board-quadrant top-right">{renderPoints(18, 23)}</div>
        <div className="board-quadrant bottom-right">{renderPoints(5, 0)}</div>
      </div>
      <OutsideBar player="black"
      checkers={game?.outsideBarBlack ?? 0} 
      onClick={() => handlePointClick('outsideBlack')} />
    </div>
  );
};

export default GameBoard;