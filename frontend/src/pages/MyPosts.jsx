import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/MyPosts.css";
import { toast, ToastContainer } from "react-toastify";
import BackButton from "../components/BackButton";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // Fetch my posts
  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchMyPosts = async () => {
      try {
        const { data } = await api.get("/posts/myposts");
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err.response?.data || err.message);
        toast.error("Failed to load your posts");
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [isLoggedIn]);

  // Delete post
  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      try {
        await api.delete(`/posts/${id}`);
        setPosts((prev) => prev.filter((post) => post._id !== id));
        toast.success("Post deleted successfully!");
      } catch (err) {
        console.error("Error deleting post:", err.response?.data || err.message);
        toast.error("Failed to delete post");
      }
    },
    []
  );

  // Edit post
  const handleEdit = useCallback(
    (id) => {
      navigate(`/edit/${id}`);
    },
    [navigate]
  );

  if (!isLoggedIn)
    return (
      <div className="not-login">
        <p>Please log in to see your posts</p>
        <button onClick={() => navigate("/auth")}>Login</button>
      </div>
    );

  if (loading) return <p style={{ textAlign: "center" }}>Loading your posts...</p>;

  if (posts.length === 0)
    return (
      <div className="no-post">
        <p>You have no posts yet.</p>
        <button onClick={() => navigate("/create")}>Create post</button>
      </div>
    );

  return (
    <div className="myposts-container">
      <BackButton fallback="/" className="back-button" />
      <h2>My Posts</h2>
      <div className="posts-list">
        {posts.map((post) => (
          <div key={post._id} className="post-card">
            <div className="img-div">
              {post.image && (
                <img src={`http://localhost:5000${post.image}`} alt={post.title} />
              )}
            </div>
            <div className="post-info">
              <h3>{post.title}</h3>
              <p>{post.subtitle}</p>
              <p>
                <strong>Category:</strong> {post.category || "N/A"}
              </p>
              <p
                dangerouslySetInnerHTML={{
                  __html: post.content?.substring(0, 100),
                }}
              />
              <div className="post-actions">
                <button onClick={() => handleEdit(post._id)}>Edit</button>
                <button onClick={() => handleDelete(post._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
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

export default MyPosts;
