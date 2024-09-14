const express = require('express');
const router = express.Router();
const forumControllers = require('../controllers/forumController');

const {
    forum_get,
    forum_post,
    forum_dlt,
    forum_detail_get,
    forum_update,
    likePost,
    comment_post,
    forum_category_get,
    forum_category_post,
    forum_category_update,
    forum_category_dlt
} = forumControllers;

router.get('/', forum_get);
router.post('/', forum_post);
router.put('/', forum_update);
router.post('/category', forum_category_post);
router.put('/category', forum_category_update);
router.delete('/:id', forum_dlt);
router.get('/:id', forum_detail_get);
router.put('/:id/like', likePost);
router.post('/:id/comment', comment_post);

// this is fine b/c /forum is category
// /forum/category shouldn't return a page
router.get('/category/:name', forum_category_get);
router.delete('/category/:id', forum_category_dlt);


module.exports = router;