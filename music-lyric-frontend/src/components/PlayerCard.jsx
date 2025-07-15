import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/PlayerCard.css';

const PlayerCard = () => {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLyric, setCurrentLyric] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/songs/${id}/player/`);
        setSong(response.data);
      } catch (error) {
        console.error('Error fetching song:', error);
      }
    };

    if (id) fetchSong();
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song) return;

    const updateLyrics = () => {
      if (song.lyrics_timestamps) {
        // Find the current lyric based on playback time
        const currentTimestamp = audio.currentTime;
        const lyricObj = song.lyrics_timestamps.findLast(
          (item) => currentTimestamp >= item.timestamp
        );
        setCurrentLyric(lyricObj?.text || song.lyrics);
      } else {
        setCurrentLyric(song.lyrics);
      }
    };

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      updateLyrics();
    };

    audio.addEventListener('timeupdate', updateTime);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
    };
  }, [song]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!song) return <div className="loading">Loading player...</div>;

  return (
    <div className="player-card">
      <audio
        ref={audioRef}
        src={song.audio_url || song.audio_file}
        preload="metadata"
      />

      <div className="album-art">
        {song.image_url && (
          <img src={song.image_url} alt={`${song.title} album art`} />
        )}
      </div>

      <div className="player-controls">
        <h3>Now Playing</h3>
        <p className="song-info">{song.artist} - {song.title}</p>
        
        <div className="lyrics-display">
          {currentLyric || song.lyrics}
        </div>

        <div className="progress-container">
          <span className="time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={audioRef.current?.duration || 100}
            value={currentTime}
            onChange={(e) => {
              audioRef.current.currentTime = e.target.value;
              setCurrentTime(e.target.value);
            }}
            className="progress-bar"
          />
          <span className="time">{formatTime(audioRef.current?.duration || 0)}</span>
        </div>

        <div className="controls">
          <button onClick={() => { audioRef.current.currentTime -= 10 }}>
            ⏪ 10s
          </button>
          <button onClick={togglePlayPause} className="play-pause">
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={() => { audioRef.current.currentTime += 10 }}>
            10s ⏩
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;