import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-section">
            <h3>About Backgammon Online</h3>
            <p>
              Experience  classic Backgammon in a modern online environment. 
              Play with friends or challenge players from around the world!
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <div className="footer-links">
              <Link to="/lobby">Game Lobby</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>

          {/* Connect Section */}
          <div className="footer-section">
            <h3>Connect With Us</h3>
            <div className="social-links">
              <a 
                href="https://github.com/Omrikush6/BackgammonFinalProject" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon"
              >
                <Github size={24} />
              </a>
              <a 
                href="mailto:omrikush6@gmail.com" 
                className="social-icon"
              >
                <Mail size={24} />
              </a>
              <a 
                href="https://www.linkedin.com/in/omrisad/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon"
              >
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} Backgammon Online. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;