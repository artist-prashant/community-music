var express = require('express');
var flash=require('connect-flash');
var passport=require('passport');

var User=require('../models/user');

var router = express.Router();

router.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.errors=req.flash('error');
    res.locals.infos=req.flash('info');
    next();
});

router.get('/', function (req, res) {
    res.render('index');
});

router.get('/signup',function(req,res){
    res.render('sign-up');
});

router.post('/signup',function(req,res,next){
    
    var username=req.body.username;
    var password=req.body.password;
    var email=req.body.email;
    
    User.findOne({username:username},function(err,user){
        if(err){return next(err);}
        if(user){
            req.flash('error','User already exists !');
            return res.redirect('/signup');
        }
        var newUser=new User({
            username:username,
            password:password,
            email:email
        });
        newUser.save(next);
    });
},passport.authenticate('login',{
    successRedirect:'/',
    failureRedirect:'/signup',
    failureFlash:true
}));

router.get('/login',function(req,res){
    res.render('login');
});

router.post('/login',passport.authenticate('login',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
}));

router.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
});

module.exports = router;
