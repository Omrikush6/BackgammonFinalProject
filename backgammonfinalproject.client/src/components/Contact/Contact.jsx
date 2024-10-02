import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Contact.css';

const Contact = () => {
    const navigate = useNavigate();
  
    const handleEmail = (emailType) => {
      let email = '';
      let subject = '';
      
      if (emailType === 'support') {
        email = 'support@yourgame.com';
        subject = 'Support Request';
      } else if (emailType === 'feedback') {
        email = 'feedback@yourgame.com';
        subject = 'Game Feedback';
      }
  
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    };
  
    return (
      <div className="contact-container">
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-description">
          We'd love to hear from you! Choose an option below to get in touch with our team.
        </p>
        <button className="contact-item" onClick={() => handleEmail('support')}>
          Contact Support
        </button>
        <button className="contact-item" onClick={() => handleEmail('feedback')}>
          Send Feedback
        </button>
        <button className="contact-item ghost" onClick={() => navigate('/lobby')}>
          Back to Lobby
        </button>
      </div>
    );
  };

  export default Contact