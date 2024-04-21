// const user = require('../models/user');
const User = require('../models/user');
const Store = require('../models/store');
const Admin = require('../models/central');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const {validationResult, header} = require('express-validator');
const { connect } = require('mongoose');
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'rosario.torphy@ethereal.email',
        pass: '6qhnCSKuejbqGUX2Rc'
    }
});
exports.getAuth = (req ,res , next )=> {
    // console.log("hi"); 
    // let message = req.flash('error');
    //  if(message.length>0){
    //      message = message[0];
    //  }else{
    //      message = null;
    //  }
    res.clearCookie('connect.sid').render('auth',{
        errorMessage:'',
        oldInput :{email:'',password:'',confirmPassword:''},
        validationErrors:[],
    });
};

exports.postAuthlogin = (req ,res , next )=> {
    const loginemail = req.body.loginemail;
    const loginpassword = req.body.loginpassword;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('auth',{
            errorMessage:errors.array()[0].msg,
            oldInput:{loginemail:loginemail,loginpassword:loginpassword},
            validationErrors:errors.array(),
            tab:'tab1'
        });
}
    User.findOne({email:loginemail})
    .then(flag=>{
        if(!flag){
        // req.flash('error','Invalid email or password.');
        console.log("Invalid Email");
        res.redirect('/');
        }
        bcrypt.compare(loginpassword,flag.password)
        .then(match=>{
            if(match){
            req.session.isLoggedIn = true;
            req.session.user = flag;
             console.log("User is authentic");
             res.redirect('/app/main');
            }
            else{
                console.log("password is incorrect.");
            }
        })
        .catch((err)=>{
            console.log(err);
        })
    })
   .catch((err)=>{
    console.log(err);
   })
   
    // if(req){
    //     console.log(req.body.loginemail); 
    //     console.log(req.body.loginpassword); 
    //     res.render('auth',{
    //         errorMessage:"",
    //         oldInput :{email:'',password:'',confirmPassword:''},
    //         validationErrors:[],
    //     });
    // }
    
};
exports.postAuthsignup = (req ,res , next )=> {
    const aadhar = req.body.aadhar;
    const name = req.body.username;
    const email = req.body.email;
    const usertype = "user";
    const password = name + '@' +aadhar;
const errors = validationResult(req);
if(!errors.isEmpty()){
    console.log(errors.array());
    return res.status(422).render('auth',{
        errorMessage:errors.array()[0].msg,
        oldInput:{aadhar:aadhar,name:name,email:email},
        validationErrors:errors.array(),
        tab:'tab2'
    });
}
User.findOne({aadhar:aadhar})
.then(user=>{
    if(user){
        return res.render('auth',{
            errorMessage:"User already Exists !!",
            oldInput:{aadhar:aadhar,name:name,email:email},
            validationErrors:""
        });
    }
    else{
        bcrypt
.hash(password,12)
.then(hashedPassword=>{
    const user = new User({
        aadhar : aadhar,
        name : name,
        email:email,
        usertype : usertype,
        password:hashedPassword
    });
    Admin.findOne({'aadhar.aadhar_Id':req.body.aadhar})
    .then(id=>{
        if(id){
            user.save();
            res.redirect('/');
            console.log('User Created');
            return transporter.sendMail({
                to :email,
                from:"prasher6789@gmail.com",
                subject:"Signup succeeded!",
                html:'<h1>You successfully signed up!</h1><br><h2>Here is your password:'+password})
        }
        else{
            console.log('User not Created');
            res.redirect('/');
            return transporter.sendMail({
               to :email,
               from:"prasher6789@gmail.com",
               subject:"Signup Failed",
               html:'<h1>either your aadhar number is incorrect or your aadhar is not linked with your Ration card</h1><br>'})
        }

        }
    )
})
    .catch((err)=>{
        console.log(err);
    })

    }
})
.catch(err=>{
    console.log(err);
})
};


exports.getStorelogin = (req,res,next)=>{
    if(req){
        res.render('store-login',{
            errorMessage:"",
            oldInput :{email:'',password:'',confirmPassword:''},
            validationErrors:[],
        });
    }
}
exports.postStorelogin = (req,res,next)=>{
    const store_email = req.body.store_email;
    const entered_fps_id = req.body.entered_fps_id;
        const errors = validationResult(req);
       if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('store-login',{
            errorMessage:errors.array()[0].msg,
            oldInput :{store_email:store_email,entred_fps_id:entered_fps_id},
            validationErrors:errors.array()
        });
        }
        else{
            Store.findOne({store_email:store_email,fps_id:entered_fps_id})
            .then(
                store=>{
                    if(store){
                     const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false , });
                     Store.updateOne({fps_id:entered_fps_id},{$set:{otp:otp}})
                     .then(flag=>{
                        if(flag){
                            res.redirect('/otp/'+entered_fps_id);
                            // res.render('store-login',{
                            //     errorMessage:"",
                            //     oldInput :{store_email:'',entred_fps_id:''},
                            //     validationErrors:[]
                            // });
                            return transporter.sendMail({
                                to :store_email,
                                from:"prasher6789@gmail.com",
                                subject:"OTP for Sign In EasyRation FPS",
                                html:'<h1>Your One time password is :'+otp+'</h1>'});
                        }
                     })
                     .catch(err=>{
                        console.log(err);
                     })
                    }
                    else{
                      console.log("not found");
                    }
                }
            )
            .catch(err=>{
                console.log(err);
            })
           
        }
};
exports.getOtp = (req,res,next)=>{

        res.render('otp',{
            fps_id:req.params.id,
            errorMessage:"",
            oldInput :{entered_otp:""},
            validationErrors:[],
        });
    
   
};
exports.postOtp = (req,res,next)=>{
    const fps_id = req.params.id;
    const entered_otp = req.body.entered_otp;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('otp',{
            errorMessage:errors.array()[0].msg,
            oldInput:{entered_otp:entered_otp},
            validationErrors:errors.array(),
            fps_id:fps_id
        });
}
else{
    Store.findOne({otp:entered_otp})
.then(
    store=>{
        if(store){
            req.session.isLoggedIn = true;
            req.session.user = store;
          res.redirect('/app/store-dash');
        }
        else{
            return res.status(422).render('otp',{
            errorMessage:"Wrong OTP",
            oldInput:{entered_otp:entered_otp},
            fps_id:fps_id
        });
        }
    }
)
.catch(
    err=>{
        console.log(err);
    }
);
}

    
};
exports.postLogout = (req,res,next)=>{
    req.session.destroy(err => {
        if (err) {
          console.log(err);
        } else {
            res.clearCookie('connect.sid', { path: '/' });
          res.redirect('/')
        }
      })
  }