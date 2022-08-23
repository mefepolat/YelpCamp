const User = require('../models/user');
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')

router.get('/register', (req,res) => {

    res.render('users/register')
});

router.post('/register', catchAsync(async (req,res, next) => {
    try{
    const {username,email,password} = req.body;
    const user = new User({username, email});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser, function(err) {
        if(err){
            return next(err);
        }
        req.flash('success','Welcome to Yelp Camp!');
    res.redirect('/campgrounds')
    })
    
    } catch(e) {
        req.flash('error', e.message)
         res.redirect('register')
    }
    
}));

router.get('/login', (req,res) =>{

    res.render('users/login');
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req,res) => {
    req.flash('success', 'Welcome Back!');
    console.log(req.session.returnTo)
    const redirectUrl = req.session.returnTo || '/campgrounds';

    res.redirect(redirectUrl);

})

router.get('/logout', (req,res, next) => {

    req.logout(function(error) {
        if(error){
            return next(error);
        }
        req.flash('success', 'Successfully logged out!');
        res.redirect('/campgrounds');
    });   
    
})

module.exports = router;