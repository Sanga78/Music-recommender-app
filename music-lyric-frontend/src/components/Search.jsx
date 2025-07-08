import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Search = ({ token }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [history, setHistory] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        setIsSearching(true);
        try {
            // 1. Call search endpoint
            const response = await fetch(`http://localhost:8000/api/search/?q=${query}`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            const data = await response.json();
            setResults(data.results || []);
            
            // 2. Refresh search history
            const historyRes = await fetch('http://localhost:8000/api/search-history/', {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setHistory((await historyRes.json()).reverse());
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for songs or artists..."
                />
                <button type="submit" disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Search'}
                </button>
            </form>

            {/* Search Results */}
            <div className="results">
                {results.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="result-card"
                    >
                        <img src={item.image} alt={item.title} />
                        <div>
                            <h3>{item.title}</h3>
                            <p>{item.artist}</p>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                View Lyrics
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Search History */}
            <div className="history">
                <h3>Recent Searches</h3>
                <ul>
                    {history.map((item) => (
                        <li key={item.id} onClick={() => setQuery(item.query)}>
                            {item.query}
                            <span>{new Date(item.created_at).toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Search;