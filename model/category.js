const mongoose = require('mongoose');
const {ForumPost} = require('./forum');
const Schema = mongoose.Schema;

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


// Pre-remove hook to prevent deletion if posts reference this category
categorySchema.pre('remove', async function (next) {
    const categoryId = this._id;

    // Check if any ForumPost references this category
    const posts = await ForumPost.find({ category: categoryId });

    if (posts.length > 0) {
        const err = new Error('Category cannot be deleted because it is referenced by existing posts.');
        next(err);
    } else {
        next();
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;