import { useState } from "react";
import BlogCard from "./BlogCards";
import "./BlogList.css";

const BlogList = ({ posts }) => {
  const INITIAL_LOAD = 12;
  const LOAD_MORE_COUNT = 8;

  const [visiblePosts, setVisiblePosts] = useState(INITIAL_LOAD);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = () => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);

    // Simulate a small delay for UX (spinner)
    setTimeout(() => {
      setVisiblePosts((prev) => Math.min(prev + LOAD_MORE_COUNT, posts.length));
      setLoading(false);
    }, 500); // 0.5 second is smoother than 1s
  };

  if (!posts || posts.length === 0) return <p>No posts available.</p>;

  return (
    <div className="blog-list-container">
      <h1 className="post-heading">Top Posts</h1>
      <div className="all-posts">
        {posts.slice(0, visiblePosts).map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>

      {visiblePosts < posts.length && (
        <div className="load-more-container">
          <button
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogList;
