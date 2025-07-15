import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Howl } from 'howler';
import { useAuth } from '../context/AuthContext';
import LyricsDisplay from './LyricsDisplay';
import '../styles/LyricsPlayer.css';

const LyricsPlayer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const soundRef = useRef(null);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/songs/${id}/`);
        setSong(response.data);
        
        // Initialize audio player
        soundRef.current = new Howl({
          src: [response.data.audio_url || `http://localhost:8000${response.data.audio_file}`],
          html5: true,
          onplay: () => setIsPlaying(true),
          onpause: () => setIsPlaying(false),
          onend: () => setIsPlaying(false),
          onseek: () => {
            if (soundRef.current) {
              setCurrentTime(soundRef.current.seek());
            }
          }
        });
      } catch (err) {
        setError('Failed to load song');
        console.error('Error fetching song:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSong();

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [id]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        if (soundRef.current) {
          setCurrentTime(soundRef.current.seek());
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.pause();
      } else {
        soundRef.current.play();
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (soundRef.current) {
      soundRef.current.seek(newTime);
    }
  };

  if (loading) {
    return <div className="loading">Loading song...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="lyrics-player">
      <div className="song-info">
        <h1>{song.title}</h1>
        <h2>{song.artist}</h2>
        {song.album && <p>Album: {song.album}</p>}
      </div>

      <div className="audio-controls">
        <button onClick={togglePlay} className="play-button">
          {isPlaying ? '⏸' : '⏵'}
        </button>
        <input
          type="range"
          min="0"
          max={song.duration}
          value={currentTime}
          onChange={handleSeek}
          className="seek-bar"
        />
        <span className="time-display">
          {formatTime(currentTime)} / {formatTime(song.duration)}
        </span>
      </div>

      <LyricsDisplay 
        lyrics={song.lyrics} 
        currentTime={currentTime} 
        duration={song.duration} 
      />
    </div>
  );
};

// Helper function to format time (seconds to MM:SS)
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default LyricsPlayer;