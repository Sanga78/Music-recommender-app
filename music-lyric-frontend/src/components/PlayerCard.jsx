import './styles/PlayerCard.css';

const PlayerCard = () => {
  return (
    <div className="player-card">
      <div className="album-art"></div>
      <div className="player-controls">
        <h3>Now Playing</h3>
        <p>Artist - Song Title</p>
        <div className="progress-bar"></div>
        <div className="buttons">
          <button>⏮</button>
          <button>▶</button>
          <button>⏭</button>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;