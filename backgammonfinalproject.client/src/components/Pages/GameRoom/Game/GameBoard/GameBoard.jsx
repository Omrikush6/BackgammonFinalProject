import React from 'react';
import { useState, useContext } from 'react';
import { UserContext } from '../../../../../App';
import Point from './Point/Point';
import Bar from '../Bar/Bar';
import OutsideBar from '../OutsideBar/OutsideBar';
import './GameBoard.css';

const GameBoard = ({ game, onMove, }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedBar, setSelectedBar] = useState(null);
  const { user } = useContext(UserContext);

  const handlePointClick = (index) => {
    if(game.currentTurn != user.id){
      return
    }
    if (selectedBar !== null) {
      // If a bar is selected, attempt to move from bar to point
      onMove(selectedBar, index);
      setSelectedBar(null);
    } else if (selectedPoint === null && typeof(index)==='number') {
      // If no point is selected and this point has checkers, select it
      if (game.points[index].checkers > 0) {
        setSelectedPoint(index);
      }
    } else if (selectedPoint === index) {
      // If clicking the same point, deselect it
      setSelectedPoint(null);
    } else if (selectedPoint !== null) {
      // If a different point was already selected, attempt to move
      onMove(selectedPoint, index);
      setSelectedPoint(null);
    }
  };  
  const handleBarClick = (color) => {
    const barKey = color === 'white' ? 'barWhite' : 'barBlack';
    setSelectedPoint(null);
    setSelectedBar(selectedBar === barKey ? null : (game[barKey] > 0 ? barKey : null));
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
      checkers={game?.outsideBarWhite ?? 1}
      onClick={() => handlePointClick('outsideWhite')} />
      <div className="board-left">
        <div className="board-quadrant top-left">{renderPoints(12, 17)}</div>
        <div className="board-quadrant bottom-left">{renderPoints(11, 6)}</div>
      </div>
      <Bar whitePieces={game?.barWhite ?? 0} blackPieces={game?.barBlack ?? 0}
      onBarClick={handleBarClick}
      selectedBar={selectedBar}
      />
      <div className="board-right">
        <div className="board-quadrant top-right">{renderPoints(18, 23)}</div>
        <div className="board-quadrant bottom-right">{renderPoints(5, 0)}</div>
      </div>
      <OutsideBar player="black"
      checkers={game?.outsideBarBlack ?? 1} 
      onClick={() => handlePointClick('outsideBlack')} />
    </div>
  );
};

export default GameBoard;