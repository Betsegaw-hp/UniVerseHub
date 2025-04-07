const { ForumPost, Comment } = require('../model/forum');
const Category = require('../model/category');
const User = require('../model/user');
const handleErrors = require('../utils/errorHandler');

const forum_get = async (req, res) => {

    try {

        // just pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;

        // Calculate the offset (skip) for the database query
        const skip = (page - 1) * limit;

        const totalCategories = await Category.countDocuments({type: 'forum'});
        const totalPages = Math.ceil(totalCategories / limit);

        const pagination = getPagination(page, limit, totalPages);

        // actual data
        const [ posts, categories ] = await Promise.all([
            ForumPost.find().sort({ createdAt: -1 }) 
            .populate('author', "username email avatarUrl"),  // limit is also set on frontend
            
            Category.find({type: 'forum'}).sort({ createdAt: -1 }).skip(skip).limit(limit)
        ]);

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
            categories: categoriesWithPostCount,
        };
        
        res.render('forum/index', { 
            title: "UniVerseHub Forum - Connect and Discuss", 
            data: data,
            pagination
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while loading the forum.');
    }

}

const forum_post = async (req, res) => {

    try {
        const { title, body_content, pureTextContent, category } = req.body;

        const categoryDoc = await Category.findOne({ name: category, type: 'forum' });

        if (!categoryDoc) {
            return res.status(400).json({ errors: { category: "Category not found" } });
        }

        const post = {
            title,
            content: body_content,
            category: categoryDoc._id,
            author: res.locals.user._id,
            pureTextContent
        };

        // Create the forum post
        const savedPost = await ForumPost.create(post);
        console.log("Post saved:", savedPost);

        // update user stat for postCount
        const user = await User.findByIdAndUpdate(
            res.locals.user._id,
            { $inc: { 'stats.postCount': 1 } },
            { new: true, runValidators: true } 
        );

        console.log("postCount:", user.stats.postCount);

        res.status(201).json({ post: savedPost });

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err);
    }
};

const forum_dlt = async (req, res) => {
    const id = req.params.id;

    const post = await ForumPost.findById(id, 'author');
    if( res.locals.user.role === 'user' 
        && post.author.toString() !== res.locals.user._id.toString() ) {
        return res.status(403).json({ error :  "Permision denied! You are not the author of this post!"  })
    }

    ForumPost.findByIdAndDelete(id)
    .then(async result => {
        console.info("deleted!", result._id);

        // update user stat for postCount 
        // I am not sure if this feature needed but doesn't hurt :)
        const user = await User.findByIdAndUpdate(
            res.locals.user._id,
            { $inc: { 'stats.postCount': -1 } },
            { new: true, runValidators: true }
        );
        

        console.log("postCount:", user.stats.postCount);

        await user.save();

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
    .populate('author', "username email name avatarUrl")
    .populate("category", "name")
    .populate({
        path: 'recentComments',
        populate: {
            path: 'author', 
            select: 'username name avatarUrl' 
        }
    })
    .then(async result => {

        try {
            
            const categoryName = result.category.name;
            const relatedPosts = await getPostsByCategory(categoryName, "title");
            const categoryCollec = await Category.find({type: 'forum'}, 'name');

            // checking if the user liked the post
            const hasLiked = result.likedBy.includes(res.locals.user._id);

            const postData = {...result.toObject(), relatedPosts, categoryCollec, hasLiked};

            res.render('forum/detail', { 
                title: `${result.title} - UniVerseHub Forum`, 
                post: postData
            });

        } catch (err) {
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
        const { title, body_content, pureTextContent, category, postId } = req.body;

        const post = await ForumPost.findById(postId, 'author');
        if(post.author.toString() !== res.locals.user._id.toString()) {
            return res.status(403).json({ errors : { msg: "Permision denied! You are not the author of this post!" } })
        }
        
        const categoryDoc = await Category.findOne({ name: category, type: 'forum' });
        if (!categoryDoc) {
            return res.status(400).json({ errors: { category: "Category not found" } });
        }

        const updatedPost = await ForumPost.findByIdAndUpdate(
            postId ,
            {
                title, 
                pureTextContent,
                content: body_content, 
                category: categoryDoc._id
            },
            { new : true, runValidators: true}
        ).exec();

        console.log("post updated!")

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

const comment_post = async (req, res) => {

    
    try {
        const { id } = req.params;
        const { content } = req.body;

        const post = await ForumPost.findById(id);
        if (!post) return res.status(404).json({ error: "Post not found" });
    
        const commentDoc = {
            content,
            post: post._id,
            author: res.locals.user._id
        };

        
        const comment = await Comment.create(commentDoc);
              
        console.log("comment saved: " , comment);

        // update user stat for commentCount
        const user = await User.findByIdAndUpdate(
            res.locals.user._id,
            { $inc: { 'stats.commentCount': 1 } },
            { new: true, runValidators: true }
        );

        console.log("commentCount:" , user.stats.commentCount);

        res.status(201).json({ comment });

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err);
    }
}

const forum_category_get = async (req, res) => {
    const { name } = req.params;

    try {

        let data = null;
        let categoryName = "All Topics";
        // special case
        if(name === "All Topics") {
            data = {
                posts:  await ForumPost.find()    
                                       .populate('author', 'username email avatarUrl') 
                                       .populate('category', 'name').exec() ,
                category: {
                    name,
                    description: "Join discussions on a wide range of subjects. Connect and share your thoughts on any topic that interests you."
                }
            }
        } else {

            const categoryDoc = await Category.findOne({ name, type: 'forum' });
    
            if (!categoryDoc) {
                return res.status(404).redirect('../404');
            }
    

            const posts = await getPostsByCategory(categoryDoc.name);

            // console.log(posts)
            data = {posts,  category: categoryDoc};

            categoryName = categoryDoc.name;

        }
        

        res.render('forum/category', { title: categoryName, data });
    } catch (err) {
        console.log(err);
    }
}

// utils
const getPostsByCategory = async (categoryName, field = null ) => {
    try {
        const category = await Category.findOne({ name: categoryName, type: 'forum' });

        if (!category) {
            console.log('Category not found');
            return [];
        }

        let posts = null;
        // Fetch posts for the found category
        if(field) {

            posts = await ForumPost.find({ category: category._id }, field)
                // .populate('author', 'username email') 
                // .populate('category', 'name') 
                .exec();
        } else {
            posts = await ForumPost.find({ category: category._id })
                .populate('author', 'username email avatarUrl') 
                .populate('category', 'name') 
                .exec();
        }

        // console.log('Posts:', posts);
        return posts;

    } catch (err) {
        console.error('Error fetching posts:', err);
        return [];
    }
};

const getPagination = (page, limit, totalPages) => {

    const maxPagesToShow = 3;
    // Determine the range of pages to display
    const currentSetStart = Math.floor((page - 1) / maxPagesToShow) * maxPagesToShow + 1;
    const currentSetEnd = Math.min(currentSetStart + maxPagesToShow - 1, totalPages);

    return {
        currentPage: page,
        totalPages,
        currentSetStart,
        currentSetEnd,
        limit
    }
}

const getTopContributors = async (limit=5) => {
    // just top posters
    try {
        const topPosters = await User.find() 
        .sort({ 'stats.postCount': -1 })  
        .limit(limit)  
        .select('username stats.postCount') 
        .exec();
  
        console.log(topPosters)
        return topPosters;
    } catch (err) {
        console.error(err);
        return []
    }
}


module.exports = {
    forum_get,
    forum_post,
    forum_dlt,
    forum_detail_get,
    forum_update,
    likePost,
    comment_post,
    forum_category_get
}

