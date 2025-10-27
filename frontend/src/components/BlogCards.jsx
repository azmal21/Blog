import { Link } from "react-router-dom";
import "./BlogCard.css";
import { AiOutlineHeart, AiOutlineEye } from "react-icons/ai";

const BlogCard = ({ post }) => {
  const likesCount = post.likes?.length ?? 0;
  const viewsCount = post.views ?? 0;

  const imageUrl = post.image
    ? post.image.startsWith("http")
      ? post.image // Cloudinary URL
      : post.image // fallback to local uploads, will prepend server URL below
        ? `https://blog-coz5.onrender.com${post.image}`
        : "/default-image.jpg"
    : "/default-image.jpg";


  return (
    <Link to={`/post/${post._id}`} style={{ textDecoration: "none" }}>
      <div className="blog-card">
        <img src={imageUrl} alt={post.title || "blog-image"} className="blog-card-image" />

        <div className="blog-card-content">
          <h2 className="blog-card-title">{post.title}</h2>
          <h4 className="blog-card-subtitle">{post.subtitle}</h4>

          <p
            className="blog-card-text"
            dangerouslySetInnerHTML={{ __html: post.content?.substring(0, 100) || "" }}
          />

          <div className="likes-views">
            <span className="like">
              <AiOutlineHeart className="heart-icon" /> {likesCount}
            </span>
            <span className="view">
              <AiOutlineEye className="view-icon" /> {viewsCount}
            </span>
            <small className="blog-card-author">
              By {post.authorId?.username || "Unknown"}
            </small>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;


