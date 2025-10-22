import { FaInstagram, FaGithub, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Footer.css";
import FeedbackPopup from "./FeedbackPopup";

const Footer = () => {
  const [totals, setTotals] = useState({ totalLikes: 0, totalViews: 0 });
   const [isFeedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    let isMounted = true; // to prevent state update if component unmounts

    const fetchTotals = async () => {
      try {
        const res = await api.get("/stats/totals");
        if (isMounted) setTotals(res.data || { totalLikes: 0, totalViews: 0 });
      } catch (err) {
        console.error("Error fetching totals:", err);
      }
    };

    fetchTotals();

    return () => {
      isMounted = false;
    };
  }, []);

  const socialLinks = [
    { icon: <FaInstagram />, url: "https://www.instagram.com/azmal_ajju21/" },
    { icon: <FaGithub />, url: "https://github.com/azmal21" },
    { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/mahammad-azmal-455a0326a/" },
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h2 className="footer-logo">Writeer</h2>
          <p>A place to learn, explore, and connect with ideas that matter</p>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/create">Create Post</Link></li>
            <li><Link to="/my-post">My Post</Link></li>
            <li><button onClick={() => setFeedbackOpen(true)} className="feedback-btn">Feedback</button></li>
          </ul>
        </div>

        <div className="footer-section social">
          <h3>Follow Me</h3>
          <div className="social-icons">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-section likes-views">
          <p>Total Likes: {totals.totalLikes}</p>
          <p>Total Views: {totals.totalViews}</p>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Writeer. All rights reserved.
      </div>
       <FeedbackPopup isOpen={isFeedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </footer>
  );
};

export default Footer;
