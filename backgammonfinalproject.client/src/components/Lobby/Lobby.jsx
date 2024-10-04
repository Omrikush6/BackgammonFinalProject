import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Lobby.css';
import Cookies from 'js-cookie';
import ActivePlayers from '../ActivePlayers/ActivePlayers';

const LobbyItem = ({ label, onClick }) => (
    <button className="lobby-item" onClick={onClick}>
        {label}
    </button>
);

const ContactUs = ({ onClose }) => {
    return (
        <div className="contact-us-container">
            <h2>Contact Us</h2>
            <form className="contact-us-form">
                <input type="text" placeholder="Your Name" required />
                <input type="email" placeholder="Your Email" required />
                <textarea placeholder="Your Message" required></textarea>
                <button type="submit">Send</button>
            </form>
            <p>Contact the developers: <a href="tel:+1234567890">+1 (234) 567-890</a></p>
        </div>
    );
};

const Lobby = ({ onLogout }) => {
    const navigate = useNavigate();
    const [showRankingTable, setShowRankingTable] = useState(false);
    const [showContactUs, setShowContactUs] = useState(false);

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
                navigate(`/game/${data.id}`)
            } else {
                console.error('Failed to start new game:', response.statusText);
            }
        } catch (error) {
            console.error('Error starting new game:', error);
        }
    };

    const toggleRankingTable = () => {
        setShowRankingTable(!showRankingTable);
    };

    const toggleContactUs = () => {
        setShowContactUs(!showContactUs);
    };

    const lobbyItems = [
        { label: 'Start New Game', onClick: startNewGame },
        { label: 'Ranking-Table', onClick: toggleRankingTable },
        { label: 'My Profile', onClick: () => console.log('My Profile') },
        { label: 'Log-Out', onClick: handleGoBack },
        { label: 'Contact-us', onClick: toggleContactUs },
    ];

    return (
        <div className="lobby-layout">
            <div className={`ranking-table-sidebar ${showRankingTable ? 'show' : ''}`}>
                <ActivePlayers />
            </div>
            <div className="lobby-container">
                {lobbyItems.map((item, index) => (
                    <LobbyItem key={index} label={item.label} onClick={item.onClick} />
                ))}
            </div>
            {showContactUs && (
                <div className={`contact-us-sidebar ${showContactUs ? 'show' : ''}`}>
                    <ContactUs />
                </div>
            )}
        </div>
    );
};

export default Lobby;
