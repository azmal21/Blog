import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import HeroSection from "../components/HeroSection";
import BlogList from "../components/BlogList";
import Footer from "../components/Footer";
import usePostStore from "../store/postStore";
import "../styles/HomePage.css";

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
          setPosts(data); // save to store
        } catch (err) {
          console.error("Error fetching posts:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchPosts();
    }
  }, [posts.length, setPosts]);

  // Get unique categories (memoized)
  const categories = useMemo(() => {
    const cats = posts.map((post) => post.category);
    return ["All", ...new Set(cats)];
  }, [posts]);

  // Filtered posts (memoized)
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

  if (loading) return <p>Loading posts...</p>;

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
            className={`category-btn ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <BlogList posts={filteredPosts} />
      <Footer />
    </div>
  );
};

export default HomePage;
