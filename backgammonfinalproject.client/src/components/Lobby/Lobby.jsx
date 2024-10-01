import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Lobby.css';
import Cookies from 'js-cookie';


const LobbyItem = ({ label, onClick }) => (
    <button className="lobby-item" onClick={onClick}>
        {label}
    </button>
);

const Lobby = () => {
    const navigate = useNavigate();


  const startNewGame = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('User not authenticated');
      return;
    }

    try {
      const response = await fetch('https://localhost:7027/api/game/creategame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({  })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('New game started:', data);
        // Navigate to the Game component or handle accordingly
        navigate(`/game/ ${data.id}`)
      } else {
        console.error('Failed to start new game:', response.statusText);
      }
    } catch (error) {
      console.error('Error starting new game:', error);
    }
  };

  const lobbyItems = [
    { label: 'Start New Game', onClick: startNewGame },
    { label: 'Ranking-Table', onClick: () => console.log('Ranking-Table') },
    { label: 'My Profile', onClick: () => console.log('Open Room') },
    { label: 'Log-Out', onClick: handleGoBack },
    { label: 'Contact-us', onClick: () => console.log('Contact-us') },
  ];

  return (
    <div className="lobby-container">
      {lobbyItems.map((item, index) => (
        <LobbyItem key={index} label={item.label} onClick={item.onClick} />
      ))}
    </div>
  );
};

export default Lobby;
