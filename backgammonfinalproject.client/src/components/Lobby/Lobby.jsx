import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../App';
import { useContext } from 'react';
import Header from '../Header/Header';
import './Lobby.css';
import ActivePlayers from '../ActivePlayers/ActivePlayers';



const LobbyItem = ({ label, onClick, ghost }) => (
  <button className={`lobby-item ${ghost ? 'ghost' : ''}`} onClick={onClick}>
    {label}
  </button>
);

const Lobby = ({ }) => {
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleGoBack = () => {
    logout();
    navigate('/');
  };
  

  const startNewGame = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('User not authenticated');
      return;
    }

    try {
      const response = await fetch('https://localhost:7027/api/Game/CreateGame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
    { label: 'Join Game Room', onClick: () => navigate('/join') },
    { label: 'My Profile', onClick: () => navigate('/profile') },
    { label: 'Log Out', onClick: handleGoBack, ghost: true },
    { label: 'Contact Us', onClick: () => navigate('/contact') },

  ];

  return (
    <div>
      <Header/>
    <div className="lobby-container">
      <h1 className="lobby-title">Lobby🎲</h1>
      {lobbyItems.map((item, index) => (
        <LobbyItem key={index} {...item} />
      ))}
    </div>
    </div>
  );
};

export default Lobby;