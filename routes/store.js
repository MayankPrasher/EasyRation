const express = require("express");
const { check, body } = require("express-validator");
const authController = require("../controller/Auth");
const mainController = require("../controller/Main");
const isAuth = require("../middleware/isauth");
const router = express.Router();

router.get("/store-dash", isAuth, mainController.getStoreDash);

router.get("/userRegistration", isAuth, mainController.getuserRegistration);

router.post(
  "/userRegistration",
  [
    check("aadhar_id")
      .isNumeric()
      .isLength({ min: 12, max: 12 })
      .withMessage("Enter valid Aadhar Number"),
    check("mobile")
      .isNumeric()
      .isLength({ min: 10, max: 10 })
      .withMessage("Enter valid Mobile Number"),
    check("user_id")
      .isNumeric()
      .isLength({ min: 12, max: 12 })
      .withMessage("Enter valid Ration Card Number"),
    check("member_quantity")
      .isNumeric()
      .isLength({ min: 1, max: 1 })
      .withMessage("Member should be less than 10"),
    check("fps_id")
      .isNumeric()
      .isLength({ min: 4, max: 4 })
      .withMessage("Enter Valid FPS ID"),
  ],
  isAuth,
  mainController.postuserRegistration,
);

router.post(
  "/memberRegistration",
  [
    check("member")
      .isNumeric()
      .isLength({ min: 12, max: 12 })
      .withMessage("Enter Valid Aadhar Number"),
  ],
  isAuth,
  mainController.postmemberRegistration,
);

router.get("/inventory/:store_id", isAuth, mainController.getInventory);

router.get("/update", isAuth, mainController.getUpdate);

router.post("/update", isAuth, mainController.postUpdate);

router.get("/upcomingStoretrans", isAuth, mainController.getupcomingStoretrans);

router.get("/storePrevTrans", isAuth, mainController.getstorePrevTrans);

router.get("/recipt/:order_id", isAuth, mainController.getrecipt);

module.exports = router;
