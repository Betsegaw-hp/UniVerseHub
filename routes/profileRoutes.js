const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

const {
    profile_get,
    profile_update_put,
    profile_edit_get,
    password_update_put,
    role_request_post
 } = profileController;

router.get('/setting', profile_edit_get);
router.put('/update', profile_update_put);
router.put('/change-password', password_update_put);
router.get('/:username', profile_get);
router.post('/role-request', role_request_post);


module.exports = router;