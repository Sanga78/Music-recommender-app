import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import PlayerCard from '../components/PlayerCard';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero />
      <PlayerCard />
      <Footer />
    </motion.div>
  );
};
export default Home;