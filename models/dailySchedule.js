const mongoose = require('mongoose')
const { schedule } = require('node-cron')
const Schema = mongoose.Schema

const scheduleSchema = new Schema({
    fps_id:{
        type:Number,
        required: true,
        ref: 'Store'
    },
    date:{
        type:String,
        required:true
    },
    slots:[{
        time:{type:Number, required: true},
        booked:{type:Number, default:0},
        capacity:{type:Number, default:10},
        isOpen:{type: Boolean, default:true}
    }]
})

scheduleSchema.index({fps_id:1, date:1},{unique:true})

module.exports = mongoose.model('DailySchedule',scheduleSchema)