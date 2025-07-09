import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/SongDetail.css';

const SongDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/songs/${id}/`);
        setSong(response.data);
        
        // Log view interaction if user is logged in
        if (user?.token) {
          await axios.post('http://localhost:8000/interactions/', {
            song_id: id,
            interaction_type: 'VIEW'
          }, {
            headers: {
              'Authorization': `Token ${user.token}`
            }
          });
        }
      } catch (error) {
        toast.error('Failed to load song');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [id, user, navigate]);

  const handleSaveSong = async () => {
    try {
      await axios.post('http://localhost:8000/interactions/', {
        song_id: id,
        interaction_type: 'SAVE'
      }, {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      toast.success('Song saved to your profile');
    } catch (error) {
      toast.error('Failed to save song');
    }
  };

  if (loading) {
    return <div className="song-loading">Loading song...</div>;
  }

  return (
    <div className="song-detail-container">
      <div className="song-header">
        <h1>{song.title}</h1>
        <h2>by {song.artist}</h2>
        {song.album && <p>Album: {song.album}</p>}
        {song.release_year && <p>Year: {song.release_year}</p>}
        
        {user && (
          <button onClick={handleSaveSong} className="save-button">
            Save Song
          </button>
        )}
      </div>

      <div className="song-lyrics">
        <h3>Lyrics</h3>
        <pre>{song.lyrics}</pre>
      </div>
    </div>
  );
};

export default SongDetail;