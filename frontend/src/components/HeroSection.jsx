import './HeroSection.css';
import Hero from '../assets/images/Hero.jpg';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      {/* Animated text section */}
      <motion.div
        className="hero-text"
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Welcome to My Blog
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          Explore blogs that spark creativity, share knowledge, and connect curious minds from all corners of the world — where ideas grow, stories inspire, and learning never stops.
        </motion.p>

        <motion.button
          className="hero-btn"
          onClick={() => navigate("/auth")}
          aria-label="Get Started"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          Get Started
        </motion.button>
      </motion.div>

      {/* Animated image section */}
      <motion.div
        className="hero-image"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
      >
        <img
          src={Hero}
          alt="Hero section illustration"
          loading="lazy"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
