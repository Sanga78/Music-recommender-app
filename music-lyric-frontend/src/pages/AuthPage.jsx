import { useState } from 'react';
import { motion } from 'framer-motion';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import '../styles/Auth.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="auth-container"
    >
      <div className="auth-tabs">
        <button
          className={isLogin ? 'active' : ''}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          className={!isLogin ? 'active' : ''}
          onClick={() => setIsLogin(false)}
        >
          Register
        </button>
      </div>

      {isLogin ? <Login /> : <Register />}
    </motion.div>
  );
};

export default AuthPage;