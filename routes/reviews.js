const express = require('express')
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviews');
const {validateReview, isLoggedIn, isReviewauthor} = require('../middleware')


router.post('/', isLoggedIn, validateReview, catchAsync(async (req,res,next) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
   await review.save();
   await campground.save();
   req.flash('success', 'Successfully created a new review!')
   res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', isLoggedIn, isReviewauthor, catchAsync(async (req,res,next) => {
    const {id, reviewId} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted the review.')
    res.redirect(`/campgrounds/${campground._id}`)
})) 

module.exports = router;