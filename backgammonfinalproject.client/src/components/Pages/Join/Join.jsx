import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import GamehubService from '../../../Services/GameHubService';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../App';
import './Join.css';

const useGames = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const fetchGames = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const gamesData = await GamehubService.fetchAllGames();
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
          const token = localStorage.getItem('token');
          const response = await fetch(`https://localhost:7027/api/Game/JoinGame/${gameId}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              }});
          if (!response.ok) {
              throw new Error('Failed to join game: ' + await response.text());
          }
          const data = await response.json();
          navigate(`/game/${data}`);
        } catch (error) {
            console.error(error);
            setJoinError(error.message);
        }
    };
    const sortedGames = useMemo(() => {
        return [...games].sort((a, b) => {
            const userInA = a.players.some(player => player.id == user.id);
            const userInB = b.players.some(player => player.id == user.id);
            if (userInA && !userInB) return -1;
            if (!userInA && userInB) return 1;
            return (2 - a.players.length) - (2 - b.players.length);
        });
    }, [games, user]);

    return (
        <div className="join-container">
            <h1 className="join-title">Join Game</h1>
            <h2 className="join-description">Welcome! Please select a game to join....</h2>
            
            {loading && <p>Loading games...</p>}
            {error && <p className="error-message">Error loading games: {error}</p>}
            {joinError && <p className="error-message">Error joining game: {joinError}</p>}

            <div className="game-list">
                <h2>Available Games:</h2>
                {sortedGames.length > 0 ? (
                    sortedGames.map(game => {
                        const isUserInGame = game.players.some(player => player.id == user.id);
                        const isGameFull = game.players.length === 2;
                        
                        return (
                            <button 
                                key={game.id} 
                                className={`game-item ${isUserInGame ? 'bold' : ''} ${isGameFull && !isUserInGame ? 'ghost' : ''}`}
                                disabled={isGameFull && !isUserInGame}
                                onClick={() => isUserInGame ? navigate(`/game/${game.id}`) : handleJoinGame(game.id)}
                            >
                                Game ID: {game.id}
                                <br />
                                Players: {game.players.length}/2
                                {isUserInGame && <span className="user-in-game"> (You're in this game)</span>}
                                {isGameFull && !isUserInGame && <span className="game-full"> (Full)</span>}
                            </button>
                        );
                    })
                ) : (
                    <p>No games available. Why not create one?</p>
                )}
            </div>

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