import React, { useState, useEffect, useContext, useCallback } from 'react';
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

      const renderGameItem = (game) => (
        <button key={game.id} onClick={() => handleJoinGame(game.id)} className="game-item">
          Game ID: {game.id}
          <br />
          Players: {game.playerIds.length}/2
        </button>
      );


      return (
        <div className="join-container">
          <h1 className="join-title">Join Game</h1>
          <p className="join-description">Please select a game to join.</p>
          
          {/* Error and loading states */}
          {loading && <p>Loading games...</p>}
          {error && <p className="error-message">Error loading games: {error}</p>}
          {joinError && <p className="error-message">{joinError}</p>}
    
          {/* Game list */}
          <div className="game-list">
            <h2>Available Games:</h2>
            {games.length > 0 ? (
              games.map(renderGameItem)
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
