const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const storeSchema = new Schema({
    fps_id:{
        type:Number,
        required:true
    },
    distributor:{
        type:String,
        required:true
    },
    store_name:{
        type:String,
        required:true
    },
    store_address:{
        type:String,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    tehsil:{
        type:String,
        required:true
    },
    slots:[    {
        slot:{
            type:String,
            required:true
             }
    }
        
    ],
    telephone:{
        type:Number,
        required:true
    },
    FSO_area:{
        type:Number,
        required:true
    },
    store_email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    }

});
module.exports = mongoose.model('Store',storeSchema);