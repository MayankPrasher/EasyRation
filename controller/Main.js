// const user = require('../models/user');
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const Store = require("../models/store");
const Admin = require("../models/central");
const Order = require("../models/order");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { validationResult } = require("express-validator");
var mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const user = require("../models/user");
const central = require("../models/central");
const RationService = require("../services/RationService");
const StoreService = require('../services/StoreService');
const OrderService = require('../services/OrderService');
const SlotService = require("../services/SlotService");
// mongoose.set('debug', true);
// const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     auth: {
//         user: 'aniya.leannon@ethereal.email',
//         pass: 'ZPMw5uHSMdpw91y4Y7'
//     }
// });

exports.getmain = async (req, res, next) => {
  try{
    const aadhar = req.user.aadhar;
    const rationData = await RationService.getRationDetails(aadhar);

    res.render('rationcard',{
      aadhar:aadhar,
      ...rationData,
      user:req.user
    })
  }catch(err){
    console.error("Error in getmain:", err.message)
    res.redirect('/')
  }
};

exports.getStores = (req, res, next) => {
  var flag = undefined;
  if (req.params.flag) {
    flag = req.params.flag;
  }
  const enteredpin = req.body.enteredpin;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("booking", {
      aadhar_name: req.user.name,
      aadhar: req.user.aadhar,
      errorMessage: errors.array()[0].msg,
      oldInput: { enteredpin: enteredpin },
      validationErrors: errors.array(),
    });
  }
  Store.find({ pincode: enteredpin })
    .then((stores) => {
      if (stores.length <= 0) {
        return res.status(422).render("booking", {
          aadhar_name: req.user.name,
          aadhar: req.user.aadhar,
          errorMessage: "Invalid Pincode",
          oldInput: { enteredpin: enteredpin },
          validationErrors: errors.array(),
          flag: flag,
        });
      } else {
        res.render("chooseStore", {
          aadhar_name: req.user.name,
          aadhar: req.user.aadhar,
          stores: stores,
          isAuth: req.isLoggedIn,
          flag: flag,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getBooking = async (req, res, next) => {
  try{
  const aadhar = req.user.aadhar;
  const user = await User.findOne({
    aadhar:aadhar})

    if(!user){
      console.log("user not found")
      return res.redirect('/')
    }

    if(user.monthlyQuota){
      return res.render("Nobooking",{
        aadhar_name:req.user.name,
        aadhar:req.user.aadhar,
        oldInput:"",
        errorMessage:"",
      })
    }

    const pendingOrder = await Order.findOne({aadhar:aadhar, complete:false})
    if(pendingOrder){
      return res.render("Nobooking",{
        aadhar_name:req.user.name,
        aadhar:req.user.aadhar,
        oldInput:"",
        errorMessage:"You already have a pending booking. Please visit the store to verify your receipt before booking another."
      })
    }

    res.render("booking",{
      aadhar_name:req.user.name,
      aadhar: req.user.aadhar,
      oldInput:"",
      errorMessage:"",
    })
  }catch(err){
    console.log(err);
    next(err);
  }
};
exports.getStoreDash = async (req, res, next) => {
  try{
    const fpsId = req.user.fps_id

    const storeData = await StoreService.getStoreDetails(fpsId)

    res.render("storedash",{
      user : req.user.usertype,
      store_name: storeData.store_name,
      fps_id: storeData.fps_id,
      distributor:storeData.distributor,
      address: storeData.address,
      tehsil: storeData.tehsil,
      telephone: storeData.telephone,
      userObj:req.user
    })
  }catch(err){
    console.error("Error in getStoreDash:",err.message)
    res.redirect('/')
  }
};
exports.getuserRegistration = (req, res, next) => {
  const store_name = req.user.store_name;
  const fps_id = req.user.fps_id;
  res.render("userRegistration", {
    store_name: store_name,
    fps_id: fps_id,
    errorMessage: "",
    oldInput: "",
  });
};
exports.postuserRegistration = (req, res, next) => {
  const store_name = req.user.store_name;
  const session_fps_id = req.user.fps_id;
  const aadhar_id = req.body.aadhar_id;
  const user_name = req.body.name;
  const address = req.body.address;
  const mobile = req.body.mobile;
  const user_id = req.body.user_id;
  const member_quantity = req.body.member_quantity;
  const card_type = req.body.card_type;
  const form_fps_id = req.body.fps_id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("userRegistration", {
      errorMessage: errors.array()[0].msg,
      oldInput: {
        aadhar_id: aadhar_id,
        name: user_name,
        address: address,
        mobile: mobile,
        user_id: user_id,
        member_quantity: member_quantity,
        card_type: card_type,
        fps_id: form_fps_id,
      },
      store_name: store_name,
      fps_id: session_fps_id,
      validationErrors: errors.array(),
    });
  }
  const admin = new Admin({
    aadhar: {
      aadhar_Id: aadhar_id,
      name: user_name,
      address: address,
      mobile: mobile,
    },
    ration_details: {
      user_Id: user_id,
      member_quantity: member_quantity,
      card_type: card_type,
      members: null,
    },
    store: {
      fps_id: form_fps_id,
    },
  });
  admin.save();
  if (member_quantity == 0) {
    console.log("User registered Successfully");
    res.render("userRegistration", {
      store_name: store_name,
      fps_id: session_fps_id,
      errorMessage: "User Registered Successfully !!!",
      oldInput: "",
    });
  } else {
    res.render("memberRegistration", {
      store_name: store_name,
      fps_id: session_fps_id,
      user_id: user_id,
      member_quantity: member_quantity,
      errorMessage: "",
      oldInput: "",
    });
  }
};

exports.postmemberRegistration = (req, res, next) => {
  const store_name = req.user.store_name;
  const session_fps_id = req.user.fps_id;
  const member_quantity = Number(req.body.member_quantity);
  const user_id = Number(req.body.user_id);
  const members = req.body.member;
  const member_names = req.body.member_name;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("memberRegistration", {
      errorMessage: errors.array()[0].msg,
      store_name: store_name,
      fps_id: session_fps_id,
      user_id: user_id,
      member_quantity: member_quantity,
      validationErrors: errors.array(),
    });
  }

  console.log(member_names);
  var insert_members = [];

  if (member_quantity > 1) {
    for (var i = 0; i < member_quantity; i++) {
      insert_members[i] = { member: members[i], member_name: member_names[i] };
    }
  } else if (member_quantity == 1) {
    for (var i = 0; i < member_quantity; i++) {
      insert_members[i] = { member: members, member_name: member_names };
    }
  }

  insert_members.forEach((element) => {
    console.log(element);
  });

  Admin.findOneAndUpdate(
    { "ration_details.user_Id": user_id }, // Filter criteria to find the document
    { $set: { "ration_details.members": insert_members } }, // Update operation
    { new: true },
  )
    .then((updatedCentral) => {
      console.log("Updated Central document:", updatedCentral);
      res.render("userRegistration", {
        store_name: store_name,
        fps_id: session_fps_id,
        errorMessage: "User Registered Successfully !!!",
        oldInput: "",
      });
      // Handle success if needed
    })
    .catch((error) => {
      console.error("Error updating central document:", error);
      // Handle error if needed
    });
};

exports.getSlots = async (req, res, next) => {
  try{
    const aadhar = req.user.aadhar
    const user = await User.findOne({
      aadhar:aadhar})
    if(!user){
      console.log("user not found")
      return res.redirect('/')
    }
    if(user.monthlyQuota){
      return res.render("Nobooking",{
        aadhar_name: req.user.name,
        aadhar:req.user.aadhar,
        oldInput:"",
        errorMessage:"",
      })
    }

    const store_id = req.params.store_id

    const todayString = new Date().toISOString().split('T')[0]

     let targetDate = req.query.date
     if(!targetDate){
      targetDate = todayString
     }
     if(targetDate<todayString){
      return res.status(400).render('booking',{
        aadhar_name: req.user.name,
        aadhar: req.user.aadhar,
        oldInput:"",
        errorMessage:"Invalid request: You cannot book slots for a date in the past.",
      })
     }

     const schedule = await SlotService.getOrGenerateSchedule(store_id,targetDate)

     return res.render("slots",{
      aadhar_name : req.user.name,
      aadhar: req.user.aadhar,
      slots: schedule.slots,
      store_id: store_id,
      targetDate: targetDate,
      errorMessage:"",
      oldInput:"",
     })
  } catch(err){
    console.log(err);
    next(err)
  }
};

exports.updateUserMonth = async () => {
  try {
    await User.updateMany({}, { $set: { monthlyQuota: false } });
  } catch (error) {
    console.error("Error updating monthly field:", error);
  }
};
exports.getConfirmation = (req, res, next) => {
  const store_id = req.params.store;
  const slot = req.query.slot;
  const targetDate = req.query.date;
  const user = req.user;
  const aadhar = user.aadhar;

  Admin.findOne({ "aadhar.aadhar_Id": aadhar })
    .then((data) => {
      const members_qty = data.ration_details.member_quantity;
      Store.findOne({ fps_id: store_id }).then((store) => {
        if (store) {
          return res.render("confirmation", {
            aadhar_name: req.user.name,
            aadhar: req.user.aadhar,
            slot: slot,
            store_id: store_id,
            targetDate:targetDate,
            members_qty: members_qty,
            user: user,
            store: store,
            errorMessage: "",
            oldInput: "",
          });
        } else {
          console.log("Store Not Found");
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getInventory = async (req, res, next) => {
  try{
    const fpsId = req.user.fps_id;

    const store = await StoreService.getStoreDetails(fpsId);

    res.render("inventory",{
      store: store,
      store_name: store.store_name,
      fps_id:fpsId,
    })
  }catch(err){
    console.error("Inventory Error:",err.message)
    res.redirect('/app/store-dash');
  }
};
exports.getUpdate = (req, res, next) => {
  const item = req.query.update;
  const fps_id = req.user.fps_id;
  Store.findOne({ fps_id: fps_id })
    .then((store) => {
      if (store) {
        const stock = store.commodities[item].stock;
        const item_name = store.commodities[item].item;
        const rate = store.commodities[item].rate;
        res.render("updateStock", {
          store_name: store.store_name,
          fps_id: fps_id,
          stock: stock,
          item_name: item_name,
          item: item,
          rate: rate,
        });
      } else {
        console.log("Store not found !");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postUpdate = async (req, res, next) => {
  try{
  const fps_id = req.user.fps_id;
  const {updatedstock,updatedrate, item} = req.body;
 
  const store = await StoreService.getStoreDetails(fps_id);

  const commodityName = store.commodities[item].item;

  await StoreService.updateStock(fps_id,commodityName,updatedrate,updatedstock);

  console.log(`Updated ${commodityName} for store ${fps_id}`)

  res.redirect("/app/inventory"+fps_id)
}catch(err){
  console.error("Error in postUpdate:",err.message);
  res.redirect('/app/store-dash')
}
};
// exports.getslotManage = (req,res,next)=>{
//     const store_id = req.params.store_id;

// }
exports.getstore = (req, res, next) => {
  const store_id = req.params.store_id;
  const store_name = req.user.store_name;
  const fps_id = req.user.fps_id;
  res.render("store", {
    store_name: store_name,
    fps_id: fps_id,
    errorMessage: "",
    oldInput: "",
  });
};

exports.getfindtheStore = (req, res, next) => {
  const aadhar = req.user.aadhar;
  User.findOne({ aadhar: aadhar })
    .then((user) => {
      if (!user) {
        console.log("user not found");
      } else {
        res.render("findtheStore", {
          aadhar_name: req.user.name,
          aadhar: req.user.aadhar,
          oldInput: "",
          errorMessage: "",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getStoreinfo = (req, res, next) => {
  const user = req.user.usertype;
  const aadhar_name = req.user.name;
  const aadhar = req.user.aadhar;
  const store_id = req.params.id;
  Store.findOne({ fps_id: store_id })
    .then((store) => {
      if (store) {
        res.render("storeinfo", {
          user: user,
          aadhar_name: aadhar_name,
          aadhar: aadhar,
          store_name: store.store_name,
          fps_id: store.fps_id,
          distributor: store.distributor,
          address: store.address,
          tehsil: store.tehsil,
          telephone: store.telephone,
        });
      } else {
        console.log("Store not found");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.completeConfirmation = async (req, res, next) => {

  try{
    const store_name = req.body.store_name
    const slot = Number(req.body.slot)
    const store_address = req.body.store_address
    const distributor = req.body.distributor
    const commodity = req.body.commodity || [];
    const unit = req.body.price||[]
    const rate = req.body.rate || []
    const price = req.body.price || []
    const total = Number(req.body.total)
    const store_id = Number(req.body.store_id)
    const aadhar = Number(req.user.aadhar)

    const targetDate = req.body.date || new Date().toISOString().split('T')[0]

    const pendingOrder = await Order.findOne({
      aadhar:aadhar,completed:false})
    if(pendingOrder){
      return res.status(400).send("Action Denied: You already have a pending confirmation receipt.");
    }

    const commodities = []

    for(let i = 0; i<commodity.length; i++){
      commodities[i] = {
        commodity: commodity[i],
        unit: Number(unit[i]),
        price: Number(price[i]),
        rate: Number(rate[i]),
      }
    }

    await SlotService.bookSlot(store_id,targetDate,slot);

    const order = new Order({
      aadhar: aadhar,
      store_id:store_id,
      completed:false,
      slot: slot,
      date: new Date(),
      commodities: commodities,
      total: total,
      unit:unit,
      price:price,
      rate:rate,
    })
     await order.save();

     res.redirect("/app/userPreviousTrans");
  }catch(err){
    console.error("Booking Error:", err.message)

    res.status(400).send("Transaction Failed: "+ err.message)
  }
};
exports.getuserPreviousTrans = (req, res, next) => {
  const aadhar = req.user.aadhar;
  Order.find({ aadhar: aadhar })
    .then((orders) => {
      res.render("userPrevTrans", {
        aadhar_name: req.user.name,
        aadhar: req.user.aadhar,
        orders: orders,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getupcomingStoretrans = async (req, res, next) => {
 try{
  const fpsId = req.user.fps_id

  const orders = await OrderService.getPendingOrders(fpsId)

  const store = await StoreService.getStoreDetails(fpsId)

  res.render("upcomingStoretrans",{
    store_name:store.store_name,
    fps_id : fpsId,
    orders : orders,
    slots : store.slots,
    user : req.user
  })
 }catch(err){
  console.error("Error fetching pending orders:",err.message)
  res.redirect('/app/store-dash')
 }
};
exports.getstorePrevTrans = async (req, res, next) => {
  try{
    const fpsId = req.user.fps_id
    const orders = await OrderService.getCompletedOrders(fpsId)

    res.render("storePrevTrans",{
      store_name : req.user.store_name,
      fps_id : fpsId,
      orders:orders,
      user:req.user
    })
  }catch(err){
    console.error("Error fetching history: ",err.message)
    res.redirect('/app/store-dash');
  }
};
exports.getconfrecipt = (req, res, next) => {
  const order_id = req.params.order_id;
  Order.findOne({ _id: order_id })
    .then((order) => {
      if (!order) {
        console.log("No order found");
      }
      if (
        Number(order.aadhar) == Number(req.user.aadhar) ||
        Number(order.store_id) == Number(req.user.fps_id)
      ) {
        console.log("authorized");
      } else {
        console.log("Not authorized");
      }
      Store.findOne({ fps_id: order.store_id }).then((store) => {
        if (store) {
          const store_address = store.store_address;
          const store_name = store.store_name;
          const pincode = store.pincode;
          const tehsil = store.tehsil;
          Admin.findOne({ "aadhar.aadhar_Id": order.aadhar })
            .then((user) => {
              const user_name = user.aadhar.name;
              const ration_id = user.ration_details.user_Id;
              const user_mobile = user.aadhar.mobile;

              const confreciptName = "invoice-" + order_id + ".pdf";
              const confreciptPath = path.join(
                "user",
                "invoice",
                confreciptName,
              );
              const pdfDoc = new PDFDocument();
              res.setHeader("Content-Type", "application/pdf");
              res.setHeader(
                "Content-Disposition",
                'inline; filename="' + confreciptName + '"',
              );
              pdfDoc.pipe(fs.createWriteStream(confreciptPath));
              pdfDoc.pipe(res);
              pdfDoc
                .font("public/gilroy/Gilroy-Heavy.ttf")
                .fontSize(30)
                .fillColor("red")
                .text("EasyRation.", {
                  underline: false,
                  align: "center",
                })
                .moveDown(0.5);
              pdfDoc
                .font("public/gilroy/Gilroy-Bold.ttf")
                .fontSize(21)
                .text("Confirmation Recipt", {
                  underline: true,
                  align: "center",
                });
              pdfDoc.text("--------------------------------------------", {
                align: "center",
              });
              pdfDoc
                .fontSize(15)
                .text(`Store Id: ${order.store_id}`, 400, 130, {
                  align: "right",
                });
              pdfDoc
                .fontSize(13)
                .text(`confirmation Id: ${order._id}`, 50, 200, {
                  align: "right",
                });
              pdfDoc.fontSize(13).text(`Aadhar: ${order.aadhar}`, 50, 200, {
                align: "left",
              });
              pdfDoc.fontSize(13).text(`Store name: ${store_name}`, 50, 230, {
                align: "right",
              });
              pdfDoc
                .fontSize(13)
                .text(`Store address: ${store_address}`, 50, 260, {
                  align: "right",
                });
              pdfDoc.fontSize(13).text(`Tehsil: ${tehsil}`, 50, 290, {
                align: "right",
              });
              pdfDoc.text(`Beneficiary Name: ${user_name}`, 50, 230, {
                align: "left",
              });
              pdfDoc.text(`Beneficiary Id: ${ration_id}`, 50, 260, {
                align: "left",
              });
              pdfDoc.text(`Mobile number: ${user_mobile}`, 50, 290, {
                align: "left",
              });
              // .text(`Invoice Date: ${order.date}`, 50, 230)
              pdfDoc
                .fontSize(15)
                .text(
                  `Slot: ` +
                    `${order.slot}`.slice(0, 2) +
                    `:` +
                    `${order.slot}`.slice(2),
                  50,
                  130,
                );
              pdfDoc.text(`commodity`, 105, 340, {
                // align:'left'
              });
              pdfDoc.text(`unit`, 250, 340, {
                // align:'center'
              });
              pdfDoc.text(`rate`, 350, 340, {
                // align:'center'
              });
              pdfDoc.text(`price`, 450, 340, {
                // align:'center'
              });
              for (var i = 1; i <= order.commodities.length; i++) {
                pdfDoc.text(
                  `${order.commodities[i - 1].commodity}`,
                  100,
                  360 + i * 50,
                  {},
                );
                pdfDoc.text(
                  `${order.commodities[i - 1].unit}`,
                  260,
                  360 + i * 50,
                  {
                    lineBreak: true,
                  },
                );
                pdfDoc.text(
                  `${order.commodities[i - 1].rate}`,
                  360,
                  360 + i * 50,
                  {
                    lineBreak: true,
                  },
                );
                pdfDoc.text(
                  `${order.commodities[i - 1].price}`,
                  460,
                  360 + i * 50,
                  {
                    lineBreak: true,
                  },
                );
              }
              pdfDoc.text(
                "------------------------------------------------------------------",
                50,
                580,
                {
                  align: "center",
                  width: 500,
                },
              );
              pdfDoc.text(`Grand Total :${order.total}`, 370, 620, {
                width: 500,
              });
              pdfDoc
                .fontSize(14)
                .text(
                  `User should reach store in alloted slot otherwise this confirmation is get expired.`,
                  100,
                  655,
                  {
                    align: "left",
                  },
                );
              pdfDoc.fontSize(12).text(`Generated on:${order.date}`, 100, 695, {
                width: 500,
              });
              // pdfDoc.text(order.fps_id, 300, 200)
              // // .text(shipping.address, 300, 215)
              // // .text(
              // // 	`${shipping.city}, ${shipping.state}, ${shipping.country}`,
              // // 	300,
              // // 	130,
              // // )
              // .moveDown();
              pdfDoc.end();
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getrecipt = (req, res, next) => {
  const order_id = req.params.order_id;
  Order.findOne({ _id: order_id })
    .then((order) => {
      if (!order) {
        console.log("No order found");
      }
      if (
        Number(order.aadhar) == Number(req.user.aadhar) ||
        Number(order.store_id) == Number(req.user.fps_id)
      ) {
        console.log("authorized");
      } else {
        console.log("Not authorized");
      }
      Store.findOne({ fps_id: order.store_id }).then((store) => {
        if (store) {
          const store_address = store.store_address;
          const store_name = store.store_name;
          const pincode = store.pincode;
          const tehsil = store.tehsil;
          Admin.findOne({ "aadhar.aadhar_Id": order.aadhar })
            .then((user) => {
              const user_name = user.aadhar.name;
              const ration_id = user.ration_details.user_Id;
              const user_mobile = user.aadhar.mobile;

              const confreciptName = "invoice-" + order_id + ".pdf";
              const confreciptPath = path.join(
                "user",
                "invoice",
                confreciptName,
              );
              const pdfDoc = new PDFDocument();
              res.setHeader("Content-Type", "application/pdf");
              res.setHeader(
                "Content-Disposition",
                'inline; filename="' + confreciptName + '"',
              );
              pdfDoc.pipe(fs.createWriteStream(confreciptPath));
              pdfDoc.pipe(res);
              pdfDoc
                .font("public/gilroy/Gilroy-Heavy.ttf")
                .fontSize(30)
                .fillColor("green")
                .text("EasyRation.", {
                  underline: false,
                  align: "center",
                })
                .moveDown(0.5);
              pdfDoc
                .font("public/gilroy/Gilroy-Bold.ttf")
                .fontSize(21)
                .text("Invoice", {
                  underline: true,
                  align: "center",
                });

              pdfDoc.text("--------------------------------------------", {
                align: "center",
              });
              pdfDoc
                .fontSize(15)
                .text(`Store Id: ${order.store_id}`, 400, 130, {
                  align: "right",
                });

              pdfDoc.fontSize(13).text(`Invoice Id: ${order._id}`, 50, 200, {
                align: "right",
              });
              pdfDoc.fontSize(13).text(`Aadhar: ${order.aadhar}`, 50, 200, {
                align: "left",
              });
              pdfDoc.fontSize(13).text(`Store name: ${store_name}`, 50, 230, {
                align: "right",
              });
              pdfDoc
                .fontSize(13)
                .text(`Store address: ${store_address}`, 50, 260, {
                  align: "right",
                });
              pdfDoc.fontSize(13).text(`Tehsil: ${tehsil}`, 50, 290, {
                align: "right",
              });
              pdfDoc.text(`Beneficiary Name: ${user_name}`, 50, 230, {
                align: "left",
              });
              pdfDoc.text(`Beneficiary Id: ${ration_id}`, 50, 260, {
                align: "left",
              });
              pdfDoc.text(`Mobile number: ${user_mobile}`, 50, 290, {
                align: "left",
              });
              // .text(`Invoice Date: ${order.date}`, 50, 230)
              pdfDoc
                .fontSize(15)
                .text(
                  `Slot: ` +
                    `${order.slot}`.slice(0, 2) +
                    `:` +
                    `${order.slot}`.slice(2),
                  50,
                  130,
                );
              pdfDoc.text(`commodity`, 105, 340, {
                // align:'left'
              });
              pdfDoc.text(`unit`, 250, 340, {
                // align:'center'
              });
              pdfDoc.text(`rate`, 350, 340, {
                // align:'center'
              });
              pdfDoc.text(`price`, 450, 340, {
                // align:'center'
              });
              for (var i = 1; i <= order.commodities.length; i++) {
                pdfDoc.text(
                  `${order.commodities[i - 1].commodity}`,
                  100,
                  360 + i * 50,
                  {},
                );
                pdfDoc.text(
                  `${order.commodities[i - 1].unit}`,
                  260,
                  360 + i * 50,
                  {
                    lineBreak: true,
                  },
                );
                pdfDoc.text(
                  `${order.commodities[i - 1].rate}`,
                  360,
                  360 + i * 50,
                  {
                    lineBreak: true,
                  },
                );
                pdfDoc.text(
                  `${order.commodities[i - 1].price}`,
                  460,
                  360 + i * 50,
                  {
                    lineBreak: true,
                  },
                );
              }
              pdfDoc.text(
                "------------------------------------------------------------------",
                50,
                580,
                {
                  align: "center",
                  width: 500,
                },
              );
              pdfDoc.text(`Grand Total :${order.total}`, 370, 620, {
                width: 500,
              });
              pdfDoc.text(`FPS Stamp and signature`, 100, 670, {
                width: 500,
              });
              pdfDoc.fontSize(12).text(`Generated on:${order.date}`, 100, 695, {
                width: 500,
              });
              // pdfDoc.text(order.fps_id, 300, 200)
              // // .text(shipping.address, 300, 215)
              // // .text(
              // // 	`${shipping.city}, ${shipping.state}, ${shipping.country}`,
              // // 	300,
              // // 	130,
              // // )
              // .moveDown();
              pdfDoc.end();
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getcompletetrans = async (req, res, next) => {
try{
  const orderId = req.params.order_id

  await OrderService.completeTransactions(orderId)

  console.log(`Transaction completed for Order ${orderId}`)

  res.redirect('/app/upcomingStoretrans')
}catch(err){
  console.error("Transaction Error:", err.message)
  res.redirect("/app/upcomingStoretrans")
}
};
