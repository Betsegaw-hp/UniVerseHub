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
    likedBy: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    recentComments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
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


commentSchema.post('save', async function (doc, next) {

    try {

        const commentLimit = 10;

        await ForumPost.findByIdAndUpdate(
            doc.post,
            {
                $push: { recentComments: { $each: [doc._id], $position: 0, $slice: commentLimit } } 
            }
        );
        next();
    } catch (err) {
        console.error("critical error: while updating forumPost from comment schema");
        next(err);
    }

});


const ForumPost = mongoose.model('ForumPost', forumPostSchema);
const Comment = mongoose.model('Comment', commentSchema);

module.exports = {ForumPost, Comment};
