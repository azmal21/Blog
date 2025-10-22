const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true},
    subtitle: { type: String },
    content: { type: String, required: true},
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    category: { type: String },
    tags: [String],
    image: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0}
}, { timestamps: true});

module.exports = mongoose.model('Post', postSchema);