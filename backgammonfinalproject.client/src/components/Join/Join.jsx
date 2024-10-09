import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../App'
import './Join.css';

const Join = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(UserContext)
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('https://localhost:7027/api/Game/AllGames', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : undefined
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching games: ${response.statusText}`);
            }
            const gamesData = await response.json();
            setGames(gamesData);
        } catch (error) {
            console.error('Error fetching games:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const joinGame = async (gameId) => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const userId = user.id

        if (!userId) {
            setError('User ID not found. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`https://localhost:7027/api/Game/JoinGame/${gameId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : undefined
                },
                body: JSON.stringify(userId) 
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error joining game: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const joinData = await response.json();
            console.log('Joined game successfully:', joinData);
            navigate(`/game/${gameId}`); 
        } catch (error) {
            console.error('Error joining game:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="join-container">
            <h1 className="join-title">Join Game</h1>
            <p className="join-description">
                Welcome to joining game area
            </p>
            {loading && <p>Loading...</p>}
            {error && <p className="error-message">Error: {error}</p>}
            <div className="game-list">
                <h2>Available Games:</h2>
                {games.map(game => (
                    <button key={game.id} onClick={() => joinGame(game.id)}>
                        Player Name:{user.name}
                        <br />
                    </button>
                ))}
            </div>
            <button className="join-item ghost" onClick={() => navigate('/lobby')}>
                Back to Lobby
            </button>
        </div>
    );
};

export default Join;
