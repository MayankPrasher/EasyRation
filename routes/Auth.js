const express = require('express');
const {check,body} = require('express-validator');
const authController = require('../controller/Auth');
const isAuth = require('../middleware/isauth');
const mainController = require('../controller/Main');
const router = express.Router();

router.get('/',authController.getAuth);
router.post('/authSignup',[
    check('aadhar')
    .isNumeric()
    .isLength({min:12,max:12})
    .withMessage('Enter the valid aadhar number.'),
    check('email')
    .isEmail()
    .withMessage('Enter the valid email.')
],authController.postAuthsignup);
router.post('/authLogin',[
    check('loginemail')
    .isEmail()
    .withMessage('Enter the valid email.')
],authController.postAuthlogin);
router.post('/logout',authController.postLogout);
router.get('/store-login',authController.getStorelogin);
router.post('/authStorelogin',[
    check('store_email')
    .isEmail()
    .withMessage('Enter the valid email.'),
    check('entered_fps_id')
    .isNumeric()
    .isLength({min:4,max:4})
    .withMessage('Enter the valid fps id.')
],authController.postStorelogin);
router.get('/otp/:id',authController.getOtp);
router.post('/postOtp/:id',[
    check('entered_otp')
    .isLength({min:3,max:3})
    .withMessage('Enter valid otp')
],authController.postOtp);
// router.get('/main',authController.getmain);
// router.get('/bookyourappointment',authController.getBooking);
// router.get('/slots',authController.getSlots);
// router.get('/confirmation',authController.getConfirmation);
// router.get('/findtheStore',authController.getfindtheStore);
// router.get('/storeinfo',authController.getStoreinfo);


module.exports = router;