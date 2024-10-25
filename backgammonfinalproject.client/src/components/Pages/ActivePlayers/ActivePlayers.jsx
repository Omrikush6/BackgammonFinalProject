import React from 'react';
import { Crown } from 'lucide-react';
import './ActivePlayers.css';

const PlayerList = ({ players }) => (
    <div className="player-list-container">
        <div className="player-list-header">
            <Crown className="crown-icon" />
            <h2>Most active Players</h2>
        </div>
        <ul className="player-list">
            {players.map((player, index) => (
                <li key={player.name} className="player-list-item">
                    <span className="player-name">
                        {index + 1}. {player.name}
                    </span>
                    <span className="player-score">{player.score}</span>
                </li>
            ))}
        </ul>
    </div>
);

const ActivePlayers = () => {
    const players = [
        { name: 'Jerry Wood', score: 948 },
        { name: 'Brandon Barnes', score: 750 },
        { name: 'Raymond Knight', score: 684 },
        { name: 'Trevor McCormick', score: 335 },
        { name: 'Andrew Fox', score: 296 },
    ];

    return <PlayerList players={players} />;
};

export default ActivePlayers;