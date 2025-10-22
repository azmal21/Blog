import './App.css';
import { Routes, Route, useLocation } from "react-router-dom";
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import CreatePost from './pages/CreatePost';
import SinglePost from './pages/SinglePost';
import MyPosts from './pages/MyPosts';
import EditPost from './pages/EditPost';
import useDarkModeStore from './store/darkModeStore';
import { useEffect } from 'react';
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { darkMode, setDarkMode } = useDarkModeStore();
  const location = useLocation();

  useEffect(() => {
    // load from localStorage
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      setDarkMode(JSON.parse(saved));
    }
  }, [setDarkMode]);

  useEffect(() => {
    // apply class to <body>
    if (darkMode) {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }
  }, [darkMode]);


  const shouldNavbar = location.pathname === "/";

  return (
    <>
      {shouldNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/post/:id" element={<SinglePost />} />

        {/* Protected Routes */}
        <Route path="/edit/:id" element={<EditPost />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/my-post" element={<MyPosts />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>


  );
}

export default App;
