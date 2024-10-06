import React, { useState } from 'react';
import './Chat.css'; 

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages([...messages, input]);
            setInput('');
        }
    };

    return (
        <div className="chat">
            <div className="chat-title">
                <h1>some user</h1>
                <h2>player11</h2>
                <figure className="avatar">
                    <img src="https://d3m9l0v76dty0.cloudfront.net/system/photos/10973437/large/bd3650e3f4f334f6cc48f18b1336feda.jpg" alt="Avatar" />
                </figure>
            </div>
            <div className="messages">
                <div className="messages-content">
                    {messages.map((msg, index) => (
                        <div key={index} className="message">
                            {msg}
                        </div>
                    ))}
                </div>
            </div>
            <div className="message-box">
                <form onSubmit={handleSendMessage}>
                    <textarea
                        className="message-input"
                        placeholder="Type message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    ></textarea>
                    <button type="submit" className="message-submit">Send</button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
