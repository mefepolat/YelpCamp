const express = require('express')
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const {validateReview, isLoggedIn, isReviewauthor} = require('../middleware')
const {postReview, deleteReview} = require('../controllers/reviews')


router.post('/', isLoggedIn, validateReview, catchAsync(postReview))

router.delete('/:reviewId', isLoggedIn, isReviewauthor, catchAsync(deleteReview)) 

module.exports = router;