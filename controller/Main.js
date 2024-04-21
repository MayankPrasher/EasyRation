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

console.log(member_names);
var insert_members = [];

for (var i = 0; i < member_quantity; i++) {
    insert_members[i] = { member:members[i] , member_name:member_names[i]};
}
insert_members.forEach(element => {
    console.log(element);
});

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
    .catch(
        err=>{
            console.log(err);
        }
    )
    Store.findOne({fps_id:store_id})
    .then(store=>{
        if(store){
          const slots = store.slots;
          return res.render('slots',{
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
    .catch(err=>{
        console.log(err);
    })
    
    
};
exports. updateSlot = async() =>{
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
    if(req){
        res.render('findtheStore');
    }
}

exports.getStoreinfo = (req,res,next)=>{

    if(req){
        res.render('storeinfo');
    }
}

