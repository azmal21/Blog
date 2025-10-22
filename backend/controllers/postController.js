import mongoose from "mongoose";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { title, subtitle, content, category, tags } = req.body;

        const newPost = new Post({
            title,
            subtitle,
            content,
            category,
            tags: tags ? tags.split(",") : [],
            image: req.file ? `/uploads/${req.file.filename}` : null,
            authorId: req.user._id
        });

        await newPost.save();
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get all posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('authorId', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('authorId', 'username');

        if (!post) return res.status(404).json({ message: "Post not found" });

        post.views += 1;
        await post.save();

        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

//Get all post of logged-in user
export const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ authorId: req.user._id })
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Update a post
export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Authorization
        if (!post.authorId.equals(req.user._id))
            return res.status(403).json({ message: "Not authorized" });

        const { title, subtitle, content, category, tags } = req.body;

        if (req.file) post.image = `/uploads/${req.file.filename}`;
        if (title) post.title = title;
        if (subtitle) post.subtitle = subtitle;
        if (content) post.content = content;
        if (category) post.category = category;

        // Handle tags
        if (tags) {
            if (typeof tags === "string") {
                // From multipart/form-data
                post.tags = tags.split(",").map(tag => tag.trim());
            } else if (Array.isArray(tags)) {
                // From JSON
                post.tags = tags;
            }
        }

        await post.save();
        res.status(200).json({ message: "Post updated successfully", post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Delete a post
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found " });

        if (!post.authorId.equals(req.user._id))
            return res.status(403).json({ message: "Not authorized" });

        await post.deleteOne();
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const toggleLike = async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ message: "Post not found "});

        if(!req.user?._id) return res.status(404).json({ message: "Unauthorized" });

        const userId = req.user._id;

        //clean invalid likes
        post.likes = (post.likes || []).filter(id => mongoose.Types.ObjectId.isValid(id));

        //Toggle like
        const index = post.likes.findIndex(id => id.equals(userId));
        if(index === -1){
            post.likes.push(userId);

            //Create the notofication only if the liker is not the author
            if(!post.authorId.equals(userId)){
                await Notification.create({
                    recipientUserId: post.authorId,
                    senderUserId: userId,
                    postId: post._id,
                    type: "like"
                });
            }
        }else{
            //user is unliking the post
            post.likes.splice(index, 1);

            await Notification.deleteOne({
                recipientUserId: post.authorId,
                senderUserId: userId,
                postId: post._id,
                type: "like"
            });
        }

        await post.save();
        res.json({ likesCount: post.likes.length, likes: post.likes });
    }catch(error){
        console.log(error);
        res.json(500).json({ message: "Server error", error: error.message });
    }
};
