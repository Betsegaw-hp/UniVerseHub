const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

const {
    search_topic
} = searchController;

router.get('/topic/:title', search_topic);

module.exports = router;