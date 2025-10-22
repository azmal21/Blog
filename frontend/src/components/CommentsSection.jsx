import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import CommentForm from "./CommentForm";
import "./CommentsSection.css";

const CommentsSection = ({ postId, isLoggedIn }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/${postId}/comments?limit=50`);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Add new comment
  const handleAdd = (newComment) => {
    setComments((prev) => [newComment, ...prev]); // newest first
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="comments-section">
      <h3>Comments ({comments.length})</h3>

      {isLoggedIn && <CommentForm postId={postId} onAdd={handleAdd} />}

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} className="comment-item">
            <div className="comment-user">
              <img
                src="/default-avatar.jpg"
                alt={comment.userId?.username || "User"}
                className="avatar"
              />
            </div>
            <div className="comment-content">
              <span className="username">{comment.userId?.username || "User"}</span>
              <p>{comment.content}</p>
              <small>{formatTimeAgo(comment.createdAt)}</small>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentsSection;
