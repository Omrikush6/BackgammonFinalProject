import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Contact.css';

const Contact = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [emailClicked, setEmailClicked] = useState('');

    const handleEmail = (emailType) => {
        let email = '';
        let subject = '';
        
        if (emailType === 'support') {
            email = 'omrikush6@gmail.com';
            subject = 'Support Request';
        } else if (emailType === 'feedback') {
            email = 'tvklein@gmail.com';
            subject = 'Game Feedback';
        }

        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
        
        // Attempt to open email client
        window.location.href = mailtoLink;
        
        // Set state to show which email was clicked
        setEmailClicked(emailType);

        // Reset the state after 3 seconds
        setTimeout(() => setEmailClicked(''), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the form data to a server
        console.log('Form submitted:', formData);
        // For now, we'll just close the modal and reset the form
        setShowModal(false);
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="contact-container">
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-description">
                We'd love to hear from you! Choose an option below to get in touch with our team.
            </p>
            <button 
                className={`contact-item ${emailClicked === 'support' ? 'clicked' : ''}`} 
                onClick={() => handleEmail('support')}
            >
                Contact Support
            </button>
            {emailClicked === 'support' && (
                <p className="email-info">Opening email to omrikush6@gmail.com</p>
            )}
            <button 
                className={`contact-item ${emailClicked === 'feedback' ? 'clicked' : ''}`} 
                onClick={() => handleEmail('feedback')}
            >
                Send Feedback
            </button>
            {emailClicked === 'feedback' && (
                <p className="email-info">Opening email to tvklein@gmail.com</p>
            )}
            <button className="contact-item" onClick={() => setShowModal(true)}>
                Send Us a Message
            </button>
            <button className="contact-item ghost" onClick={() => navigate('/lobby')}>
                Back to Lobby
            </button>
            <div className="contact-info">
                <p>Call us: <a href="tel:+9725885777600">+972 58-857-77600</a> or <a href="tel:+972586535033">+972 58-653-5033</a></p>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                        <h2>Send Us a Message</h2>
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleInputChange} 
                                placeholder="Your Name" 
                                required 
                            />
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleInputChange} 
                                placeholder="Your Email" 
                                required 
                            />
                            <textarea 
                                name="message" 
                                value={formData.message} 
                                onChange={handleInputChange} 
                                placeholder="Your Message" 
                                required
                            ></textarea>
                            <button type="submit" className="contact-item">Send</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contact;