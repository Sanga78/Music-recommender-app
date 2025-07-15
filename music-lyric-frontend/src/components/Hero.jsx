import '../styles/Hero.css';
import Search from '../components/Search';
import { Link, useNavigate } from 'react-router-dom';
const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Discover Song Lyrics</h1>
        <p>Find, read, and rate lyrics for your favorite songs</p>
        <Search/>
      </div>
    </section>
    
  );
};

export default Hero;

