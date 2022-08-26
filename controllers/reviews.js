const Review = require('../models/reviews')
const Campground = require('../models/campground');


module.exports.postReview = async (req,res,next) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
   await review.save();
   await campground.save();
   req.flash('success', 'Successfully created a new review!')
   res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteReview = async (req,res,next) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted the review.')
    res.redirect(`/campgrounds/${id}`)
};