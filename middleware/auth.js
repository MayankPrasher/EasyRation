const jwt = require('jsonwebtoken')
const config = require('../config')
const User = require('../models/user')
const Store = require('../models/store')

exports.protect = async (req,res,next) =>{
    let token;

    if(req.cookies && req.cookies.token){
        token = req.cookies.token
    }

    if(!token){
        return res.redirect('/')
    }

    try{
        const decoded = jwt.verify(token,config.jwtSecret)
        let currentUser;

        if(decoded.role === 'user'){
            currentUser = await User.findById(decoded.id)
        }
        else if(decoded.role === 'store'){
            currentUser = await Store.findOne({fps_id : decoded.id})
        }
        if(!currentUser){
            res.clearCookie('token')
            return res.redirect('/')
        }
        req.user = currentUser
        req.user.role = decoded.role
        next()

    }catch(error){
      console.error("Auth Error:", error.message)
      res.clearCookie('token')
      res.redirect('/')
    }
}