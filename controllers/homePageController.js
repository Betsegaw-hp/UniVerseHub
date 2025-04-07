const {ForumPost} = require('../model/forum');
const Category = require('../model/category');
const User = require('../model/user');
const Blog = require('../model/blog');

const home_data_get = (req, res ) => {

    Promise.all([
        ForumPost.aggregate([
            {
                $project: {
                    title: 1,
                    likeCount: 1,
                    commentCount: { $size: "$recentComments" }  // Compute the length of the scores array
                }
            },
            {
                $sort: { commentCount: -1 }  // Sort by the array length in descending order
            }
        ]) ,
        
        Category.find().sort({ createdAt: -1 }),
        User.countDocuments({ status: 'active' }),
        Blog.find({ featured: true }).sort({ createdAt: -1 })
            .populate('author', 'name profileImage username')
            .populate('category', 'name')
            .limit(3),
    ])
    .then(async ([posts, categories, usersCount, featuredBlogs]) => {
        let stats = {
            totalPosts: posts.length,
            totalCategories: categories.length,
            totalUsers: usersCount, 
        };
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
            stats,
            featuredBlogs,
            categories: categoriesWithPostCount.sort((a, b) => b.postCount - a.postCount)
        };
        
        res.render('index', { 
            title: "UniVerseHub - Connect, Share, Learn", 
            data: data 
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('An error occurred while loading the forum.');
    });
}

module.exports = {home_data_get};