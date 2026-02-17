const dotenv = require("dotenv")

const envFound = dotenv.config()

if(envFound.error){
    throw new Error("Couldn't find the .env file")
}

if(!process.env.MONGODB_URI){
    throw new Error("FATAL ERROR: MONGODB_URI is not defined.")
}

if(!process.env.JWT_SECRET){
    throw new Error("FATAL ERROR: JWT_SECRET is not defined.")
}

module.exports ={
    port: parseInt(process.env.PORT,10) || 3000,
    databaseURL : process.env.MONGODB_URI,
    jwtSecret : process.env.JWT_SECRET,
    jwtExpiresIn:process.env.JWT_EXPIRES_IN || '1d'
}