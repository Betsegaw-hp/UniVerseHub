const express = require('express');
const router = express.Router();
const forumControllers = require('../controllers/forumController');
const { requireRole } = require('../middleware/authMiddleware');

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

// forum routes
router.get('/', forum_get);
router.post('/', forum_post);
router.put('/', forum_update);
router.delete('/:id', forum_dlt);
router.get('/:id', forum_detail_get);
router.put('/:id/like', likePost);
router.post('/:id/comment', comment_post);

// category routes
router.post('/category', requireRole(['admin', 'moderator']), forum_category_post);
router.put('/category', requireRole(['admin', 'moderator']), forum_category_update);
router.get('/category/:name', forum_category_get);
router.delete('/category/:id', requireRole(['admin', 'moderator']) , forum_category_dlt);


module.exports = router;