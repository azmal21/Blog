import React, { useState } from "react";
import api from "../services/api";
import "./CommentForm.css";

const CommentForm = ({ postId, onAdd }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    setLoading(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: trimmedContent });
      onAdd(res.data.comment); // Add new comment to list
      setContent(""); // Reset input
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error posting comment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        rows={2}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !content.trim()}>
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
};

export default CommentForm;
