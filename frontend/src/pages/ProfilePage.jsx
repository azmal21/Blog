import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/ProfilePage.css";
import { toast, ToastContainer } from "react-toastify";
import BackButton from "../components/BackButton";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState("");
  const navigate = useNavigate();

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in first");
          navigate("/auth");
          return;
        }

        const { data } = await api.get("/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(data);
        setNewBio(data.bio || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.response?.status === 401) {
          toast.error("Invalid or expired token");
          localStorage.removeItem("token");
          navigate("/auth");
        } else {
          toast.error("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Save bio
  const handleBioSave = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      await api.put(
        "/profile/update-bio",
        { bio: newBio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser({ ...user, bio: newBio });
      setEditingBio(false);
      toast.success("Bio updated successfully!");
    } catch (error) {
      console.error("Error updating bio:", error);
      toast.error("Failed to update bio");
    }
  }, [newBio, user]);

  if (loading) return <div className="loading">Loading profile...</div>;

  if (!user)
    return <p className="no-user">User not found</p>;

  return (
    <div className="profile-page">
      <BackButton fallback="/" className="back-button" />
      <div className="user-section">
        <div className="avatar">
          {user.username ? user.username.charAt(0).toUpperCase() : "U"}
        </div>

        <div className="user-info">
          <h2>{user.username}</h2>
          <p className="email">{user.email}</p>

          {/* Bio Section */}
          {editingBio ? (
            <div className="bio-edit">
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="Write something about yourself..."
              />
              <div className="bio-buttons">
                <button className="save-btn" onClick={handleBioSave}>
                  Save
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setNewBio(user.bio || "");
                    setEditingBio(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bio-section">
              <p className="bio">{user.bio || "No bio added yet."}</p>
              <button
                className="edit-bio-btn"
                onClick={() => setEditingBio(true)}
              >
                Edit Bio
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-buttons">
        <button onClick={() => navigate("/create")} className="primary-btn">
          Create Post
        </button>
        <button onClick={() => navigate("/my-post")} className="secondary-btn">
          My Post
        </button>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default ProfilePage;
