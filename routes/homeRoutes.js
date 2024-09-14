const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homePageController');

const {
    home_data_get
 } = homeController;

router.get('/', home_data_get);


module.exports = router;