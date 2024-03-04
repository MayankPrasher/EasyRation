exports.getAuth = (req ,res , next )=> {
    console.log("hi"); 
    res.render('auth');
};
exports.getmain = (req ,res , next )=> {
    console.log("hi"); 
    res.render('navbar');
};
exports.postAuthlogin = (req ,res , next )=> {
    
    if(req){
        console.log(req.body.email); 
        res.render('auth');
    }
    
};
exports.postAuthsignup = (req ,res , next )=> {
    
    if(req){
        console.log(req.body.aadhar); 
        res.render('auth');
    }
    
};
