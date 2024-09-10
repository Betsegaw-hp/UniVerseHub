const { ForumPost, Comment } = require('../model/forum');
const Category = require('../model/category');
const handleErrors = require('../utils/errorHandler');


const getPostsByCategory = async (categoryName) => {
    try {
        const category = await Category.findOne({ name: categoryName });

        if (!category) {
            console.log('Category not found');
            return [];
        }

        // Fetch posts for the found category
        const posts = await ForumPost.find({ category: category._id })
            .populate('author', 'username email') 
            .populate('category', 'name') 
            .exec();

        // console.log('Posts:', posts);
        return posts;

    } catch (err) {
        console.error('Error fetching posts:', err);
        return [];
    }
};

const forum_get =  (req, res) => {

    Promise.all([
        ForumPost.find().sort({ createdAt: -1 }).limit(4) 
        .populate('author', "username email"),  // limit is also set on frontend
        
        Category.find().sort({ createdAt: -1 })
    ])
    .then(async ([posts, categories]) => {

        const categoriesWithPostCount = 
            await Promise.all(categories.map(async (category) => {
                // Get the count of posts for this category
                const postCount = await ForumPost.countDocuments({ category: category._id });
                return {
                    ...category.toObject(), // Convert the Mongoose document to a plain JS object
                    postCount 
                };
            }));

        const data = {
            posts,
            categories: categoriesWithPostCount
        };
        
        res.render('forum/index', { 
            title: "UniVerseHub Forum - Connect and Discuss", 
            data: data 
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('An error occurred while loading the forum.');
    });

}

const forum_post = async (req, res) => {

    try {
        const { title, body_content, category } = req.body;

        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.status(400).json({ errors: { category: "Category not found" } });
        }

        const post = {
            title,
            content: body_content,
            category: categoryDoc._id,
            author: res.locals.user._id
        };

        // Create the forum post
        const savedPost = await ForumPost.create(post);
        console.log("Post saved:", savedPost);

        // Send a success response
        res.status(201).json({ post: savedPost });

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err);
    }
};


const forum_dlt = (req, res) => {
    
}

const forum_detail_get = (req, res) => {

}

const forum_update = (req, res) => {

}

module.exports = {
    forum_get,
    forum_post,
    forum_dlt,
    forum_detail_get,
    forum_update
}

