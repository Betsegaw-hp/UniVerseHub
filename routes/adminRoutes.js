const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const blogController = require('../controllers/blogController');
const { upload, checkDuplicateImage, multerErrorHandler } = require('../middleware/uploadMiddleware');

const {
    admin_page_get,
    suspend_user_put,
    role_requests_get,
    users_get,
    reactivate_user_put,
    approve_role_request_put,
    reject_role_request_put,
    force_edit_user
} = adminController;

const  {
    blog_create_get,
    blog_create_post,
    blog_update_get,
    blog_update_put,
    image_upload_post,
    blog_publish_get,
    admin_blog_get
}  = blogController;


router.get('/', admin_page_get);
router.get('/role-requests', role_requests_get);
router.put('/approve-role-request/:id', approve_role_request_put);
router.put('/reject-role-request/:id', reject_role_request_put);
router.get('/users', users_get);
router.put('/suspend-user/:id', suspend_user_put );
router.put('/reactivate-user/:id', reactivate_user_put);

// admin force edit privlage
router.post('/force-edit-user', force_edit_user);

// blog routes given admin previlage
router.get('/blog', admin_blog_get);

router.get('/blog/create', blog_create_get);
router.post('/blog/create', upload.single('image') , checkDuplicateImage, blog_create_post, multerErrorHandler);


router.get('/blog/:slug', blog_update_get);
router.put('/blog/:slug', upload.single('image'), checkDuplicateImage, blog_update_put, multerErrorHandler);

router.get('/blog/:slug/publish', blog_publish_get);

router.post('/upload-image', upload.single('image'), checkDuplicateImage, image_upload_post, multerErrorHandler);


module.exports = router;