const express = require('express');

const authController = require('../controller/Auth');
const router = express.Router();

router.get('/',authController.getAuth);
router.get('/main',authController.getmain);
router.post('/authLogin',authController.postAuthlogin);
router.post('/authSignup',authController.postAuthsignup);

module.exports = router;