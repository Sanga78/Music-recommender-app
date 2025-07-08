import { useState, useEffect } from 'react';
import { getSearchHistory } from '../services/auth';

const Search = ({ token }) => {
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (token) {
      getSearchHistory(token).then(res => setHistory(res.data));
    }
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic here
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
        />
        <button type="submit">Search</button>
      </form>
      
      <h3>Recent Searches</h3>
      <ul>
        {history.map(item => (
          <li key={item.id}>{item.query} - {new Date(item.created_at).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
};