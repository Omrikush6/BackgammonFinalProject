import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignalRService from '../../../Services/SignalRService';
import GameHubService from '../../../Services/GameHubService';
import { UserContext } from '../../../App';
import Game from './Game/Game';
import Chat from './Chat/Chat';
import GameControls from './Game/GameControls/GameControls';
import DrawOffer from './Game/DrawOffer/DrawOffer';
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
  const [drawOffer, setDrawOffer] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);



  // Authentication check
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    // Early return if no user or no token
    if (!user || !user.id) return;

    // Flag to track if the effect is still mounted
    let isMounted = true;
    let connectionAttempted = false;

    const initializeGame = async () => {
      const token = localStorage.getItem('token');
    
      if (!token || connectionAttempted) return;
    
      connectionAttempted = true;
    
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!isMounted) return;
    
        await SignalRService.connect(token, gameId, user.id);
      } catch (error) {
        if (isMounted) {
          handleError('initialize game', error);
        }
      }
    };
    initializeGame();

    // Cleanup function
    return () => {
        isMounted = false;
        SignalRService.disconnect();
    };
}, [gameId, user]);

useEffect(() => {
  if (game && game.gameStatus == 3) {
    setGameEnded(true);
    const winner = {
      id: game.winnerId,
      username: game.players.find(p => p.id == game.winnerId) ?? 'Draw',
      color: game.winnerId == 0 ? 'draw' : game.winnerId == game.whitePlayerId ? 'white' : 'black'
    }
    setWinner(winner);
  }
}, [game]);

  //notafication of turns and winning
useEffect(() => {
    if (game?.currentTurn && game.gameStatus == 2) {
        const isPlayerTurn = game.currentTurn == user.id;
        const playerColor = game.whitePlayerId == user.id ? 'White' : 'Black';
        const opponentName = game.players.find(p => p.id != user.id).username;
        
        const message = isPlayerTurn
            ? `It's your turn! You're playing as ${playerColor}.`
            : `It's ${opponentName}'s turn now.`;
        
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
      console.log(updatedGame);
      setMessages(updatedGame.messages || []);
      setDrawOffer(updatedGame.drawOfferStatus == 1 && updatedGame.drawOfferedBy != user.id ? true : false);
  };

  const handleMessageReceived = (message) => {
      setMessages(prev => [...prev, message]);
  };

  const handleDrawOffered = (recipientId) => {
    if(recipientId != user.id) return;
    setDrawOffer(true);
    setTurnNotification('Your opponent has offered a draw.');
    setTimeout(() => setTurnNotification(null), 3000);

  };
  
  const handleDrawDeclined = (userId) => {
    setDrawOffer(false);
    setTurnNotification(userId != user.id 
      ? 'Your opponent declined your draw offer.'
      : 'You declined the opponent\'s draw offer.');
    setTimeout(() => setTurnNotification(null), 3000);
    };
  
  const handleDrawAccepted = (userId) => {
    setDrawOffer(false);
    setTurnNotification(userId != user.id 
      ? 'The opponent accepted your draw offer. Game is a draw.'
      : 'You accepted the opponent\'s draw offer. Game is a draw.');
    setTimeout(() => setTurnNotification(null), 3000);
  };

  const handleGameEnded = (endedGame) => {
    if (!endedGame) return;
    setGame(endedGame);
    const winner = {
      id: endedGame.winnerId,
      username: endedGame.players.find(p => p.id == endedGame.winnerId).username ?? 'Draw',
      color: endedGame.winnerId == 0 ? 'draw' : endedGame.winnerId == endedGame.whitePlayerId ? 'white' : 'black'
    }
    setGameEnded(true);
    setWinner(winner);

    const message = winnerColor == 'draw'
      ? 'Game ended in a draw.'
      : `Game ended. ${winnerColor.charAt(0).toUpperCase() + winnerColor.slice(1)} player won!`;
    setTurnNotification(message);
    const timer = setTimeout(() => setTurnNotification(null), 2000);
    return () => clearTimeout(timer);
  };

// Register event handlers
GameHubService.onGameStarted(handleGameStarted);
GameHubService.onGameUpdated(handleGameUpdated);
GameHubService.onMessageReceived(handleMessageReceived);
GameHubService.onPlayerJoined(handleGameUpdated);
GameHubService.onDrawOffered(handleDrawOffered);
GameHubService.onDrawDeclined(handleDrawDeclined);
GameHubService.onDrawAccepted(handleDrawAccepted);
GameHubService.onGameEnded(handleGameEnded);
GameHubService.onError(handleError);

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
      handleError(err);
    }
  };

  const handleSendMessage = async (message) => {
    if (!user) return;
    try {
      await GameHubService.sendMessage(gameId, user.id, message);
    } catch (err) {
      handleError(err);
    }
  };

  const handleRollDice = async () => {
    try {
        await GameHubService.rollDice(gameId, user.id);
    } catch (err) {
        handleError(err);
    }
};

const handleForfeit = async () => {
    try {
      const confirmForfeit = window.confirm('Are you sure you want to forfeit the game?');
      if (!confirmForfeit) return;
      const winnerId = user.id === game.whitePlayerId 
            ? game.blackPlayerId 
            : game.whitePlayerId;
        await GameHubService.forfeitGame(gameId, winnerId);
    } catch (err) {
        handleError(err);
    }
};

const handleOfferDraw = async () => {
  try {
    await GameHubService.offerDraw(gameId, user.id);
  } catch (err) {
    handleError(err);
  }
};

const handleRespondDraw = async (accepted) => {
  try {
    setDrawOffer(false);
    await GameHubService.respondToDraw(gameId, user.id, accepted);
  } catch (err) {
    handleError(err);
  }
};


const handleMove = async (from, to) => {
    try {
        await GameHubService.moveChecker(gameId, user.id, from, to);
    } catch (err) {
        handleError('move checker', err);
    }
};

const handleError = (error) => {
  setError(error);
  setTimeout(() => {
    setError(null);
  }, 3000);
};

  if (!game || !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      {turnNotification && (
        <div className="turn-notification">
          {turnNotification}
        </div>
      )}
      {gameEnded && (
          <div className="game-end-overlay">
            <h2>
              
              {winner?.username == 'Draw' ? 'It\'s a draw!' :
                winner.id == user.id ? 'Congratulations! You won!' :
                `Game Over. ${winner.color} won.`}
            </h2>
            <button onClick={() => navigate('/lobby')}>Return to Lobby</button>
          </div>
      )}
      {drawOffer && (
      <DrawOffer 
      onAccept={() => handleRespondDraw(true)} 
      onDecline={() => handleRespondDraw(false)} 
      />
      )}
      <div className="game-room">   
      <Game 
        game={game}
        onRollDice={handleRollDice}
        onMove={handleMove}
      />
      <div className='chat'>
      <Chat 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          user={user} 
        />
      </div>
      </div>
      <GameControls
        gameStatus={game.gameStatus}
        onStartGame={handleStartGame}
        onForfeit={handleForfeit}
        onOfferDraw={handleOfferDraw}
      />
    </>
  );
}

export default GameRoom;