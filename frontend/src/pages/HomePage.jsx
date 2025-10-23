import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import HeroSection from "../components/HeroSection";
import BlogList from "../components/BlogList";
import Footer from "../components/Footer";
import usePostStore from "../store/postStore";
import "../styles/HomePage.css";

const SKELETON_COUNT = 8; // number of skeleton cards to show

const HomePage = () => {
  const { posts, setPosts } = usePostStore(); // get posts from store
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch posts only if not already in store
  useEffect(() => {
    if (posts.length === 0) {
      const fetchPosts = async () => {
        try {
          setLoading(true);
          const { data } = await api.get("/posts");
          setPosts(data);
        } catch (err) {
          console.error("Error fetching posts:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPosts();
    }
  }, [posts.length, setPosts]);

  // Unique categories
  const categories = useMemo(() => {
    const cats = posts.map((post) => post.category);
    return ["All", ...new Set(cats)];
  }, [posts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const categoryMatch =
        selectedCategory === "All" ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      const lowerSearch = searchTerm.toLowerCase();
      const searchMatch =
        post.title.toLowerCase().includes(lowerSearch) ||
        post.authorId?.username?.toLowerCase().includes(lowerSearch) ||
        post.category.toLowerCase().includes(lowerSearch) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(lowerSearch));

      return categoryMatch && searchMatch;
    });
  }, [posts, selectedCategory, searchTerm]);

  // Skeleton loader JSX
  const renderSkeletons = () => {
    return Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <div key={i} className="skeleton-card">
        <div className="skeleton-image" />
        <div className="skeleton-title" />
        <div className="skeleton-subtitle" />
      </div>
    ));
  };

  return (
    <div className="home-page-container">
      <HeroSection />

      <input
        type="text"
        placeholder="Search by title, author, tag or category..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? "active" : ""}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Post List / Skeletons */}
      <div className="posts-section">
        {loading ? (
          <div className="skeleton-grid">{renderSkeletons()}</div>
        ) : (
          <BlogList posts={filteredPosts} />
        )}
      </div>


      <Footer />
    </div>
  );
};

export default HomePage;
