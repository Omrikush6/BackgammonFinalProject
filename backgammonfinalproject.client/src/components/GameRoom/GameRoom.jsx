import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { UserContext } from '../../App';
import Board from '../Board/Board';
import './GameRoom.css';

function GameRoom() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useContext(UserContext);
  const [game, setGame] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [error, setError] = useState(null);
  const connectionRef = useRef(null);

  const setupSignalRConnection = async (token) => {
    const connection = new HubConnectionBuilder()
      .withUrl(`https://localhost:7027/gameHub?access_token=${token}`)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();
    
    connection.on("PlayerJoined", setGame);
    connection.on("MessageReceived", (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    try {
      await connection.start();
      console.log("SignalR Connected.");
      
      await connection.invoke("JoinGame", parseInt(gameId), 5);
      connectionRef.current = connection;
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      setError(`Failed to connect to game: ${err.message}`);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const token = localStorage.getItem('token');

    const fetchGame = async () => {
      try {
        const response = await fetch(`https://localhost:7027/api/game/${gameId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch game: ${response.statusText}`);
        }
        const data = await response.json();
        setGame(data);
        setMessages(data.messages)
        await setupSignalRConnection(token);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      }
    };

    fetchGame();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [gameId, navigate, isLoggedIn, user]);

  const sendMessage = async () => {
    if (inputMessage.trim() !== '' && connectionRef.current) {
      try {
        await connectionRef.current.invoke("SendMessage", parseInt(gameId), 5, inputMessage);
        setInputMessage('');
      } catch (err) {
        console.error('Error sending message: ', err);
        setError(`Failed to send message: ${err.message}`);
      }
    }
  };
  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!game) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-room">
      <div className="game-board">
        <Board game={game} />
      </div>
      <div className="chat-box">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              {msg.senderName}: {msg.content}
            </div>
          ))}
        </div>
        <div className="message-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default GameRoom;