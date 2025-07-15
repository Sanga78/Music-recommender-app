import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaMusic, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="navbar"
    >
      <div className="logo-container">
        <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
          <FaMusic /> LyricFlow
        </Link>
      </div>

      <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
        <li>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
        </li>
        <li>
          <Link to="/songs" onClick={() => setIsMobileMenuOpen(false)}>Songs</Link>
        </li>

        {user ? (
          <>
            <li>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                <FaUser /> Profile
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt /> Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
          </li>
        )}
      </ul>

      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
    </motion.nav>
  );
};

export default Navbar;