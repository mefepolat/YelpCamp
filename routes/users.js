const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const { registerUser,login,logout,userDetails  } = require('../controllers/users');

router.route('/register')
.get((req,res) => {
    res.render('users/register')})
.post(catchAsync(registerUser));

 
router.route('/login')
.get((req,res) =>{

    res.render('users/login');
})
.post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), login)





router.get('/logout', logout);

router.route('/users/:username')
    .get((catchAsync(userDetails)))

module.exports = router;