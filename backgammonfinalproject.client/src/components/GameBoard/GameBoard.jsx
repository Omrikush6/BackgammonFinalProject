import React from 'react';
import Point from '../Point/Point';
import Bar from '../Bar/Bar';
import OutsideBar from '../OutsideBar/OutsideBar';
import './GameBoard.css';

const GameBoard = ({ game }) => {
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
        />
      );
    }

    return points;
  };

  return (
    <div className="game-board">
      <OutsideBar player="white" checkers={game?.outsideBarWhite ?? 0} />
      <div className="board-left">
        <div className="board-quadrant top-left">{renderPoints(12, 17)}</div>
        <div className="board-quadrant bottom-left">{renderPoints(11, 6)}</div>
      </div>
      <Bar checkersWhite={game?.barWhite ?? 0} checkersBlack={game?.barBlack ?? 0} />
      <div className="board-right">
        <div className="board-quadrant top-right">{renderPoints(18, 23)}</div>
        <div className="board-quadrant bottom-right">{renderPoints(5, 0)}</div>
      </div>
      <OutsideBar player="black" checkers={game?.outsideBarBlack ?? 0} />
    </div>
  );
};

export default GameBoard;