const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const rateLimit = require('../middleware/rate-limit')
const strengthCheck = require("../middleware/strength-check"); 
const emailCheck = require("../middleware/email-check");

router.post('/signup', emailCheck, strengthCheck, userCtrl.signup);
router.post('/login', rateLimit, userCtrl.login);

module.exports = router;