const express = require('express');
const router = express.Router();
const forumControllers = require('../controllers/forumControllers');

const {
    forum_get,
    forum_post,
    forum_dlt,
    forum_detail_get,
    forum_update
} = forumControllers;

router.get('/', forum_get);
router.post('/', forum_post);
router.put('/', forum_update);
router.delete('/:id', forum_dlt);
router.get('/:id', forum_detail_get)


module.exports = router;