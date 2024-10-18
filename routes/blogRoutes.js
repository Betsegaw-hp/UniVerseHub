const express = require('express')
const router = express.Router()
const blogControllers = require('../controllers/blogController')

const {
    blog_get,
    blog_dlt,
    blog_detail_get,
    blog_slug_availablity_get
} = blogControllers

router.get('/', blog_get)

router.get('/check-slug', blog_slug_availablity_get)

router.get('/:slug', blog_detail_get)


router.delete('/:slug', blog_dlt)


module.exports = router