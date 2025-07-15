import { useEffect, useState } from 'react';
import '../styles/LyricsDisplay.css';

const LyricsDisplay = ({ lyrics, currentTime, duration }) => {
  const [syncedLyrics, setSyncedLyrics] = useState([]);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);

  useEffect(() => {
    // Parse lyrics with timestamps (assuming LRC format)
    const lines = lyrics.split('\n').map(line => {
      const match = line.match(/^\[(\d+):(\d+)\.(\d+)\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const hundredths = parseInt(match[3]);
        const text = match[4].trim();
        const time = minutes * 60 + seconds + hundredths / 100;
        return { time, text };
      }
      return null;
    }).filter(Boolean);

    setSyncedLyrics(lines);
  }, [lyrics]);

  useEffect(() => {
    if (!syncedLyrics.length) return;

    // Find the current active line based on time
    let activeIndex = -1;
    for (let i = 0; i < syncedLyrics.length; i++) {
      if (syncedLyrics[i].time <= currentTime) {
        activeIndex = i;
      } else {
        break;
      }
    }
    setActiveLineIndex(activeIndex);
  }, [currentTime, syncedLyrics]);

  return (
    <div className="lyrics-container">
      <div className="lyrics-scroll">
        {syncedLyrics.map((line, index) => (
          <div 
            key={index}
            className={`lyrics-line ${index === activeLineIndex ? 'active' : ''}`}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LyricsDisplay;