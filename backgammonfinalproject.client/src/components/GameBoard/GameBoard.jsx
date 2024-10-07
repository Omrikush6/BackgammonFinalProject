import React from 'react';
import Point from '../Point/Point';
import Bar from '../Bar/Bar';
import OutsideBar from '../OutsideBar/OutsideBar';
import './GameBoard.css';

const GameBoard = ({ game }) => {
  const renderPoints = (start, end, isTop) => {
    return Array.from({ length: 6 }, (_, i) => {
      const index = isTop ? start + 5 - i : start + i;
      return (
        <Point 
          key={index} 
          index={index} 
          checkers={game.points[index]} 
          isTop={isTop}
        />
      );
    });
  };

  return (
    <div className="game-board">
      <OutsideBar player="white" checkers={game.outsideBarWhite} />
      <div className="board-left">
        <div className="board-quadrant top-left">{renderPoints(12, 17, true)}</div>
        <div className="board-quadrant bottom-left">{renderPoints(11, 6, false)}</div>
      </div>
      <Bar checkersWhite={game.barWhite} checkersBlack={game.barBlack} />
      <div className="board-right">
        <div className="board-quadrant top-right">{renderPoints(18, 23, true)}</div>
        <div className="board-quadrant bottom-right">{renderPoints(5, 0, false)}</div>
      </div>
      <OutsideBar player="black" checkers={game.outsideBarBlack} />
    </div>
  );
};

export default GameBoard;