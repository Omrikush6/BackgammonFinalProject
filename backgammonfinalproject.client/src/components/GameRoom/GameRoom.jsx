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
      return;
    }

    let isMounted = true;

    const initializeGame = async () => {
      if (!user || !user.id) return;

      try {
        await GameLogic.joinGame(gameId, user.id);
        if (isMounted) {
          setGame({...GameLogic.gameState});
          setMessages(GameLogic.gameState.messages || []);
        }

        SignalRService.setOnGameUpdated((updatedGame) => {
          if (isMounted) {
            GameLogic.initializeGame(updatedGame);
            setGame({...GameLogic.gameState});
          }
        });

        SignalRService.setOnMessageReceived((message) => {
          if (isMounted) {
            setMessages(prevMessages => [...prevMessages, message]);
          }
        });

        SignalRService.setOnPlayerJoined((updatedGame) => {
          if (isMounted) {
            GameLogic.initializeGame(updatedGame);
            setGame({...GameLogic.gameState});
          }
        });

        SignalRService.setOnError((errorMessage) => {
          if (isMounted) {
            setError(errorMessage);
          }
        });
      } catch (error) {
        console.error('Error:', error);
        if (isMounted) {
          setError(error.message);
        }
      }
    };

    initializeGame();

    return () => {
      isMounted = false;
      SignalRService.disconnect();
    };
  }, [gameId, navigate, isLoggedIn, user]);

  const handleGameStateChange = (newGameState) => {
    setGame(newGameState);
    // Here you might want to send the updated game state to the server
    // GameLogic.updateGameState(newGameState);
  };

  const handleSendMessage = async (message) => {
    if (!user) return;
    try {
      await SignalRService.sendMessage(gameId, user.id, message);
    } catch (err) {
      console.error('Error sending message: ', err);
      setError(`Failed to send message: ${err.message}`);
    }
  };
  const handleRollDice = () => {
    try {
      let dice = GameLogic.rollDice();
      setGame(prevGame => ({
        ...prevGame,
        diceValues: dice
      }));
    } catch (err) {
      console.error('Error rolling dice: ', err);
      setError(`Failed to roll dice: ${err.message}`);
    }
  };

  const handleMove = async (from, to) => {
    try {
      const updatedGame = await GameLogic.moveChecker(gameId, user.id, from, to);
      setGame(prevGame => ({
        ...prevGame,
        ...updatedGame
      }));
    } catch (err) {
      console.error('Error moving checker: ', err);
      setError(`Failed to move checker: ${err.message}`);
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
        onGameStateChange={handleGameStateChange}
        onRollDice={handleRollDice}
        onMove={handleMove}
      />
      <Chat messages={messages} onSendMessage={handleSendMessage} user={user} />
    </div>
  );
}

export default GameRoom;