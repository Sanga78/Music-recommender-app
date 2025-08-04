import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/SongDetail.css';

const SongDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songRes, commentsRes] = await Promise.all([
          axios.get(`http://localhost:8000/songs/${id}/`),
          axios.get(`http://localhost:8000/songs/${id}/comments/`)
        ]);
        
        setSong(songRes.data);
        setUserVote(songRes.data.user_vote || 0);
        setComments(commentsRes.data);
        
        // Log view interaction if authenticated
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
        toast.error('Failed to load song data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleVote = async (voteValue) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    try {
      const newVote = userVote === voteValue ? 0 : voteValue;
      await axios.post(
        `http://localhost:8000/songs/${id}/vote/`,
        { vote: newVote },
        {
          headers: {
            'Authorization': `Token ${user.token}`
          }
        }
      );
      
      // Optimistic UI update
      setSong(prev => ({
        ...prev,
        upvotes: newVote === 1 ? 
          (userVote === 1 ? prev.upvotes - 1 : prev.upvotes + 1) : 
          (userVote === 1 ? prev.upvotes - 1 : prev.upvotes),
        downvotes: newVote === -1 ? 
          (userVote === -1 ? prev.downvotes - 1 : prev.downvotes + 1) : 
          (userVote === -1 ? prev.downvotes - 1 : prev.downvotes),
        vote_score: prev.vote_score + (newVote - userVote)
      }));
      
      setUserVote(newVote);
      toast.success(`Vote ${newVote === 1 ? 'up' : 'down'} recorded`);
    } catch (error) {
      toast.error('Failed to submit vote');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/songs/${id}/comments/`,
        { text: newComment },
        {
          headers: {
            'Authorization': `Token ${user.token}`
          }
        }
      );
      
      setComments([response.data, ...comments]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return <div className="song-loading">Loading song...</div>;
  }

  return (
    <div className="song-detail-container">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={song.audio_url || song.audio_file}
        preload="metadata"
      />
      
      <div className="song-header">
        <h1>{song.title}</h1>
        <h2>by {song.artist}</h2>
        
        <div className="vote-section">
          <button 
            onClick={() => handleVote(1)}
            className={`vote-btn upvote ${userVote === 1 ? 'active' : ''}`}
            aria-label="Upvote lyrics"
          >
            👍 {song.upvotes}
          </button>
          
          <span className="vote-score">{song.vote_score}</span>
          
          <button 
            onClick={() => handleVote(-1)}
            className={`vote-btn downvote ${userVote === -1 ? 'active' : ''}`}
            aria-label="Downvote lyrics"
          >
            👎 {song.downvotes}
          </button>
        </div>
        
        <button 
          onClick={togglePlayPause}
          className="play-btn"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>

      <div className="song-lyrics">
        <h3>Lyrics</h3>
        <pre>{song.lyrics}</pre>
      </div>

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about these lyrics..."
            rows="3"
          />
          <button type="submit" className="submit-comment">
            Post Comment
          </button>
        </form>
        
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{comment.user}</span>
                <span className="comment-date">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SongDetail;