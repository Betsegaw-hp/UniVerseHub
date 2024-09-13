const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/authController');

const {
    auth_page_get,
    login_post,
    signup_post,
    auth_logout,
    username_availability_get
 } = authControllers;

router.get('/', auth_page_get);
router.post('/signup', signup_post);
router.post('/login', login_post);
router.get('/logout', auth_logout);
router.get('/check-username', username_availability_get);

module.exports = router;