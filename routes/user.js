const express = require('express');
const noCache = require('nocache');

const userCtrl = require('../controllers/user');
const router = express.Router();

router.post('/signup', noCache(), userCtrl.signup);
router.post('/login', noCache(), userCtrl.login);

module.exports = router;