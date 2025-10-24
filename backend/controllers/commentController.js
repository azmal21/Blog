import sanitizeHtml from "sanitize-html";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

// ✅ Get comments for a post with pagination
export const getCommentsById = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username name avatar");

    const total = await Comment.countDocuments({ postId });

    res.json({ comments, total, page, limit });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Create a new comment
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    let { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Sanitize to prevent XSS
    content = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });

    const comment = new Comment({
      postId,
      userId: req.user._id,
      content,
    });

    await comment.save();

    // Optionally increment comment count in Post
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }).catch(() => {});

    // Populate user for immediate return
    const populated = await comment.populate("userId", "username avatar");

    res.status(201).json({ comment: populated });
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ message: "Server error" });
  }
};
