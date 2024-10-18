const mongoose = require('mongoose')
const Schema = mongoose.Schema 

const blogSchema = new Schema({
    title: {
        type : String,
        minlength: 3,
        required : true
    },
    slug : {
        type: String,
        unique: true,
        required: true
    },
    thumbnail: {
        type: String,
        required: true 
    },
    snippet: {
        type: String,
        minlength: 10,
        required: true
    },
    body: {
        type: String,
        minlength: 10,
        required: true
    },
    author :{
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
        default: ['blog']
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'  // Default to 'draft' for new posts
    },
    featured: {
        type: Boolean,
        default: false
    },
    readTime: {
        type: Number,
        default: 0
    }
}, { timestamps : true });

// Pre-save hook to calculate read time
blogSchema.pre('save', function (next) {
    if (this.isModified('body')) { // Only recalculate if content changes
        const wordsPerMinute = 200;
        const wordCount = this.body.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / wordsPerMinute);
    }
    next();
});

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog