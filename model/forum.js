const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Forum Post Schema
const forumPostSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 1
    },
    content: {
        type: String,
        required: true,
        minlength: 10
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    tags: {
        type: [String],
        default: ['forum']
    },
    viewCount: {
        type: Number,
        default: 0
    },
    likeCount: {
        type: Number,
        default: 0
    },
    recentComments: [{
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        createdAt: Date
    }]
}, { timestamps: true });

// Comment Schema
const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'ForumPost',
        required: true
    }
}, { timestamps: true });


const ForumPost = mongoose.model('ForumPost', forumPostSchema);
const Comment = mongoose.model('comment', commentSchema);

module.exports = {ForumPost, Comment};
