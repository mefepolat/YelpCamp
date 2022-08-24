const Campground = require("./models/campground");
const {campgroundSchema, reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/reviews')

module.exports.validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }
}

module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }
}

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        // store the url they are requesting
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!')
       return res.redirect('/login')
    }
    next();
}

module.exports.isAuthor = async (req,res,next) => {

    const {id} = req.params;
    const campground = await Campground.findById(id);   

    if(!campground.author.equals(req.user.id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${campground._id}`);
    }

    next();
}

module.exports.isReviewauthor = async (req,res,next) =>{

    const {id,reviewId} = req.params;

    const review = await Review.findById(reviewId);

    if(!review.author.equals(req.user.id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}