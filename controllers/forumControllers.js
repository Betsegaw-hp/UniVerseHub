const { ForumPost, Comment } = require('../model/forum');
const Category = require('../model/category');
const handleErrors = require('../utils/errorHandler');


const getPostsByCategory = async (categoryName, limit) => {
    try {
        const category = await Category.findOne({ name: categoryName });

        if (!category) {
            console.log('Category not found');
            return [];
        }

        // Fetch posts for the found category
        const posts = await ForumPost.find({ category: category._id }, "title")
            // .populate('author', 'username email') 
            // .populate('category', 'name') 
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

        res.status(201).json({ post: savedPost });

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err);
    }
};


const forum_dlt = (req, res) => {
    const id = req.params.id

    ForumPost.findByIdAndDelete(id)
    .then(result => {
        console.info("deleted!", result);
        res.json({ redirect : '/forum'})
    }).catch( err => {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err);
    })
}

const forum_detail_get = async (req, res) => {
    const id = req.params.id;

    ForumPost.findById(id)
    .populate('author', "username email")
    .populate("category", "name")
    .then(async result => {

        try {
            
            const categoryName = result.category.name;
            const relatedPosts = await getPostsByCategory(categoryName);
            const categoryCollec = await Category.find({}, 'name');

            // checking if the user liked the post
            const hasLiked = result.likedBy.includes(res.locals.user._id);

            const postData = {...result.toObject(), relatedPosts, categoryCollec, hasLiked};
            res.render('forum/detail', { 
                title: `${result.title} - UniVerseHub Forum`, 
                post: postData
            });
        } catch (error) {
            console.error(err);
        }
    })
    .catch(err => {
        console.error(err)
        res.redirect('../404')
    })

}

const forum_update = async (req, res) => {

    try {
        const { title, body_content, category, postId } = req.body;
        
        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.status(400).json({ errors: { category: "Category not found" } });
        }
        
        console.log(req.body)

        const updatedPost = await ForumPost.findByIdAndUpdate(
            postId ,
            {
                title, 
                content: body_content, 
                category: categoryDoc._id
            },
            { new : true, runValidators: true}
        ).exec();

        console.log(updatedPost)

        res.status(200).json({ post: updatedPost });

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err);    
    }
}

const likePost = async (req, res) => {
    const { id } = req.params;
    const userId = res.locals.user._id;  

    console.log(req.params)

    try {
        const post = await ForumPost.findById(id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Check if user has already liked the post
        const hasLiked = post.likedBy.includes(userId);

        if (hasLiked) {
            // Unlike the post
            post.likeCount -= 1;
            post.likedBy.pull(userId);
        } else {
            // Like the post
            post.likeCount += 1;
            post.likedBy.push(userId);
        }

        // Save the post with updated likeCount
        await post.save();

        res.status(200).json({
            likeCount: post.likeCount,
            hasLiked: !hasLiked
        });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err);    
    }
};


module.exports = {
    forum_get,
    forum_post,
    forum_dlt,
    forum_detail_get,
    forum_update,
    likePost
}

