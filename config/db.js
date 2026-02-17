const mongoose = require("mongoose")
const config = require("./index")

const connectDB = async ()=>{

    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connection: ${conn.connection.host}`)
    }catch(err){
        console.error(`Database Connection Error: ${err.message}`)
        process.exit(1)
    }
}
module.exports = connectDB