import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.token) {
      toast.error('Please login to view profile');
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/profile/', {
          headers: {
            'Authorization': `Token ${user.token}`
          }
        });
        setProfileData(response.data);
      } catch (error) {
        toast.error('Failed to load profile data');
        console.error('Profile error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Your Profile</h1>
        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <div className="avatar">
            <span>{profileData?.username?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          
          <div className="details">
            <h2>{profileData?.username}</h2>
            <p><strong>Email:</strong> {profileData?.email}</p>
            <p><strong>Member since:</strong> {new Date(profileData?.date_joined).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <h3>Saved Songs</h3>
            <p>{profileData?.saved_songs || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Searches</h3>
            <p>{profileData?.searched_songs || 0}</p>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            className="edit-button"
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </button>
          <button 
            className="change-password-button"
            onClick={() => navigate('/profile/change-password')}
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;