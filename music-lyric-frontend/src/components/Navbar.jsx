import { useState } from 'react';
import { FaBars, FaTimes, FaMusic } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './styles/Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo">
        <FaMusic /> LyricFlow
      </div>
      <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/lyrics">Lyrics</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
    </nav>
  );
};

export default Navbar;