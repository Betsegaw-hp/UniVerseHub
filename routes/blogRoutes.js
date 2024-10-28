const express = require('express');
const router = express.Router();
const blogControllers = require('../controllers/blogController');
const categoryControllers = require('../controllers/categoryController');
const { requireRole } = require('../middleware/authMiddleware');

const {
    blog_get,
    blog_dlt,
    blog_detail_get,
    blog_slug_availablity_get
} = blogControllers;

const {
    category_post,
    category_dlt,
    category_update_put
} = categoryControllers;

router.get('/', blog_get);

router.get('/check-slug', blog_slug_availablity_get);

router.get('/:slug', blog_detail_get);
router.delete('/:slug', blog_dlt);

// category routes
router.post('/category', requireRole(['admin', 'moderator']), category_post);
router.put('/category', requireRole(['admin', 'moderator']), category_update_put);
// router.get('/category/:name', blog_category_get);
router.delete('/category/:id', requireRole(['admin', 'moderator']) , category_dlt);



module.exports = router