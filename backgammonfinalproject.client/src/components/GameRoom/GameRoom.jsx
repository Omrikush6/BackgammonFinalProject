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
      navigate('/login');
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
    const handleGameUpdated = (updatedGame) => {
      GameLogic.initializeGame(updatedGame);
      setGame({...GameLogic.gameState});
    };

    const handleMessageReceived = (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    };

    SignalRService.setOnGameUpdated(handleGameUpdated);
    SignalRService.setOnMessageReceived(handleMessageReceived);
    SignalRService.setOnPlayerJoined(handleGameUpdated);
    SignalRService.setOnError(setError);

    return () => {
      SignalRService.setOnGameUpdated(null);
      SignalRService.setOnMessageReceived(null);
      SignalRService.setOnPlayerJoined(null);
      SignalRService.setOnError(null);
    };
  }, []);

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
    try {
      setGame(prevGame => ({...prevGame, diceValues: GameLogic.rollDice()}));
    } catch (err) {
      handleError('roll dice', err);
    }
  };
  const handleMove = async (from, to) => {
    try {
      const updatedGame = await GameLogic.moveChecker(from, to);
      setGame(prevGame => ({...prevGame, ...updatedGame}));
    } catch (err) {
      handleError('move checker', err);
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!game || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-room">
      <Game 
        game={game} 
        onRollDice={handleRollDice}
        onMove={handleMove}
      />
      <Chat messages={messages} onSendMessage={handleSendMessage} user={user} />
    </div>
  );
}

export default GameRoom;