const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    avatarUrl: String,
    roles: {
        type: [String],
        default: ['user']
    },
    stats: {
        postCount: { type: Number, default: 0 },
        commentCount: { type: Number, default: 0 },
        videoCount: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Category Schema (for both forum and videos)
const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    type: {
        type: String,
        enum: ['forum', 'video'],
        required: true
    }
});

// Forum Post Schema
const forumPostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
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

// Video Schema
const videoSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    videoUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: String,
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
    }],
    metadata: {
        duration: Number,
        resolution: String,
        format: String
    }
}, { timestamps: true });

// Video Comment Schema
const videoCommentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const ForumPost = mongoose.model('ForumPost', forumPostSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Video = mongoose.model('Video', videoSchema);
const VideoComment = mongoose.model('VideoComment', videoCommentSchema);

module.exports = {
    User,
    Category,
    ForumPost,
    Comment,
    Video,
    VideoComment
};