const moongoose = require('mongoose');
const store = require('./store');

const Schema = moongoose.Schema;

const orderSchema = new Schema({
aadhar :{
    type:Number,
    required:true
},
store_id:{
    type:Number,
    required:true
},
completed:{
    type:Boolean,
    required:true
},
slot:{
    type:Number,
    required:true
},
date:{
    type:Date,
    required:true
},
commodities:[
    {
        commodity:{
            type:String,
            required:true
        },
        unit:{
            type:Number,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        rate:{
            type:Number,
            required:true
        }

    }
],
total:{
type:Number,
required:true
}
});
module.exports = moongoose.model('order',orderSchema);
