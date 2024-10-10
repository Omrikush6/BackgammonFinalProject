import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import  GameLogic  from '../../Services/GameLogic';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../App'
import './Join.css';

const useGames = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const fetchGames = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const gamesData = await GameLogic.fetchAllGames();
        setGames(gamesData);
      } catch (error) {
        console.error('Error fetching games:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }, []);
  
    useEffect(() => {
      fetchGames();
    }, [fetchGames]);
  
    return { games, loading, error, refetchGames: fetchGames };
  };



const Join = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const { games, loading, error, refetchGames } = useGames();
    const [joinError, setJoinError] = useState(null);

    const handleJoinGame = async (gameId) => {
        setJoinError(null);
        try {
          await GameLogic.joinGame(gameId, user.id);
          navigate(`/game/${gameId}`);
        } catch (error) {
          console.error(error);
          setJoinError(error.message);
        }
      };

      const getGameButtonProps = useCallback((game) => {
        debugger;
        const isUserInGame = game.playerIds.includes(parseInt(user.id));
        const isGameFull = game.playerIds.length === 2;
        
        let buttonClass = "game-item";
        if (isUserInGame) {
          buttonClass += " bold";
        } else if (isGameFull) {
          buttonClass += " ghost";
        }
    
        return {
          className: buttonClass,
          disabled: isGameFull && !isUserInGame,
          onClick: () => isUserInGame ? navigate(`/game/${game.id}`) : handleJoinGame(game.id)
        };
      }, [user.id, navigate, handleJoinGame]);

      const renderGameItem = (game) => {
    const buttonProps = getGameButtonProps(game);
    const isUserInGame = game.playerIds.includes(user.id);

    return (
      <button key={game.id} {...buttonProps}>
        Game ID: {game.id}
        <br />
        Players: {game.playerIds.length}/2
        {isUserInGame && <span className="user-in-game"> (You're in this game)</span>}
        {game.playerIds.length === 2 && !isUserInGame && <span className="game-full"> (Full)</span>}
      </button>
    );
  };

  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => {
      const userInA = a.playerIds.includes(user.id);
      const userInB = b.playerIds.includes(user.id);
      if (userInA && !userInB) return -1;
      if (!userInA && userInB) return 1;
      return (2 - a.playerIds.length) - (2 - b.playerIds.length);
    });
  }, [games, user.id]);


  return (
    <div className="join-container">
      <h1 className="join-title">Join Game</h1>
      <p className="join-description">Welcome to the game joining area</p>
      
      {/* Error and loading states */}
      {loading && <p>Loading games...</p>}
      {error && <p className="error-message">Error loading games: {error}</p>}
      {joinError && <p className="error-message">Error joining game: {joinError}</p>}

      {/* Game list */}
      <div className="game-list">
        <h2>Available Games:</h2>
        {sortedGames.length > 0 ? (
          sortedGames.map(renderGameItem)
        ) : (
          <p>No games available. Why not create one?</p>
        )}
      </div>

      {/* Navigation buttons */}
      <button className="join-item ghost" onClick={() => navigate('/lobby')}>
        Back to Lobby
      </button>
      <button className="join-item" onClick={refetchGames}>
        Refresh Games
      </button>
    </div>
  );
};
    
export default Join;