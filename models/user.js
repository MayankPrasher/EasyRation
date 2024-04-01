const moongoose = require('mongoose');

const Schema = moongoose.Schema;

const userSchema = new Schema({

    aadhar:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    usertype:{
        type:String,
    },
    password:{
        type:String
    }
});

module.exports = moongoose.model('User',userSchema);