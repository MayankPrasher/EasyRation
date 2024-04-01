// const user = require('../models/user');
const User = require('../models/user');
const Store = require('../models/store');
const Admin = require('../models/central');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const {validationResult} = require('express-validator');
var mongoose = require('mongoose');
const user = require('../models/user');
const central = require('../models/central');
mongoose.set('debug', true);
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'rosario.torphy@ethereal.email',
        pass: '6qhnCSKuejbqGUX2Rc'
    }
});

exports.getmain = (req ,res , next )=> {
    console.log(req);
    const aadhar = req.session.user.aadhar;
    // console.log(aadhar);
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
          Store.findOne({fps_id:store_id})
          .then(store=>{
            if(store){
                const store_name = store.store_name;
                const store_fso = store.FSO_area;

                return res.render('rationcard',{
                    ration_card_id : ration_card_id,
                    aadhar_name :aadhar_name,
                    aadhar_address :aadhar_address,
                    store_id:store_id,
                    card_type:card_type,
                    members:members,
                    members_qty:members_qty,
                    store_name:store_name,
                    store_fso:store_fso,
                    isAuth:req.session.isLoggedIn
                });
            }
            else{
                console.log("store not found");
            }
          })
          .catch(err=>{
            console.log(err);
          })
        //   console.log(store_id);
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
     const enteredpin = req.body.enteredpin;
     const errors = validationResult(req);
     if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('booking',{
            errorMessage:errors.array()[0].msg,
            oldInput:{enteredpin:enteredpin},
            validationErrors:errors.array(),
        });
}
Store.find({pincode:enteredpin})
.then(stores=>{
    if(stores.length<=0){
        return res.status(422).render('booking',{
            errorMessage:"Invalid Pincode",
            oldInput:{enteredpin:enteredpin},
            validationErrors:errors.array(),
        });
    }
    else{
        res.render('chooseStore',{
            stores:stores,
            isAuth:req.session.isLoggedIn
        });
    }
    
})
.catch(err=>{
    console.log(err);
});
    // if(req){
    //     res.render('chooseStore');
    // }
};

exports.getBooking = (req , res, next) =>{
    if(req){
        res.render('booking',{
            oldInput:"",
            errorMessage:""
        });
    }
};
exports.getStoreDash = (req , res, next) =>{
    const store_name = req.session.user.store_name;
    const fps_id = req.session.user.fps_id;
    const distributor = req.session.user.distributor;
    const address = req.session.user.store_address;
    const tehsil = req.session.user.tehsil;
    const telephone = req.session.user.telephone;
    res.render('storeinfo',{
        user:null,
        store_name:store_name,
        fps_id:fps_id,
        distributor:distributor,
        address:address,
        tehsil:tehsil,
        telephone:telephone
    })
    // console.log(user);
       

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
    const member_quantity = parseInt(req.body.member_quantity); 
    const user_id = Number(req.body.user_id);
    const members = req.body.member;
    const member_names = req.body.member_name;

console.log(user_id);
var insert_members = [];

for (var i = 0; i < member_quantity; i++) {
    insert_members[i] = { member: members[i], member_name: member_names[i] };
}

    
Admin.findOneAndUpdate(
    { 'ration_details.user_Id': user_id }, // Filter criteria to find the document
    { $set: { 'ration_details.members': insert_members } }, // Update operation
    { new: true } // To return the updated document
)
    .then(updatedCentral => {
        // console.log("Updated Central document:", updatedCentral);
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
    if(req){
        res.render('slots');
    }
};

exports.getConfirmation = (req,res,next)=>{
    if(req){
        res.render('confirmation');
    }
}
exports.getfindtheStore = (req,res,next)=>{
    if(req){
        res.render('findtheStore');
    }
}

exports.getStoreinfo = (req,res,next)=>{

    if(req){
        res.render('storeinfo');
    }
}

