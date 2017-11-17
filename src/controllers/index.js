'use strict';

// Module to load all of the controllers

const express        = require('express');
const router         = express.Router();
const path           = require('path');

router.use(require('../apis'));
router.use('/webhook', require('./webhook'));

module.exports = router;
