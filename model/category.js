const mongoose = require('mongoose');
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

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;