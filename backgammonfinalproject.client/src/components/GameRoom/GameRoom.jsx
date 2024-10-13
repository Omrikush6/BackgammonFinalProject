import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameLogic from '../../Services/GameLogic';
import SignalRService from '../../Services/SignalRService';
import { UserContext } from '../../App';
import Game from '../Game/Game';
import Chat from '../Chat/Chat';
import './GameRoom.css';

function GameRoom() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useContext(UserContext);
  const [game, setGame] = useState(GameLogic.gameState);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState(null);
  const [turnNotification, setTurnNotification] = useState(null);

  useEffect(() => {
    if (game && user && game.players && game.players.white && game.players.black) {
      const isPlayerTurn = game.currentTurn == user.id;
      const playerColor = game.players.white.id == user.id ? 'White' : 'Black';
      const opponentColor = playerColor === 'White' ? 'Black' : 'White';
      let message;
      if (isPlayerTurn) {
        message = `It's your turn! You're playing as ${playerColor}.`;
      } else {
        message = `It's ${opponentColor}'s turn now.`;
      }
      setTurnNotification(message);
      const timer = setTimeout(() => setTurnNotification(null), 2000);
      return () => clearTimeout(timer);
    } else {
      setTurnNotification(null);
    }
  }, [game.currentTurn, user]);


  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!user || !user.id) return;

    const initializeGame = async () => {
      try {
        const gameState  = await GameLogic.joinGame(gameId, user.id);
        setGame({...gameState });
        setMessages(gameState.messages || []);
        const players = gameState.players;
        if (players && players.white && players.black) {
          setWinner(
            GameLogic.gameState.winnerId === players.white.id ? 'white' : 'black'
          );
        } else {
          setWinner(null);
        }
        setGameEnded(gameState.gameStatus == '3');
      } catch (error) {
        handleError('initialize game', error);
      }
    };

    initializeGame();

    return () => {
      SignalRService.disconnect();
    };
  }, [gameId, user]);

  useEffect(() => {

    const handleGameStarted = (updatedGame) => {
      GameLogic.initializeGame(updatedGame);
      setGame({...GameLogic.gameState});
      console.log('this is the current game state', GameLogic.gameState);
    };

    const handleGameUpdated = (updatedGame) => {
      GameLogic.initializeGame(updatedGame);
      setGame({...GameLogic.gameState});
    };

    const handleMessageReceived = (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    };

    const handleGameEnded = (gameEndData) => {
      console.log('Game ended', gameEndData);
  
      if (!gameEndData || !gameEndData.currentStateJson) {
          console.error('Invalid gameEndData received');
          return;
      }
  
      let finalGameState;
      try {
          finalGameState = JSON.parse(gameEndData.currentStateJson);
      } catch (error) {
          console.error('Error parsing currentStateJson:', error);
          return;
      }
  
      setGameEnded(true);
      let winnerColor;
      if (finalGameState.players && finalGameState.players.white && finalGameState.players.black) {
          winnerColor = gameEndData.winnerId === finalGameState.players.white.id ? 'white' : 'black';
      } else {
          console.error('Unable to determine winner color');
          winnerColor = 'unknown';
      }
  
      setWinner(winnerColor);
      GameLogic.initializeGame(gameEndData);
      setGame({...GameLogic.gameState});
      alert(`Game ended. ${winnerColor.charAt(0).toUpperCase() + winnerColor.slice(1)} player won!`);
  };

    SignalRService.setOnGameStarted(handleGameStarted);
    SignalRService.setOnGameUpdated(handleGameUpdated);
    SignalRService.setOnMessageReceived(handleMessageReceived);
    SignalRService.setOnPlayerJoined(handleGameUpdated);
    SignalRService.setOnGameEnded(handleGameEnded);
    SignalRService.setOnError(setError);

    return () => {
      SignalRService.setOnGameStarted(null);
      SignalRService.setOnGameUpdated(null);
      SignalRService.setOnMessageReceived(null);
      SignalRService.setOnPlayerJoined(null);
      SignalRService.setOnGameEnded(null);
      SignalRService.setOnError(null);
    };
  }, []);

  const handleStartGame = async () => {
    if (!user) return;
    if (game.gameStatus != '1') {
      handleError('start game', new Error('Game is not ready to start'));
      return;
    }

    try {
      await SignalRService.StartGame(gameId, user.id);
      // The game state will be updated via the SignalR event handlers
    } catch (err) {
      handleError('start game', err);
    }
  };

  const handleError = (action, error) => {
    //console.error(`Error ${action}: `, error);
    setError(`Failed to ${action}: ${error.message}`);
    setTimeout(() => {
      setError(null); // Reset the error message
    }, 3000);
  };


  const handleSendMessage = async (message) => {
    if (!user) return;
    try {
      await SignalRService.sendMessage(gameId, user.id, message);
    } catch (err) {
      handleError('send message', err);
    }
  };


  const handleRollDice = () => {
    const result = GameLogic.rollDice(user.id);
    if (result.success) {
        setGame(prevGame => ({
            ...prevGame,
            diceValues: result.diceValues,
            isRolled: true
        }));
    } else {
        handleError('roll dice', new Error(result.message));
    }
};

  const handleMove = (from, to) => {
    const result = GameLogic.moveChecker(from, to, parseInt(user.id));
    if (result.success) {
      setGame(prevGame => ({...prevGame, ...result.updatedGame}));
      setTurnNotification(result.message);
    } else {
      handleError('move checker', new Error(result.message));
    }
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