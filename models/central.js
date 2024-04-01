const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminSchema = new Schema({
    aadhar:{
        aadhar_Id:{
            type:Number,
            required:true
        },
        name:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        mobile:{
            type:Number,
            required:true
        }
    },
    ration_details:{
        user_Id:{
            type:Number,
            required:true
        },
        members:[
            {
            member:{
                 type:Number
                },
            member_name:{
                type:String
            },
            }
        ],
        member_quantity:{
          type:Number,
          required:true
        },
        card_type:{
            type:String,
            required:true
        }
    },
    store:{
        fps_id:{
            type:Number,
            required:true
        }
    }
},
{collection:'centrals'})
module.exports = mongoose.model('central',adminSchema);