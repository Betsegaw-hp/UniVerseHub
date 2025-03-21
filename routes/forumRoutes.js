const express = require('express');
const router = express.Router();
const forumControllers = require('../controllers/forumController');
const categoryController = require('../controllers/categoryController');
const searchControllers = require('../controllers/searchController');
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
} = forumControllers;

const {
    category_post,
    category_update_put,
    category_dlt
} = categoryController;

const {
    search_forum_get
} = searchControllers;

// forum routes
router.get('/', forum_get);
router.post('/', forum_post);
router.put('/', forum_update);

// search
router.get('/search', search_forum_get);


router.delete('/:id', forum_dlt);
router.get('/:id', forum_detail_get);
router.put('/:id/like', likePost);
router.post('/:id/comment', comment_post);

// category routes
router.post('/category', requireRole(['admin', 'moderator']), category_post);
router.put('/category', requireRole(['admin', 'moderator']), category_update_put);
router.get('/category/:name', forum_category_get);
router.delete('/category/:id', requireRole(['admin', 'moderator']) , category_dlt);



module.exports = router;