import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Join.css'; 

const Join = () => {
    const navigate = useNavigate();

    
    const handleSearchGames = async (playerId) => {

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

            const games = await response.json();

            const singlePlayerGames = games.filter(game => game.playerCount === 1);

            if (singlePlayerGames.length > 0) {
                const gameToJoin = singlePlayerGames[0]; 
                const gameId = gameToJoin.id;
              
                const joinResponse = await fetch(`https://localhost:7027/api/Game/JoinGame/${gameId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : undefined 
                    },
                    body: JSON.stringify({ playerId }) 
                });

                if (!joinResponse.ok) {
                    throw new Error(`Error joining game: ${joinResponse.statusText}`);
                }

                const joinData = await joinResponse.json();
                console.log('Joined game successfully:', joinData);

                navigate(`/game/${gameId}`); 
                return joinData; 
            } else {
                console.log('No single-player games available to join.');
            }
        } catch (error) {
            console.error('Error in searching or joining game:', error);
            throw error; 
        }
    };



    return (
        <div className="join-container">
            <h1 className="join-title">Contact Us</h1>
            <p className="join-description">
                Welcome to joining game area
            </p>
            <button className="join-item" onClick={() => handleSearchGames(playerId)}>
                Search Available Room
            </button>
            <button className="join-item ghost" onClick={() => navigate('/lobby')}>
                Back to Lobby
            </button>
        </div>
    );
};

export default Join;
