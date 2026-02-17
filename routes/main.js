const express = require('express');
const {check,body} = require('express-validator');
const authController = require('../controller/Auth');
const mainController = require('../controller/Main');
const auth = require('../middleware/auth');
const noCache = require('../middleware/noCache');
const router = express.Router();

router.get('/main',auth.protect,noCache,mainController.getmain);
router.get('/bookyourappointment',auth.protect,noCache,mainController.getBooking);
router.post('/getStores',auth.protect,noCache,[
    check('enteredpin')
    .isNumeric()
    .isLength({min:6,max:6})
    .withMessage('Enter valid pincode')
],mainController.getStores);
// router.get('/slots',authController.getSlots);
router.get('/store-dash',auth.protect,noCache,mainController.getStoreDash);//STORE
router.get('/userRegistration',auth.protect,noCache,mainController.getuserRegistration);//STORE
router.post('/userRegistration',[
    check('aadhar_id')
    .isNumeric()
    .isLength({min:12,max:12})
    .withMessage('Enter valid Aadhar Number'),
    check('mobile')
    .isNumeric()
    .isLength({min:10,max:10})
    .withMessage('Enter valid Mobile Number'),
    check('user_id')
    .isNumeric()
    .isLength({min:12,max:12})
    .withMessage('Enter valid Ration Card Number'),
    check('member_quantity')
    .isNumeric()
    .isLength({min:1,max:1})
    .withMessage('Member should be less than 10'),
    check('fps_id')
    .isNumeric()
    .isLength({min:4,max:4})
    .withMessage('Enter Valid FPS ID')
],auth.protect,noCache,mainController.postuserRegistration);//STORE
router.post('/memberRegistration',
[
    check('member')
    .isNumeric()
    .isLength({min:12,max:12})
    .withMessage('Enter Valid Aadhar Number')
],
auth.protect,noCache,mainController.postmemberRegistration);//STORE
router.get('/confirmation/:store',auth.protect,noCache,mainController.getConfirmation);
router.get('/findtheStore',auth.protect,noCache,mainController.getfindtheStore);
router.get('/storeinfo/:id',auth.protect,noCache,mainController.getStoreinfo);
router.get('/slots/:store_id',auth.protect,noCache,mainController.getSlots);
router.get('/inventory/:store_id',auth.protect,noCache,mainController.getInventory);//STORE
router.get('/update',auth.protect,noCache,mainController.getUpdate);//STORE
router.post('/update',auth.protect,noCache,mainController.postUpdate);//STORE
// router.get('/slotManage/:store_id',auth.protect,mainController.getslotManage);
router.get('/store/:store_id',auth.protect,noCache,mainController.getstore);
router.post('/confirm',auth.protect,noCache,mainController.completeConfirmation);
router.get('/userPreviousTrans',auth.protect,noCache,mainController.getuserPreviousTrans);
router.get('/upcomingStoretrans',auth.protect,noCache,mainController.getupcomingStoretrans);//STORE
router.get('/storePrevTrans',auth.protect,noCache,mainController.getstorePrevTrans);//STORE
router.get('/confrecipt/:order_id',auth.protect,noCache,mainController.getconfrecipt);
router.get('/recipt/:order_id',auth.protect,noCache,mainController.getrecipt);
router.get('/completetrans/:order_id',auth.protect,noCache,mainController.getcompletetrans);
router.post('/getStores/:flag',auth.protect,noCache,[
    check('enteredpin')
    .isNumeric()
    .isLength({min:6,max:6})
    .withMessage('Enter valid pincode')
],mainController.getStores);

module.exports = router;