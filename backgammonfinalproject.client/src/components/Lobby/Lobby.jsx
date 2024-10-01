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


    const handleLogout = () => {
        
        navigate('/');
         
    };



    const lobbyItems = [
        { label: 'Start New Game', action: () => navigate('/game') },
        { label: 'Ranking-Table', action: () => console.log('Ranking-Table clicked') },
        { label: 'Open Room', action: () => console.log('Open Room clicked') },
        { label: 'Contact-us', action: () => console.log('Contact-us clicked') },
        { label: 'Log-Out', action: handleLogout }
    ];

    return (
        <div className="lobby-container">
            {lobbyItems.map((item) => (
                <LobbyItem
                    key={item.label}
                    label={item.label}
                    onClick={item.action}
                />
            ))}
        </div>
    );
};

export default Lobby;
