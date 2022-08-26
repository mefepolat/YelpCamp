const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const { registerUser,login,logout } = require('../controllers/users');

router.route('/register')
.get((req,res) => {
    res.render('users/register')})
.post(catchAsync(registerUser));

 
router.route('/login')
.get((req,res) =>{

    res.render('users/login');
})
.post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), login)


router.get('/logout', logout);

module.exports = router;