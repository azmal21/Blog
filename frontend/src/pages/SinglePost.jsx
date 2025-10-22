import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import jwtDecode from "jwt-decode";
import CommentsSection from "../components/CommentsSection";
import "../styles/SinglePost.css";
import { AiOutlineHeart, AiFillHeart, AiOutlineEye, AiOutlineShareAlt } from "react-icons/ai";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { MdStopCircle } from "react-icons/md";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import BackButton from "../components/BackButton";

const SinglePost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [authorBio, setAuthorBio] = useState("");
  const [bioLoading, setBioLoading] = useState(false);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const userId = useMemo(() => (token ? jwtDecode(token).userId : null), [token]);

  // Fetch post
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data);
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // Fetch author bio on hover
  const fetchAuthorBio = useCallback(async () => {
    if (!post?.authorId?.username || authorBio) return;
    try {
      setBioLoading(true);
      const { data } = await api.get(`/users/bio/${post.authorId.username}`);

      setAuthorBio(data.bio || "Bio not available");
    } catch (err) {
      console.error("Error fetching bio:", err);
      setAuthorBio("Bio not available");
    } finally {
      setBioLoading(false);
    }
  }, [post?.authorId?.username, authorBio]);

  // Handle like
  const handleLike = useCallback(async () => {
    if (!token) return alert("Please login to like this post");
    try {
      const { data } = await api.put(
        `/posts/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost((prev) => ({ ...prev, likes: data.likes }));
    } catch (err) {
      console.error("Error liking post:", err.response?.data || err.message);
    }
  }, [id, token]);

  // Text-to-speech
  const handleSpeak = useCallback(() => {
    if (!post?.content) return;

    window.speechSynthesis.cancel();
    const text = post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 0.95;
    speech.pitch = 1;
    speech.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => ["Google US English", "Microsoft Zira", "Samantha"].some((name) => v.name.includes(name))
    );
    if (preferredVoice) speech.voice = preferredVoice;

    speech.text = text.replace(/([.!?])\s/g, "$1 ...");
    speech.onstart = () => setIsReading(true);
    speech.onend = speech.onerror = () => setIsReading(false);

    window.speechSynthesis.speak(speech);
  }, [post?.content]);

  const handleStop = useCallback(() => window.speechSynthesis.cancel(), []);

  // Share
  const handleShare = useCallback(async () => {
    if (!post) return;
    const postUrl = `${window.location.origin}/post/${id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: "Check out this blog post!",
          url: postUrl,
        });
      } catch (err) {
        console.error("Share canceled or failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  }, [id, post]);

  if (loading) return <p className="loading-text">Loading post...</p>;
  if (!post) return <p className="error-text">Post not found.</p>;

  const isLiked = post.likes?.includes(userId);

  return (
    <div className="single-post-container">
      <BackButton fallback="/" className="back-button" />
      <p className="post-date">
        <strong>Published on:</strong>{" "}
        {post.createdAt
          ? new Date(post.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          : "N/A"}
      </p>

      <h1 className="single-post-title">{post.title}</h1>
      <h3 className="single-post-subtitle">{post.subtitle}</h3>

      {/* Author with hover tooltip */}
      <p
        className="post-author"
        data-tooltip-id={`bio-${post.authorId?.username}`}
        data-tooltip-content={authorBio || "No bio available"}
        onMouseEnter={fetchAuthorBio}
      >
        <strong>Author:</strong> {post.authorId?.username || "Unknown"}
      </p>

      <Tooltip
        id={`bio-${post.authorId?.username}`}
        place="top"
        effect="solid"
      />


      {post.image && (
        <div className="single-post-image-wrapper">
          <img src={`http://localhost:5000${post.image}`} alt={post.title} className="single-post-image" />
        </div>
      )}

      <div className="single-post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* TTS & Share */}
      <div className="speech-buttons">
        <button onClick={handleSpeak} className="tts-button">
          {isReading ? <><HiSpeakerXMark /> Reading...</> : <><HiSpeakerWave /> Read Post</>}
        </button>
        <button onClick={handleStop} className="tts-stop-button"><MdStopCircle /> Stop</button>
        <button onClick={handleShare} className="share-button"><AiOutlineShareAlt /> Share</button>
      </div>

      {/* Likes & Views */}
      <div className="single-post-meta">
        {isLoggedIn ? (
          <button className="like-button" onClick={handleLike}>
            {isLiked ? <AiFillHeart color="red" size={22} /> : <AiOutlineHeart size={20} />} {post.likes?.length ?? 0} {post.likes?.length === 1 ? "Like" : "Likes"}
          </button>
        ) : (
          <div className="like-placeholder">
            <AiFillHeart /> {post.likes?.length ?? 0} {post.likes?.length === 1 ? "Like" : "Likes"} <span className="login-warning">(Login to like)</span>
          </div>
        )}
        <p className="views"><AiOutlineEye size={20} />: {post.views ?? 0} views</p>
      </div>

      {/* Comments */}
      <CommentsSection postId={post._id} isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default SinglePost;
