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
    forum_category_get
} = forumControllers;

router.get('/', forum_get);
router.post('/', forum_post);
router.put('/', forum_update);
router.delete('/:id', forum_dlt);
router.get('/:id', forum_detail_get);
router.put('/:id/like', likePost);
router.post('/:id/comment', comment_post);

router.get('/category/:name', forum_category_get);


module.exports = router;