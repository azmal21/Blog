const express = require("express");
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const commentController = require("../controllers/commentController");

router.get('/posts/:postId/comments', commentController.getCommentsById);

router.post('/posts/:postId/comments', auth, commentController.createComment);

module.exports = router