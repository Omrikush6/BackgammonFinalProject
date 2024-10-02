import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Lobby.css';

const LobbyItem = ({ label, onClick, ghost }) => (
  <button className={`lobby-item ${ghost ? 'ghost' : ''}`} onClick={onClick}>
    {label}
  </button>
);

const Lobby = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    onLogout();
    navigate('/');
  };

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
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        console.log('New game started:', data);
        navigate(`/game/${data.id}`);
      } else {
        console.error('Failed to start new game:', response.statusText);
      }
    } catch (error) {
      console.error('Error starting new game:', error);
    }
  };

  const lobbyItems = [
    { label: 'Start New Game', onClick: startNewGame },
    { label: 'Ranking Table', onClick: () => navigate('/rankings') },
    { label: 'My Profile', onClick: () => navigate('/profile') },
    { label: 'Log Out', onClick: handleGoBack, ghost: true },
    { label: 'Contact Us', onClick: () => navigate('/contact') },
  ];

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Lobby🎲</h1>
      {lobbyItems.map((item, index) => (
        <LobbyItem key={index} {...item} />
      ))}
    </div>
  );
};

export default Lobby;