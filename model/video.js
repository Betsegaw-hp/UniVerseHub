const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

const Video = mongoose.model('Video', videoSchema);
const VideoComment = mongoose.model('VideoComment', videoCommentSchema);

module.exports = { Video,VideoComment };