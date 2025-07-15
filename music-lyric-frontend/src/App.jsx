import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import SongList from './pages/SongList';
import SongDetail from './pages/SongDetail';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home currentSong={currentSong} isPlaying={isPlaying} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route 
            path="/songs" 
            element={
              <SongList 
                setCurrentSong={setCurrentSong} 
                setIsPlaying={setIsPlaying} 
              />
            } 
          />
          <Route 
            path="/songs/:id" 
            element={
              <SongDetail 
                currentSong={currentSong} 
                setCurrentSong={setCurrentSong}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              />
            } 
          />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;