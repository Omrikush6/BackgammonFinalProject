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


  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!user || !user.id) return;

    const initializeGame = async () => {
      try {
        await GameLogic.joinGame(gameId, user.id);
        setGame({...GameLogic.gameState});
        setMessages(GameLogic.gameState.messages || []);
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
      alert('started the game')
      // Add any additional logic needed when the game starts, like enabling game controls
    };

    const handleGameUpdated = (updatedGame) => {
      GameLogic.initializeGame(updatedGame);
      setGame({...GameLogic.gameState});
    };

    const handleMessageReceived = (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    };

    SignalRService.setOnGameStarted(handleGameStarted);
    SignalRService.setOnGameUpdated(handleGameUpdated);
    SignalRService.setOnMessageReceived(handleMessageReceived);
    SignalRService.setOnPlayerJoined(handleGameUpdated);
    SignalRService.setOnError(setError);

    return () => {
      SignalRService.setOnGameStarted(null);
      SignalRService.setOnGameUpdated(null);
      SignalRService.setOnMessageReceived(null);
      SignalRService.setOnPlayerJoined(null);
      SignalRService.setOnError(null);
    };
  }, []);

  const handleStartGame = async () => {
    debugger;
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
    console.error(`Error ${action}: `, error);
    setError(`Failed to ${action}: ${error.message}`);
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
        // Handle the error, maybe show a message to the user
        console.log(result.message);
        // Optionally, update UI to show an error message
        // setErrorMessage(result.message);
    }
};
  const handleMove = async (from, to) => {
    try {
      debugger;
      const updatedGame = await GameLogic.moveChecker(from, to, parseInt(user.id));
      setGame(prevGame => ({...prevGame, ...updatedGame}));
    } catch (err) {
      handleError('move checker', err);
    }
  };

  if (!game || !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
    {error && <div className="error">{error}</div>}
    
    <div className="game-room">
      
      <Game 
        game={game}
        onStartGame={handleStartGame} 
        onRollDice={handleRollDice}
        onMove={handleMove}
        onError={handleError}
      />
      <Chat messages={messages} onSendMessage={handleSendMessage} user={user} />
    </div>
    </>
  );
}

export default GameRoom;