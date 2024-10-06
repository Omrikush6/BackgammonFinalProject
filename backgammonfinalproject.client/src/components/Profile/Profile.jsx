import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App'; // Adjust this import path as needed
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const { user, login } = useContext(UserContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`https://localhost:7027/api/User/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch profile data');
        const data = await response.json();
        setProfileData(data);
        setEditedData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedData(profileData);
      setPassword('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('https://localhost:7027/api/User/Update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userDto: editedData,
          password: password
        })
      });
      if (!response.ok) throw new Error('Failed to update profile');
      const updatedData = await response.json();
      setProfileData(updatedData);
      setIsEditing(false);
      setPassword('');
      login(localStorage.getItem('token'));
      setError('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="profile-container"><p>Loading...</p></div>;
  if (error) return <div className="profile-container"><p className="error-message">{error}</p></div>;
  if (!profileData) return <div className="profile-container"><p>No profile data available</p></div>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Profile</h1>
      <p className="profile-description">
        View and update your profile information below.
      </p>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <input
            type="text"
            name="username"
            value={editedData.username || ''}
            onChange={handleInputChange}
            placeholder="Username"
            className="profile-input"
          />
          <input
            type="email"
            name="email"
            value={editedData.email || ''}
            onChange={handleInputChange}
            placeholder="Email"
            className="profile-input"
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password (leave blank to keep current)"
            className="profile-input"
          />
          <button type="submit" className="profile-item">Save Changes</button>
          <button type="button" className="profile-item ghost" onClick={handleEditToggle}>Cancel</button>
        </form>
      ) : (
        <div className="profile-info">
          <p><strong>Username:</strong> {profileData.username}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <button className="profile-item" onClick={handleEditToggle}>Edit Profile</button>
        </div>
      )}
      <button className="profile-item ghost" onClick={() => navigate('/lobby')}>
        Back to Lobby
      </button>
    </div>
  );
}

export default Profile;