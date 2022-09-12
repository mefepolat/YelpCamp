
const User = require('../models/user');


module.exports.registerUser = async (req,res, next) => {
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
    
};

module.exports.userDetails = async (req,res,next) => {
    console.log(res.locals.currentUserDetails)
    console.log(req.user._doc)
    if(!res.locals.currentUser || res.locals.currentUserDetails.username !== req.params.username){
        req.flash('error', 'You do not have permissions to do this.')
       return res.redirect('/campgrounds');
    }
    const {username} = req.params;
    const user = await User.findOne({username}).populate({path: 'campgrounds'})
    if(!user){
        req.flash('error', 'Cannot access that user.')
        return res.redirect('/campgrounds')
    }
    res.render('users/details.ejs', {user})
}

module.exports.login = (req,res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);

};

module.exports.logout = (req,res, next) => {

    req.logout(function(error) {
        if(error){
            return next(error);
        }
        req.flash('success', 'Successfully logged out!');
        res.redirect('/campgrounds');
    });   
    
};