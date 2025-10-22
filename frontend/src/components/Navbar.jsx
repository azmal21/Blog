import { Link } from "react-router-dom";
import "./Navbar.css";
import { useState, useEffect } from "react";
import useDarkModeStore from "../store/darkModeStore";
import Notification from "../components/Notification";
import { FaBars, FaTimes, FaHome, FaPlusSquare, FaBookOpen, FaUser } from "react-icons/fa";
import { HiSun, HiMoon } from "react-icons/hi";
import { toast, ToastContainer } from "react-toastify";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkModeStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    toast.error("You’ve been Logged out");
    setIsLoggedIn(false);
    setMenuOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home", icon: <FaHome /> },
    { to: "/create", label: "Create Post", icon: <FaPlusSquare /> },
    { to: "/my-post", label: "My Post", icon: <FaBookOpen /> },
    { to: "/profile", label: "Profile", icon: <FaUser /> },
  ];

  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <div className="navbar-left">
        <div className="logo">
          <Link to="/">Writeer</Link>
        </div>
      </div>

      {/* Center: Nav Links */}
      <ul className={`nav-links center ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <li key={link.to}>
            <Link to={link.to} onClick={() => setMenuOpen(false)}>
              <span className="mobile-icon">{link.icon}</span>
              {link.label}
            </Link>
          </li>
        ))}

        {isLoggedIn && (
          <li className="mobile-logout" onClick={handleLogout}>
            Logout
          </li>
        )}
      </ul>

      {/* Right side */}
      <div className="navbar-right">
        {isLoggedIn && <Notification />}

        <div className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? (
            <HiSun style={{ color: "#facc15", fontSize: "30px", cursor: "pointer" }} />
          ) : (
            <HiMoon style={{ color: "#f59e0b", fontSize: "28px", cursor: "pointer" }} />
          )}
        </div>

        {!isLoggedIn ? (
          <Link to="/auth">
            <button className="login-button button">Explore</button>
          </Link>
        ) : (
          <button className="logout-button" onClick={handleLogout}>
            LogOut
          </button>
        )}

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </nav>
  );
};

export default Navbar;
