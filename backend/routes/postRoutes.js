const express = require("express");
const { createPost, getAllPosts, getPostById, updatePost, deletePost, toggleLike, getMyPosts } = require("../controllers/postController");
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // fixed typo
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // fixed typo
    }
});

const upload = multer({ storage });

router.get('/myposts', authMiddleware, getMyPosts);

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Protected routes

router.post('/', authMiddleware, upload.single("image"), createPost);
router.put('/:id', authMiddleware, upload.single("image"), updatePost);
router.delete('/:id', authMiddleware, deletePost);
router.put('/:id/like', authMiddleware, toggleLike);

module.exports = router;
