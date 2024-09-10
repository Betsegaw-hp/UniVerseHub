const { ForumPost, Comment } = require('../model/forum');
const Category = require('../model/category');


const forum_get =  (req, res) => {
    const data = {};

    Promise.all([
        ForumPost.find().sort({ createdAt: -1 })
        .populate('author', "username email"),
        
        Category.find().sort({ createdAt: -1 })
    ])
    .then(([posts, categories]) => {
        data.posts = posts;
        data.categories = categories;
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

const forum_post = (req, res) => {
    
}
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

