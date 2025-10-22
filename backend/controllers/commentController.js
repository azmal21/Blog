const sanitizeHtml = require("sanitize-html");
const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.getCommentsById = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 20);
    const skip = (page - 1) * limit;

    // Use "postId" here (not "post")
    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username name avatar');

    const total = await Comment.countDocuments({ postId });

    res.json({ comments, total, page, limit });
  } catch (err) {
    res.status(500).json({ msg: 'Server error ' });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    let { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Sanitize to avoid XSS
    content = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });

    const comment = new Comment({
      postId,          // ✅ match schema
      userId: req.user.id,
      content,
    });

    await comment.save();

    // Increment comment count in Post (optional)
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }).catch(() => {});

    // Populate user for immediate return
    const populated = await comment.populate('userId', 'username avatar');

    res.status(201).json({ comment: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
