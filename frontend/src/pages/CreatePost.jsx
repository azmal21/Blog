import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-quill/dist/quill.snow.css";
import "../styles/CreatePost.css";
import BackButton from "../components/BackButton";
import api from "../services/api";

const INITIAL_FORM = {
  title: "",
  subtitle: "",
  content: "",
  category: "",
  tags: "",
};

const DEFAULT_CATEGORIES = ["Programming", "Travel", "Education", "Movie"];

const CreatePost = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [image, setImage] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const imageRef = useRef();
  const navigate = useNavigate();

  // ✅ Quill toolbar and formats (memoized)
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

  // ✅ Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in first!");
      navigate("/auth");
    } else {
      setAuthChecked(true);
    }
  }, [navigate]);

  // ✅ Handlers (all stable with useCallback)
  const handleChange = useCallback(
    (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value })),
    []
  );

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
      setFormData((prev) => ({ ...prev, category: value }));
    }
  }, []);

  const handleCustomCategoryChange = useCallback((e) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData((prev) => ({ ...prev, category: value }));
  }, []);

  const handleGenerateAI = useCallback(async () => {
    if (!formData.title || !formData.subtitle) return;
    try {
      setLoadingAI(true);
      const { data } = await api.post("ai/generate", {
        title: formData.title,
        subtitle: formData.subtitle,
      });
      setFormData((prev) => ({ ...prev, content: data.content }));
      toast.success("AI content generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "AI generation failed");
    } finally {
      setLoadingAI(false);
    }
  }, [formData.title, formData.subtitle]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const data = new FormData();
        for (const key in formData) data.append(key, formData[key]);
        if (image) data.append("image", image);

        const token = localStorage.getItem("token");
        const res = await api.post("/posts", data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success(res.data.message || "Post created successfully!");

        setFormData(INITIAL_FORM);
        setImage(null);
        imageRef.current.value = "";
        setIsCustomCategory(false);
        setCustomCategory("");

        setTimeout(() => navigate("/"), 1500);
      } catch (err) {
        toast.error(err.response?.data?.message || "Error creating post");
      }
    },
    [formData, image, navigate]
  );

  // ✅ Move conditional render *here*, not before hooks
  if (!authChecked) {
    return (
      <div className="checking-auth">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <BackButton fallback="/" className="back-button"/>
      <h2>Create New Post</h2>

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

        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={!formData.title || !formData.subtitle || loadingAI}
          className="generate-ai-btn"
        >
          {loadingAI ? "Generating..." : "Generate with AI"}
        </button>

        <ReactQuill
          theme="snow"
          value={formData.content}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, content: value }))
          }
          modules={modules}
          formats={formats}
          placeholder="Write your content here..."
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
          required
        />

        <input type="file" onChange={handleImageChange} ref={imageRef} />

        <button type="submit">Create Post</button>
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

export default CreatePost;
