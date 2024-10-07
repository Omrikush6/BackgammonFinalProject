import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameLogic from '../../Services/GameLogic';
import { UserContext } from '../../App';
import Game from '../Game/Game';
import Chat from '../Chat/Chat';
import './GameRoom.css';

function GameRoom() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useContext(UserContext);
  const [game, setGame] = useState({
    points: Array(24).fill([]),
    barWhite: 0,
    barBlack: 0,
    outsideBarWhite: 0,
    outsideBarBlack: 0,
    diceValues: [0, 0],
    currentTurn: null,
    players: []
  });
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
          setGame(prevGame => ({
            ...prevGame,
            ...GameLogic.gameState,
            players: [...(GameLogic.gameState.players || [])],
            points: [...(GameLogic.gameState.points || Array(24).fill([]))]
          }));
          setMessages(GameLogic.gameState.messages || []);
        }

        GameLogic.setOnGameStateChange((updatedGame) => {
          if (isMounted) {
            setGame(prevGame => ({
              ...prevGame,
              ...updatedGame,
              players: [...(updatedGame.players || [])],
              points: [...(updatedGame.points || Array(24).fill([]))]
            }));
          }
        });

        GameLogic.setOnMessageReceived((message) => {
          if (isMounted) {
            setMessages(prevMessages => [...prevMessages, message]);
          }
        });

        GameLogic.setOnError((errorMessage) => {
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
      GameLogic.disconnectSignalR();
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
      await GameLogic.sendMessage(gameId, user.id, message);
    } catch (err) {
      console.error('Error sending message: ', err);
      setError(`Failed to send message: ${err.message}`);
    }
  };
  const handleRollDice = async () => {
    try {
      const diceValues = await GameLogic.rollDice(gameId, user.id);
      setGame(prevGame => ({
        ...prevGame,
        diceValues
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
      {/*render the game here*/}
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