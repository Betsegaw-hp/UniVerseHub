const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

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


router.get('/', admin_page_get);
router.get('/role-requests', role_requests_get);
router.put('/approve-role-request/:id', approve_role_request_put);
router.put('/reject-role-request/:id', reject_role_request_put);
router.get('/users', users_get);
router.put('/suspend-user/:id', suspend_user_put );
router.put('/reactivate-user/:id', reactivate_user_put);

// admin force edit privlage
router.post('/force-edit-user', force_edit_user);

module.exports = router;