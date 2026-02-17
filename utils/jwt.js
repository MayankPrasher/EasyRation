const jwt = require('jsonwebtoken')
const config = require('../config')

const generateToken = (userId,role) =>{
    const payload = {
        id : userId,
        role : role
    }

    return jwt.sign(payload,config.jwtSecret,{
        expiresIn: config.jwtExpiresIn
    })
}

module.exports = generateToken
