import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SongList.css';

const SongList = ({ setCurrentSong, setIsPlaying }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/songs/');
        setSongs(response.data);
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handleSongClick = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    navigate(`/songs/${song.id}`);
  };

  if (loading) {
    return <div className="loading">Loading songs...</div>;
  }

  return (
    <div className="song-list-container">
      <h2>Popular Songs</h2>
      <div className="songs-grid">
        {songs.map(song => (
          <div 
            key={song.id} 
            className="song-card"
            onClick={() => handleSongClick(song)}
          >
            <div className="song-content">
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
              <div className="song-meta">
                <span>👍 {song.upvotes}</span>
                <span>👎 {song.downvotes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongList;