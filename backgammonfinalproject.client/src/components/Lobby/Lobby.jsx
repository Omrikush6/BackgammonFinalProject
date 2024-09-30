import React from 'react';
import './Lobby.css';

const LobbyItem = ({ label }) => (
  <div className="lobby-item">
    {label}
  </div>
);

const Lobby = () => {
  const lobbyItems = ['Start New Game', 'Ranking-Table', 'Open Room', 'Go-Back', 'Contact-us'];

  return (
    <div className="lobby-container">
      {lobbyItems.map((item) => (
        <LobbyItem key={item} label={item} />
      ))}
    </div>
  );
};

export default Lobby;
