import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-quill/dist/quill.snow.css";
import "../styles/CreatePost.css";
import api from "../services/api";

const DEFAULT_CATEGORIES = ["Programming", "Food", "Travel", "Education", "Others"];

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const imageRef = useRef();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    category: "",
    tags: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // ✅ Memoized Quill toolbar and formats
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ["blockquote", "code-block"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "align",
      "color",
      "background",
      "blockquote",
      "code-block",
    ],
    []
  );

  // ✅ Fetch existing post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in first!");
          navigate("/auth");
          return;
        }

        const { data } = await api.get(`/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          title: data.title || "",
          subtitle: data.subtitle || "",
          content: data.content || "",
          category: data.category || "",
          tags: data.tags ? data.tags.join(", ") : "",
        });

        // Check if the category is not in default categories → treat as custom
        if (data.category && !DEFAULT_CATEGORIES.includes(data.category)) {
          setIsCustomCategory(true);
          setCustomCategory(data.category);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        toast.error(err.response?.data?.message || "Failed to fetch post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  // ✅ Handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback((e) => {
    setImage(e.target.files[0]);
  }, []);

  const handleCategoryChange = useCallback((e) => {
    const value = e.target.value;
    if (value === "custom") {
      setIsCustomCategory(true);
      setFormData((prev) => ({ ...prev, category: "" }));
    } else {
      setIsCustomCategory(false);
      setCustomCategory("");
      setFormData((prev) => ({ ...prev, category: value }));
    }
  }, []);

  const handleCustomCategoryChange = useCallback((e) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData((prev) => ({ ...prev, category: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        const data = new FormData();
        for (const key in formData) {
          const value =
            key === "tags"
              ? formData[key]
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .join(",")
              : formData[key];
          data.append(key, value);
        }

        if (image) data.append("image", image);

        const token = localStorage.getItem("token");
        const res = await api.put(`/posts/${id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success(res.data.message || "Post updated successfully!");
        setTimeout(() => navigate("/my-post"), 2000);
      } catch (err) {
        console.error("Error updating post:", err);
        toast.error(err.response?.data?.message || "Error updating post");
      }
    },
    [formData, image, id, navigate]
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading post...</p>
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <h2>Edit Post</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="subtitle"
          placeholder="Subtitle"
          value={formData.subtitle}
          onChange={handleChange}
          required
        />

        <ReactQuill
          theme="snow"
          value={formData.content}
          onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
          modules={modules}
          formats={formats}
          placeholder="Edit your content..."
          className="quill"
        />

        {!isCustomCategory ? (
          <select
            name="category"
            value={formData.category}
            onChange={handleCategoryChange}
            required
            className="category"
          >
            <option value="">Select a category</option>
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="custom">Create New Category</option>
          </select>
        ) : (
          <input
            type="text"
            name="customCategory"
            placeholder="Type your new category"
            value={customCategory}
            onChange={handleCustomCategoryChange}
            className="custom-category-input"
            required
          />
        )}

        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated)"
          value={formData.tags}
          onChange={handleChange}
        />

        <input type="file" onChange={handleImageChange} ref={imageRef} />

        <button type="submit">Update Post</button>
      </form>

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

export default EditPost;
