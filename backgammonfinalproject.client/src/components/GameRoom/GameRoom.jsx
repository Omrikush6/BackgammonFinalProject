import React, { useState, useEffect, useContext, useDebugValue } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignalRService from '../../Services/SignalRService';
import GameHubService from '../../Services/GameHubService';
import { UserContext } from '../../App';
import Game from '../Game/Game';
import Chat from '../Chat/Chat';
import './GameRoom.css';

function GameRoom() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user, isLoggedIn } = useContext(UserContext);
  const [game, setGame] = useState(null);
  const [messages, setMessages] = useState([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState(null);
  const [turnNotification, setTurnNotification] = useState(null);
  const [error, setError] = useState(null);


  // Authentication check
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!user || !user.id) return;
    const initializeGame = async () => {
      try {
        SignalRService.connect(gameId, user.id);
        if (game && game?.gameStatus == 3) {
          setWinner(game.winnerId == game.whitePlayerId ? 'white' : 'black');
        }
        setGameEnded(game?.gameStatus == 3);
      } catch (error) {
        handleError('initialize game', error);
      }
    };
    initializeGame();
    return () => {
      SignalRService.disconnect();
    };
  }, [gameId, user]);

  //notafication of turns and winning
  useEffect(() => {
    if (game?.currentTurn && game.gameStatus == 2) {
        const isPlayerTurn = game.currentTurn == user.id;
        const playerColor = game.whitePlayerId == user.id ? 'White' : 'Black';
        const opponentColor = playerColor == 'White' ? 'Black' : 'White';
        
        const message = isPlayerTurn
            ? `It's your turn! You're playing as ${playerColor}.`
            : `It's ${opponentColor}'s turn now.`;
        
        setTurnNotification(message);
        const timer = setTimeout(() => setTurnNotification(null), 2000);
        return () => clearTimeout(timer);
    }
}, [game?.currentTurn, game?.gameStatus, user?.id]);



// SignalR event handlers setup
  useEffect(() => {
    const handleGameStarted = (updatedGame) => {
      setGame(updatedGame);
      setMessages(updatedGame.messages || []);
  };

  const handleGameUpdated = (updatedGame) => {
      setGame(updatedGame);
      setMessages(updatedGame.messages || []);
  };

  const handleMessageReceived = (message) => {
      setMessages(prev => [...prev, message]);
  };

  const handleGameEnded = (endedGame) => {
    if (!endedGame) return;

    const winnerColor = endedGame.winnerId === endedGame.whitePlayerId ? 'white' : 'black';
    setGameEnded(true);
    setWinner(winnerColor);
    setGame(endedGame);

    const message = `Game ended. ${winnerColor.charAt(0).toUpperCase() + winnerColor.slice(1)} player won!`;
    setTurnNotification(message);
    const timer = setTimeout(() => setTurnNotification(null), 2000);
    return () => clearTimeout(timer);
};

// Register event handlers
GameHubService.onGameStarted(handleGameStarted);
GameHubService.onGameUpdated(handleGameUpdated);
GameHubService.onMessageReceived(handleMessageReceived);
GameHubService.onPlayerJoined(handleGameUpdated);
GameHubService.onGameEnded(handleGameEnded);
GameHubService.onError(setError);

}, []);

  // Event handlers
  const handleStartGame = async () => {
    if (!user || game.gameStatus !== 1) {
      handleError('start game', new Error('Game is not ready to start'));
      return;
    }
    try {
      await GameHubService.startGame(gameId);
    } catch (err) {
      handleError('start game', err);
    }
  };


  const handleSendMessage = async (message) => {
    if (!user) return;
    try {
      await GameHubService.sendMessage(gameId, user.id, message);
    } catch (err) {
      handleError('send message', err);
    }
  };


  const handleRollDice = async () => {
    debugger;
    try {
        await GameHubService.rollDice(gameId, user.id);
    } catch (err) {
        handleError('roll dice', err);
    }
};

const handleMove = async (from, to) => {
    try {
        await GameHubService.moveChecker(gameId, user.id, from, to);
    } catch (err) {
        handleError('move checker', err);
    }
};

const handleError = (action, error) => {
  debugger;
  setError(`Failed to ${action}: ${error.message}`);
  setTimeout(() => {
    setError(null);
  }, 3000);
};


  if (!game || !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
    {error && <div className="error">{error}</div>}
    {turnNotification && <div className="turn-notification">{turnNotification}</div>}
    
    <div className="game-room">   
      <Game 
        game={game}
        onStartGame={handleStartGame} 
        onRollDice={handleRollDice}
        onMove={handleMove}
        onError={handleError}
      />
      <Chat messages={messages} onSendMessage={handleSendMessage} user={user} />
      {gameEnded && (
                    <div className="game-end-overlay">
                        <h2>{winner === 'You' ? 'Congratulations! You won!' : `Game Over. ${winner} won.`}</h2>
                        <button onClick={() => navigate('/lobby')}>Return to Lobby</button>
                    </div>
                )}
    </div>
    </>
  );
}

export default GameRoom;