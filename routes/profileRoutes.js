const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

const {
    profile_get,
    profile_update_put,
    profile_edit_get
 } = profileController;

router.get('/update', profile_edit_get);
router.put('/update', profile_update_put);
router.get('/:username', profile_get);


module.exports = router;