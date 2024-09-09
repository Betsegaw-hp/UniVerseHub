const express = require('express')
const router = express.Router()
const blogControllers = require('../controllers/blogController')

const {
    blog_get,
    blog_post,
    blog_create_get,
    blog_dlt,
    blog_detail_get,
    blog_update
} = blogControllers

router.get('/', blog_get)
router.post('/', blog_post)
router.put('/', blog_update)
router.get('/create', blog_create_get)
router.delete('/:id', blog_dlt)
router.get('/:id', blog_detail_get)


module.exports = router