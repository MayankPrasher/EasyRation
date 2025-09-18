// const user = require('../models/user');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const Store = require('../models/store');
const Admin = require('../models/central');
const Order = require('../models/order');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const axios = require('axios');
const {validationResult} = require('express-validator');
var mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const user = require('../models/user');
const central = require('../models/central');
// mongoose.set('debug', true);
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'rosario.torphy@ethereal.email',
        pass: '6qhnCSKuejbqGUX2Rc'
    }
});

exports.getmain = (req ,res , next )=> {
    const aadhar = req.session.user.aadhar;
    Admin.findOne({'aadhar.aadhar_Id':aadhar})
    .then(user=>{
        if(user){
          const ration_card_id = user.ration_details.user_Id;
          const aadhar_name = user.aadhar.name;
          const aadhar_address = user.aadhar.address;
          const store_id = user.store.fps_id;
          const card_type = user.ration_details.card_type;
          const members = user.ration_details.members;
          const members_qty = user.ration_details.member_quantity;
    //       const store = new Store({
    //         fps_id : 7525 ,
    //         distributor:'SARASWATI DEVI',
    //         store_name:'M/S SARASWATI STORE',
    //         store_address:'88 - A AMRIT PURI GARHI NEW DELHI KALKAJI',
    //         pincode:110019,
    //         tehsil:'Kalkaji',
    //        slots: [
    //     {
    //       slot: 900,
    //       booked: 0,
    //       active: true
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 920
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 940
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 1000
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 1020
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 1040
    //     },
    //     {
    //       active: true,
    //       booked: 3,
    //       slot: 1100
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 1120
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 1140
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 1200
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 1220
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 1240
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 1400
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 1420
    //     },
    //     {
    //       active: true,
    //       booked: 0,
    //       slot: 1440
    //     }
    //   ],
    //  telephone:9213298772,
    //  FSO_area:1,
    //   store_email: "saras@gmail.com",
    //   otp: "9g4z6h",
    //   commodities: [
    //     {
    //       commodity: "Rice",
    //       rate: 20,
    //       item: "Rice",
    //       stock: 266
    //     },
    //     {
    //       commodity: "Wheat",
    //       rate: 30,
    //       item: "Wheat",
    //       stock: 1907
    //     },
    //     {
    //       commodity: "Sugar",
    //       rate: 24,
    //       item: "Sugar",
    //       stock: 3267
    //     },
    //     {
    //       commodity: "Kerosene",
    //       rate: 15,
    //       item: "Kerosene",
    //       stock: 4871
    //     }
    //   ],
    //   usertype: "store"
    //     });
    //       store.save();
          Store.findOne({fps_id:store_id})
          .then(store=>{
            if(store){
                const store_name = store.store_name;
                const store_fso = store.FSO_area;
                return res.render('rationcard',{
                    aadhar:req.session.user.aadhar,
                    ration_card_id : ration_card_id,
                    aadhar_name :aadhar_name,
                    aadhar_address :aadhar_address,
                    store_id:store_id,
                    card_type:card_type,
                    members:members,
                    members_qty:members_qty,
                    store_name:store_name,
                    store_fso:store_fso,
                });
            }
            else{
                console.log("store not found");
            }
          })
          .catch(err=>{
            console.log(err);
          })
        }
        else{
            console.log("User not found");
        }
    }

    )
    .catch(err=>{
        console.log(err);
    })
  
};
exports.getStores = (req , res, next) =>{
    var flag = undefined;
    if(req.params.flag){
        flag = req.params.flag;
        console.log(flag);
    }
     const enteredpin = req.body.enteredpin;
     const errors = validationResult(req);
     if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('booking',{
            aadhar_name:req.session.user.name,
            aadhar:req.session.user.aadhar,
            errorMessage:errors.array()[0].msg,
            oldInput:{enteredpin:enteredpin},
            validationErrors:errors.array(),
        });
}
Store.find({pincode:enteredpin})
.then(stores=>{
    if(stores.length<=0){
        return res.status(422).render('booking',{
            aadhar_name:req.session.user.name,
            aadhar:req.session.user.aadhar,
            errorMessage:"Invalid Pincode",
            oldInput:{enteredpin:enteredpin},
            validationErrors:errors.array(),
            flag:flag
        });
    }
    else{
        res.render('chooseStore',{
            aadhar_name:req.session.user.name,
            aadhar:req.session.user.aadhar,
            stores:stores,
            isAuth:req.session.isLoggedIn,
            flag:flag
        });
    }
    
})
.catch(err=>{
    console.log(err);
});
 
};

exports.getBooking = (req , res, next) =>{
    const aadhar = req.session.user.aadhar;
    User.findOne({aadhar:aadhar})
    .then(user=>{
       if(!user){
        console.log("user not found");
       }
       else{
        if(user.monthlyQuota){
            res.render('Nobooking',{
                aadhar_name:req.session.user.name,
                aadhar:req.session.user.aadhar,
                oldInput:"",
                errorMessage:""
            });
        }else{
            res.render('booking',{
                aadhar_name:req.session.user.name,
                aadhar:req.session.user.aadhar,
                oldInput:"",
                errorMessage:""
            });
        }
       }
    })
    .catch(err=>{
        console.log(err);
    })
   

};
exports.getStoreDash = (req , res, next) =>{
    const user = req.session.user.usertype;
    const store_name = req.session.user.store_name;
    const fps_id = req.session.user.fps_id;
    const distributor = req.session.user.distributor;
    const address = req.session.user.store_address;
    const tehsil = req.session.user.tehsil;
    const telephone = req.session.user.telephone;
    console.log(user);
    res.render('storedash',{
        user:user,
        store_name:store_name,
        fps_id:fps_id,
        distributor:distributor,
        address:address,
        tehsil:tehsil,
        telephone:telephone
    })
};
exports.getuserRegistration = (req,res,next)=>{
    const store_name = req.session.user.store_name;
    const fps_id = req.session.user.fps_id;
    res.render('userRegistration',{
        store_name:store_name,
        fps_id: fps_id,
        errorMessage:"",
        oldInput:""
    });

};
exports.postuserRegistration = (req,res,next)=>{
    const store_name = req.session.user.store_name;
    const session_fps_id = req.session.user.fps_id;
    const aadhar_id = req.body.aadhar_id;
    const user_name = req.body.name;
    const address = req.body.address;
    const mobile = req.body.mobile;
    const user_id = req.body.user_id;
    const member_quantity = req.body.member_quantity;
    const card_type = req.body.card_type;
    const form_fps_id = req.body.fps_id;
    const errors = validationResult(req);
     if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('userRegistration',{
            errorMessage:errors.array()[0].msg,
            oldInput:{aadhar_id:aadhar_id,name:user_name,address:address,mobile:mobile,user_id:user_id,member_quantity:member_quantity,card_type:card_type,fps_id:form_fps_id},
            store_name:store_name,
             fps_id:session_fps_id,
            validationErrors:errors.array(),
        })
}
            const admin = new Admin({
                aadhar:{
                    aadhar_Id:aadhar_id,
                    name:user_name,
                    address:address,
                    mobile:mobile,
                },
                ration_details:{
                    user_Id:user_id,
                    member_quantity:member_quantity,
                    card_type:card_type,
                    members:null
                },
                store:{
                    fps_id:form_fps_id
                }
            });
            admin.save();
            if(member_quantity==0){
               console.log("User registered Successfully")
               res.render('userRegistration',{
                store_name:store_name,
                fps_id: session_fps_id,
                errorMessage:"User Registered Successfully !!!",
                oldInput:""
            });
            }
            else{
                res.render('memberRegistration',{
                    store_name:store_name,
                    fps_id: session_fps_id,
                    user_id:user_id,
                    member_quantity:member_quantity,
                    errorMessage:"",
                    oldInput:""
                });
            }
};

exports.postmemberRegistration = (req , res, next) =>{
    const store_name = req.session.user.store_name;
    const session_fps_id = req.session.user.fps_id;
    const member_quantity = Number(req.body.member_quantity); 
    const user_id = Number(req.body.user_id);
    const members = req.body.member;
    const member_names = req.body.member_name;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('memberRegistration',{
            errorMessage:errors.array()[0].msg,
            store_name:store_name,
            fps_id: session_fps_id,
            user_id:user_id,
            member_quantity:member_quantity,
            validationErrors:errors.array(),
        })
}

console.log(member_names);
var insert_members = [];

if(member_quantity>1){
    for (var i = 0; i < member_quantity; i++) {
        insert_members[i] = { member:members[i] , member_name:member_names[i]};
    } 
}
else if(member_quantity==1){
    for (var i = 0; i < member_quantity; i++) {
        insert_members[i] = { member:members , member_name:member_names};
    }
}

insert_members.forEach(element => {
    console.log(element);
});

Admin.findOneAndUpdate(
    { 'ration_details.user_Id': user_id }, // Filter criteria to find the document
    { $set: { 'ration_details.members': insert_members } }, // Update operation
    { new: true }
)
    .then(updatedCentral => {
        console.log("Updated Central document:", updatedCentral);
        res.render('userRegistration',{
            store_name:store_name,
            fps_id: session_fps_id,
            errorMessage:"User Registered Successfully !!!",
            oldInput:""
        });
        // Handle success if needed
    })
    .catch(error => {
        console.error("Error updating central document:", error);
        // Handle error if needed
    });
};

exports.getSlots = (req , res, next) =>{
    const aadhar = req.session.user.aadhar;
    User.findOne({aadhar:aadhar})
    .then(user=>{
       if(!user){
        console.log("user not found");
       }
       else{
        if(user.monthlyQuota){
            res.render('Nobooking',{
                aadhar_name:req.session.user.name,
                aadhar:req.session.user.aadhar,
                oldInput:"",
                errorMessage:""
            });
        }else{
            const store_id = req.params.store_id;
            const update = {
                $pull: {
                    slots: {
                      $or: [
                        { booked: { $gte: 10 } }, 
                        { active: false }         
                      ]
                    }
                  }
            }
            Store.updateOne({fps_id:store_id},update)
            .then(
                ack=>{
                    console.log(ack);
                }
            )
            Store.findOne({fps_id:store_id})
        .then(store=>{
        if(store){
          const slots = store.slots;
          return res.render('slots',{
            aadhar_name:req.session.user.name,
            aadhar:req.session.user.aadhar,
            slots:slots,
            store_id:store_id,
            errorMessage:"",
            oldInput:""
          });
        }
        else{
            console.log("Store Not Found");
        }
    })
        }
       }
    })
    .catch(err=>{
        console.log(err);
    })
    .catch(
        err=>{
            console.log(err);
        }
    )
    .catch(err=>{
        console.log(err);
    })
    
    
};
exports.updateSlot = async() =>{
    const update = {
        $set:{
            'slots.0.slot':900,
            'slots.0.booked':0,
            'slots.0.active':true,
            'slots.1.slot':920,
            'slots.1.booked':0,
            'slots.1.active':true,
            'slots.2.slot':940,
            'slots.2.booked':0,
            'slots.2.active':true,
            'slots.3.slot':1000,
            'slots.3.booked':0,
            'slots.3.active':true,
            'slots.4.slot':1020,
            'slots.4.booked':0,
            'slots.4.active':true,
            'slots.5.slot':1040,
            'slots.5.booked':0,
            'slots.5.active':true,
            'slots.6.slot':1100,
            'slots.6.booked':0,
            'slots.6.active':true,
            'slots.7.slot':1120,
            'slots.7.booked':0,
            'slots.7.active':true,
            'slots.8.slot':1140,
            'slots.8.booked':0,
            'slots.8.active':true,
            'slots.9.slot':1200,
            'slots.9.booked':0,
            'slots.9.active':true,
            'slots.10.slot':1220,
            'slots.10.booked':0,
            'slots.10.active':true,
            'slots.11.slot':1240,
            'slots.11.booked':0,
            'slots.11.active':true,
            'slots.12.slot':1400,
            'slots.12.booked':0,
            'slots.12.active':true,
            'slots.13.slot':1420,
            'slots.13.booked':0,
            'slots.13.active':true,
            'slots.14.slot':1440,
            'slots.14.booked':0,
            'slots.14.active':true,
        }
    }
    try{
    await Store.updateMany({},update);
    }
    catch(err){
        console.error('Error to update the slot',err);
    }
}
exports.updateUserMonth = async()=>{
    try{
        await User.updateMany({}, {$set:{ monthlyQuota:false}});
    }catch(error){
       console.error('Error updating monthly field:',error);
    }
}
exports.getConfirmation = (req,res,next)=>{
    const store_id = req.params.store;
    const slot = req.query.slot;
    const user = req.session.user;
    const aadhar = user.aadhar;
    Admin.findOne({'aadhar.aadhar_Id':aadhar})
    .then(data=>{
         const members_qty = data.ration_details.member_quantity;
         Store.findOne({fps_id:store_id})
         .then(store=>{
             if(store){
               return res.render('confirmation',{
                aadhar_name:req.session.user.name,
                aadhar:req.session.user.aadhar,
                 slot:slot,
                 store_id:store_id,
                 members_qty:members_qty,
                 user:user,
                 store:store,
                 errorMessage:"",
                 oldInput:""
               });
             }
             else{
                 console.log("Store Not Found");
             }
         })
    })
    .catch(err=>{
        console.log(err);
    })
}
exports.getInventory = (req,res,next)=>{
    const store_name = req.session.user.store_name;
    const session_fps_id = req.session.user.fps_id;
    if(req){
       Store.findOne({fps_id:session_fps_id})
       .then(
           store=>{
            if(store){
                res.render('inventory',{
                    store:store,
                    store_name:store_name,
                    fps_id:session_fps_id
                });
            }
            else{
                console.log("Store not found");
            }
           }
       )
       .catch(err=>{
        console.log(err);
       })
        
    }
}
exports.getUpdate = (req,res,next)=>{
    const item = req.query.update;
    const fps_id = req.session.user.fps_id;
    Store.findOne({fps_id:fps_id})
    .then( 
        store=>{
            if(store){
                const stock =  store.commodities[item].stock;
                const item_name = store.commodities[item].item;
                const rate = store.commodities[item].rate;
                res.render('updateStock',{
                    store_name:store.store_name,
                    fps_id:fps_id,
                    stock:stock,
                    item_name:item_name,
                    item:item,
                    rate:rate
                })
            }
            else{
                console.log("Store not found !")
            }
        }
    )
    .catch(err=>{
        console.log(err);
    })
    
}
exports.postUpdate = (req,res,next)=>{
    const fps_id = req.session.user.fps_id;
    const updatedstock = req.body.updatedstock;
    const item = req.body.item;
    const updatedrate = req.body.updatedrate;
    const item_name = req.session.user.commodities[item].item;

    Store.updateOne({fps_id:fps_id,'commodities.item':item_name},{$set:{'commodities.$.stock':updatedstock}})
    .then(
        Store.updateOne({fps_id:fps_id,'commodities.item':item_name},{$set:{'commodities.$.rate':updatedrate}})
        .then(store=>{
            if(store){
             console.log('done')
             res.redirect('/app/inventory/'+fps_id);
            }
            else{
                console.log("Store not found");
            }
        })
    )
    .catch(err=>{
        console.log(err);
    })
}
exports.getslotManage = (req,res,next)=>{
    const store_id = req.params.store_id;

}
exports.getstore = (req,res,next)=>{
    const store_id = req.params.store_id;
    const store_name = req.session.user.store_name;
    const fps_id = req.session.user.fps_id;
    res.render('store',{
        store_name:store_name,
        fps_id: fps_id,
        errorMessage:"",
        oldInput:""
    });

}

exports.getfindtheStore = (req,res,next)=>{
    const aadhar = req.session.user.aadhar;
    User.findOne({aadhar:aadhar})
    .then(user=>{
       if(!user){
        console.log("user not found");
       }
       else{
            res.render('findtheStore',{
                aadhar_name:req.session.user.name,
                aadhar:req.session.user.aadhar,
                oldInput:"",
                errorMessage:""
            });
       }
    })
    .catch(err=>{
        console.log(err);
    })
}

exports.getStoreinfo = (req,res,next)=>{
    const user = req.session.user.usertype;
    const aadhar_name =req.session.user.name;
    const aadhar = req.session.user.aadhar;
    const store_id = req.params.id;
    Store.findOne({'fps_id':store_id})
    .then(store=>{
       if(store){
        res.render('storeinfo',{
            user:user,
            aadhar_name:aadhar_name,
            aadhar:aadhar,
            store_name:store.store_name,
            fps_id:store.fps_id,
            distributor:store.distributor,
            address:store.address,
            tehsil:store.tehsil,
            telephone:store.telephone
        })
       }else{
        console.log("Store not found");
       }

    })
    .catch(err=>{
        console.log(err);
    })
}
exports.completeConfirmation = (req,res,next)=>{
    const store_name = req.body.store_name;
    const slot = Number(req.body.slot);
    const store_address = req.body.store_address;
    const distributor = req.body.distributor;
    const commodity = req.body.commodity;
    const unit = req.body.unit;
    const rate = req.body.rate;
    const price = req.body.price;
    const total = Number(req.body.total);
    const store_id =  Number(req.body.store_id);
    const aadhar = Number(req.session.user.aadhar);
    const date = new Date();

    const commodities = [];

    for(let i = 0 ; i<commodity.length;i++){
        commodities[i]={
            commodity:commodity[i],
            unit:Number(unit[i]),
            price:Number(price[i]),
            rate:Number(rate[i])
        }
    }
    // const updateQuery = {
    //     $inc: {
    //       "commodities.$[elem].stock": -Number(unit[0]) 
    //     }
    //   };
    // const updateBookQuery = {
    //     $inc: {
    //       "slots.$[elem].booked": 1 
    //     }
    //   };
    //   var bookFilter =[];
    //   if(slot==900){
    //     bookFilter = [{
    //         "elem.slot":900
    //       }];
    //   }
    //   else if(slot==920){
    //      bookFilter = [{
    //         "elem.slot":920
    //       }];
    //   }
    //   else if(slot==940){
    //      bookFilter = [{
    //         "elem.slot":940
    //       }];
    //   }
    //   else if(slot==1000){
    //      bookFilter = [{
    //         "elem.slot":1000
    //       }];
    //   }
    //   else if(slot==1020){
    //      bookFilter = [{
    //         "elem.slot":1020
    //       }];
    //   }
    //   else if(slot==1040){
    //      bookFilter = [{
    //         "elem.slot":1040
    //       }];
    //   }
    //   else if(slot==1100){
    //      bookFilter = [{
    //         "elem.slot":1100
    //       }];
    //   }
    //   else if(slot==1120){
    //      bookFilter = [{
    //         "elem.slot":1120
    //       }];
    //   }
    //   else if(slot==1140){
    //      bookFilter = [{
    //         "elem.slot":1140
    //       }];
    //   }
    //   else if(slot==1200){
    //      bookFilter = [{
    //         "elem.slot":1200
    //       }];
    //   }
    //   else if(slot==1220){
    //      bookFilter = [{
    //         "elem.slot":1200
    //       }];
    //   }
    //   else if(slot==1240){
    //  bookFilter = [{
    //         "elem.slot":1200
    //       }];
    //   }
    //   else if(slot==1400){
    //      bookFilter = [{
    //         "elem.slot":1200
    //       }];
    //   }
    //   else if(slot==1420){
    //      bookFilter = [{
    //         "elem.slot":1200
    //       }];
    //   }
    //   else if(slot==1440){
    //      bookFilter = [{
    //         "elem.slot":1200
    //       }];
    //   }
    //   console.log(bookFilter);
    //   const riceFilter = [{
    //     "elem.item":"Rice"
    //   }];
    //   const wheatFilter = [{
    //     "elem.item":"Wheat"
    //   }];
    //   const sugarFilter = [{
    //     "elem.item":"Sugar"
    //   }];
    //   const oilFilter = [{
    //     "elem.item":"Kerosene"
    //   }];
        // console.log(commodities);
        // console.log(store_id);
        // console.log(aadhar);
        // console.log(date);
        // const data = {
        //     "merchantId": "M2306160483220675579140",
        //     "merchantTransactionId": "e3e1mmcccdmm9ef8vdfmd7b",
        //     "merchantUserId": "MUID123",
        //     "amount": total*100,
        //     "redirectUrl": "http://localhost:4001/app/userPreviousTrans",
        //     "redirectMode": "REDIRECT",
        //     // "callbackUrl": "https://webhook.site/callback-url",
        //     "mobileNumber": "9999999999",
        //     "paymentInstrument": {
        //       "type": "PAY_PAGE"
        //     }
        //   }
        //   const payload = JSON.stringify(data);
        //   const payloadMain = Buffer.from(payload).toString('base64');
        //   const key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
        //   const keyIndex = 1;
        //   const string = payloadMain + '/pg/v1/pay'+key;
        //   const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        //   const checksum = sha256 + "###" +keyIndex;
        //     const options = {
        //     method: 'post',
        //     url: 'https://mercury-uat.phonepe.com/v3/charge',
        //     headers: {
        //             accept: 'application/json',
        //             'Content-Type': 'application/json',
        //             'X-VERIFY':checksum
        //                     },
        //     data: {
        //         request : payloadMain
        //     }
        //     };
            // axios
            // .request(options)
                // .then(function (response) {
                //    Store.updateOne({fps_id:store_id},updateQuery,{arrayFilters:riceFilter})
                //    .then(
                //     ack=>{
                //         Store.updateOne({fps_id:store_id},updateQuery,{arrayFilters:wheatFilter})
                //         .then(
                //             ack2=>{
                //                 Store.updateOne({fps_id:store_id},updateQuery,{arrayFilters:sugarFilter})
                //                 .then(
                //                     ack3=>{
                //                         Store.updateOne({fps_id:store_id},updateQuery,{arrayFilters:oilFilter})
                //                        .then(
                //                         Store.updateOne({fps_id:store_id},updateBookQuery,{arrayFilters:bookFilter})
                //                         .then(
                //                             ack5=>{
                //                                 User.updateOne({aadhar:req.session.user.aadhar},{$set:{monthlyQuota:true}})
                //                                 .then(ack7=>{
                //                                     console.log(ack7)
                //                                 })
                //                                 .catch(err=>{
                //                                     console.log(err);
                //                                 })
                //                             }
                //                         )
                //                        )
                //                     }
                //                 )
                //             }
                //         )
                //         .catch(err=>{
                //             console.log(err);
                //         })
                //     }
                //    )
                const order = new Order({
                    aadhar : aadhar,
                    store_id:store_id,
                    completed:false,
                    slot:slot,
                    date:date,
                    commodities:commodities,
                    total:total,
                    unit:unit,
                    price:price,
                    rate:rate
                });
                order.save();
                res.redirect('http://localhost:4001/app/userPreviousTrans');
                // return response.data;
            // })
        //     .then(result=>{
        //         console.log("Success");
        //  })
    
}
exports.getuserPreviousTrans = (req,res,next)=>{
    const aadhar = req.session.user.aadhar;
    Order.find({aadhar:aadhar})
    .then(orders=>{
        console.log(orders);
        res.render('userPrevTrans',{
            aadhar_name:req.session.user.name,
            aadhar:req.session.user.aadhar,
            orders:orders
         });
    })
    .catch(err=>{
        console.log(err);
    })
}
exports.getupcomingStoretrans = (req,res,next)=>{
    const store_id = req.session.user.fps_id;
    Store.findOne({fps_id:store_id})
    .then(store=>{
        if(store){
          const slots = store.slots;
          Order.find({store_id:store_id,completed:false})
         .then(orders=>{
        console.log(orders);
        res.render('upcomingStoretrans',{
            store_name:req.session.user.store_name,
            fps_id:req.session.user.fps_id,
            orders:orders,
            slots:slots
         });
    })
        }
        else{
            console.log("Store Not Found");
        }
    })
    
    .catch(err=>{
        console.log(err);
    })
}
exports.getstorePrevTrans = (req,res,next)=>{
    const store_id = req.session.user.fps_id;
    Order.find({store_id:store_id,completed:true})
    .then(orders=>{
        console.log(orders);
        res.render('storePrevTrans',{
            store_name:req.session.user.store_name,
            fps_id:req.session.user.fps_id,
            orders:orders
         });
    })
    .catch(err=>{
        console.log(err);
    })
}
exports.getconfrecipt = (req,res,next)=>{
    const order_id = req.params.order_id;
    Order.findOne({_id:order_id})
    .then(order=>{
        if(!order){
            console.log('No order found');
        }
        if(Number(order.aadhar)== Number(req.session.user.aadhar)||Number(order.store_id)==Number(req.session.user.fps_id)){
           console.log("authorized");
        }
        else{
            console.log("Not authorized");
        }
        Store.findOne({fps_id:order.store_id})
        .then(store=>{
            if(store){
                const store_address = store.store_address;
                const store_name = store.store_name;
                const pincode = store.pincode;
                const tehsil = store.tehsil;
        Admin.findOne({'aadhar.aadhar_Id':order.aadhar})
        .then(
            user=>{
                const user_name = user.aadhar.name;
                const ration_id = user.ration_details.user_Id;
                const user_mobile = user.aadhar.mobile;
       
        const confreciptName = 'invoice-'+order_id+'.pdf';
        const confreciptPath = path.join('user','invoice',confreciptName);
        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type','application/pdf');
        res.setHeader('Content-Disposition','inline; filename="'+confreciptName+'"');
        pdfDoc.pipe(fs.createWriteStream(confreciptPath));
        pdfDoc.pipe(res);
        pdfDoc.font('public/gilroy/Gilroy-Heavy.ttf').fontSize(30).fillColor('red').text('EasyRation.',{
            underline:false,
            align:'center',
        }).moveDown(0.5);
        pdfDoc.font('public/gilroy/Gilroy-Bold.ttf').fontSize(21).text('Confirmation Recipt',{
            underline:true,
            align:'center',
        });
        pdfDoc.text('--------------------------------------------',{
            align:'center'
        });
        pdfDoc.fontSize(15).text(`Store Id: ${order.store_id}`, 400, 130,{
            align:'right'
        })
        pdfDoc.fontSize(13).text(`confirmation Id: ${order._id}`, 50, 200,{
            align:'right'
        })
        pdfDoc.fontSize(13).text(`Aadhar: ${order.aadhar}`, 50, 200,{
            align:'left'
        })
        pdfDoc.fontSize(13).text(`Store name: ${store_name}`, 50, 230,{
            align:'right'
        })
        pdfDoc.fontSize(13).text(`Store address: ${store_address}`, 50, 260,{
            align:'right'
        })
        pdfDoc.fontSize(13).text(`Tehsil: ${tehsil}`, 50, 290,{
            align:'right'
        })
        pdfDoc.text(`Beneficiary Name: ${user_name}`, 50, 230,{
            align:'left'
        })
        pdfDoc.text(`Beneficiary Id: ${ration_id}`, 50, 260,{
            align:'left'
        })
        pdfDoc.text(`Mobile number: ${user_mobile}`, 50, 290,{
            align:'left'
        })
		// .text(`Invoice Date: ${order.date}`, 50, 230)
		pdfDoc.fontSize(15).text(`Slot: `+`${order.slot}`.slice(0,2)+`:`+`${order.slot}`.slice(2), 50, 130)
        pdfDoc.text(`commodity`, 105, 340,{
            // align:'left'
        })
        pdfDoc.text(`unit`, 250, 340,{
            // align:'center'
        })
        pdfDoc.text(`rate`, 350, 340,{
            // align:'center'
        })
        pdfDoc.text(`price`, 450, 340,{
            // align:'center'
        })
        for(var i = 1 ; i<=order.commodities.length;i++){
            pdfDoc.text(`${order.commodities[i-1].commodity}`,100, 360+i*50,{
                
            })
            pdfDoc.text(`${order.commodities[i-1].unit}`,260, 360+i*50,{
                lineBreak:true
            })
            pdfDoc.text(`${order.commodities[i-1].rate}`,360, 360+i*50,{
                lineBreak:true
            })
            pdfDoc.text(`${order.commodities[i-1].price}`, 460, 360+i*50,{
                lineBreak:true
            })
        }
        pdfDoc.text('------------------------------------------------------------------',50,580,{
           align:'center',
           width:500
        });
        pdfDoc.text(`Grand Total :${order.total}`,370,620,{
           width:500
        });
        pdfDoc.fontSize(14).text(`User should reach store in alloted slot otherwise this confirmation is get expired.`,100,655,{
            align:'left',
        });
        pdfDoc.fontSize(12).text(`Generated on:${order.date}`,100,695,{
           width:500
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
    }
)
.catch(err=>{
    console.log(err);
})
    }
    
    })
})
    .catch(err=>{
        console.log(err);
    })
}
exports.getrecipt = (req,res,next)=>{
    const order_id = req.params.order_id;
    Order.findOne({_id:order_id})
    .then(order=>{
        if(!order){
            console.log('No order found');
        }
        if(Number(order.aadhar)== Number(req.session.user.aadhar)||Number(order.store_id)==Number(req.session.user.fps_id)){
           console.log("authorized");
        }
        else{
            console.log("Not authorized");
        }
        Store.findOne({fps_id:order.store_id})
        .then(store=>{
            if(store){
                const store_address = store.store_address;
                const store_name = store.store_name;
                const pincode = store.pincode;
                const tehsil = store.tehsil;
        Admin.findOne({'aadhar.aadhar_Id':order.aadhar})
        .then(
            user=>{
                const user_name = user.aadhar.name;
                const ration_id = user.ration_details.user_Id;
                const user_mobile = user.aadhar.mobile;
       
        const confreciptName = 'invoice-'+order_id+'.pdf';
        const confreciptPath = path.join('user','invoice',confreciptName);
        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type','application/pdf');
        res.setHeader('Content-Disposition','inline; filename="'+confreciptName+'"');
        pdfDoc.pipe(fs.createWriteStream(confreciptPath));
        pdfDoc.pipe(res);
        pdfDoc.font('public/gilroy/Gilroy-Heavy.ttf').fontSize(30).fillColor('green').text('EasyRation.',{
            underline:false,
            align:'center',
        }).moveDown(0.5);
        pdfDoc.font('public/gilroy/Gilroy-Bold.ttf').fontSize(21).text('Invoice',{
            underline:true,
            align:'center',
        });
       
        pdfDoc.text('--------------------------------------------',{
            align:'center'
        });
        pdfDoc.fontSize(15).text(`Store Id: ${order.store_id}`, 400, 130,{
            align:'right'
        })
        
        pdfDoc.fontSize(13).text(`Invoice Id: ${order._id}`, 50, 200,{
            align:'right'
        })
        pdfDoc.fontSize(13).text(`Aadhar: ${order.aadhar}`, 50, 200,{
            align:'left'
        })
        pdfDoc.fontSize(13).text(`Store name: ${store_name}`, 50, 230,{
            align:'right'
        })
        pdfDoc.fontSize(13).text(`Store address: ${store_address}`, 50, 260,{
            align:'right'
        })
        pdfDoc.fontSize(13).text(`Tehsil: ${tehsil}`, 50, 290,{
            align:'right'
        })
        pdfDoc.text(`Beneficiary Name: ${user_name}`, 50, 230,{
            align:'left'
        })
        pdfDoc.text(`Beneficiary Id: ${ration_id}`, 50, 260,{
            align:'left'
        })
        pdfDoc.text(`Mobile number: ${user_mobile}`, 50, 290,{
            align:'left'
        })
		// .text(`Invoice Date: ${order.date}`, 50, 230)
        pdfDoc.fontSize(15).text(`Slot: `+`${order.slot}`.slice(0,2)+`:`+`${order.slot}`.slice(2), 50, 130)
        pdfDoc.text(`commodity`, 105, 340,{
            // align:'left'
        })
        pdfDoc.text(`unit`, 250, 340,{
            // align:'center'
        })
        pdfDoc.text(`rate`, 350, 340,{
            // align:'center'
        })
        pdfDoc.text(`price`, 450, 340,{
            // align:'center'
        })
        for(var i = 1 ; i<=order.commodities.length;i++){
            pdfDoc.text(`${order.commodities[i-1].commodity}`,100, 360+i*50,{
                
            })
            pdfDoc.text(`${order.commodities[i-1].unit}`,260, 360+i*50,{
                lineBreak:true
            })
            pdfDoc.text(`${order.commodities[i-1].rate}`,360, 360+i*50,{
                lineBreak:true
            })
            pdfDoc.text(`${order.commodities[i-1].price}`, 460, 360+i*50,{
                lineBreak:true
            })
        }
        pdfDoc.text('------------------------------------------------------------------',50,580,{
           align:'center',
           width:500
        });
        pdfDoc.text(`Grand Total :${order.total}`,370,620,{
           width:500
        });
        pdfDoc.text(`FPS Stamp and signature`,100,670,{
           width:500
        });
        pdfDoc.fontSize(12).text(`Generated on:${order.date}`,100,695,{
           width:500
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
    }
)
.catch(err=>{
    console.log(err);
})
    }
    
    })
})
    .catch(err=>{
        console.log(err);
    })
}
exports.getcompletetrans = (req,res,next)=>{
const order_id = req.params.order_id;
Order.findOne({_id:order_id})
.then(order=>{
    if(order){
        // console.log(order);
        const slot = Number(order.slot);
        const commodity = order.commodities;
        // console.log(commodity,slot);
        const aadhar = order.aadhar;
        const date = order.date;
        const total = Number(order.total);
        const store_id = order.store_id;
        const unit = order.unit;
        const price = order.price;
        const rate = order.rate;
        const commodities = [];
        for(let i = 0 ; i<commodity.length;i++){
            commodities[i]={
                commodity:commodity[i],
                unit:Number(unit[i]),
                price:Number(price[i]),
                rate:Number(rate[i])
            }
        }
        const updateQuery = {
            $inc: {
              "commodities.$[elem].stock": -Number(unit[0]) 
            }
          };
        const updateBookQuery = {
            $inc: {
              "slots.$[elem].booked": 1 
            }
          };
          var bookFilter =[];
          if(slot==900){
            bookFilter = [{
                "elem.slot":900
              }];
          }
          else if(slot==920){
             bookFilter = [{
                "elem.slot":920
              }];
          }
          else if(slot==940){
             bookFilter = [{
                "elem.slot":940
              }];
          }
          else if(slot==1000){
             bookFilter = [{
                "elem.slot":1000
              }];
          }
          else if(slot==1020){
             bookFilter = [{
                "elem.slot":1020
              }];
          }
          else if(slot==1040){
             bookFilter = [{
                "elem.slot":1040
              }];
          }
          else if(slot==1100){
             bookFilter = [{
                "elem.slot":1100
              }];
          }
          else if(slot==1120){
             bookFilter = [{
                "elem.slot":1120
              }];
          }
          else if(slot==1140){
             bookFilter = [{
                "elem.slot":1140
              }];
          }
          else if(slot==1200){
             bookFilter = [{
                "elem.slot":1200
              }];
          }
          else if(slot==1220){
             bookFilter = [{
                "elem.slot":1200
              }];
          }
          else if(slot==1240){
         bookFilter = [{
                "elem.slot":1200
              }];
          }
          else if(slot==1400){
             bookFilter = [{
                "elem.slot":1200
              }];
          }
          else if(slot==1420){
             bookFilter = [{
                "elem.slot":1200
              }];
          }
          else if(slot==1440){
             bookFilter = [{
                "elem.slot":1200
              }];
          }
          console.log(bookFilter);
          const riceFilter = [{
            "elem.item":"Rice"
          }];
          const wheatFilter = [{
            "elem.item":"Wheat"
          }];
          const sugarFilter = [{
            "elem.item":"Sugar"
          }];
          const oilFilter = [{
            "elem.item":"Kerosene"
          }];
          Store.updateOne({fps_id:store_id},updateQuery,{arrayFilters:riceFilter})
                   .then(
                    ack=>{
                        Store.updateOne({fps_id:store_id},updateQuery,{arrayFilters:wheatFilter})
                        .then(
                            ack2=>{
                                Store.updateOne({fps_id:store_id},updateQuery,{arrayFilters:sugarFilter})
                                .then(
                                    ack3=>{
                                        Store.updateOne({fps_id:store_id},updateQuery,{arrayFilters:oilFilter})
                                       .then(
                                        Store.updateOne({fps_id:store_id},updateBookQuery,{arrayFilters:bookFilter})
                                        .then(
                                            ack5=>{
                                                User.updateOne({aadhar:order.aadhar},{$set:{monthlyQuota:true}})
                                                .then(ack7=>{
                                                    console.log(ack7)
                                                })
                                                .catch(err=>{
                                                    console.log(err);
                                                })
                                            }
                                        )
                                       )
                                    }
                                )
                            }
                        )
                        .catch(err=>{
                            console.log(err);
                        })
                        Order.findByIdAndUpdate(order_id,{completed:true},{new:true})
                        .then(updatedDocument=>{
                            console.log("Done!!")
                            res.redirect('/app/upcomingStoretrans');
                         })  
                        .catch(err=>{
                            console.log(err);
                        })
                    }
                )
                .catch(err=>{
                    console.log(err);
                })
                
                
    }
})
.catch(err=>{
    console.log(err);
})
}
