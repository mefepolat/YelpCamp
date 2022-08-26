const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const  {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const {index, newCampground, showCampground, editCampground, updateCampground, deleteCampground} = require('../controllers/campgrounds')

// CAMPGROUND ROUTES

router.get('/new', isLoggedIn, (req,res) => {
    res.render('campgrounds/new')
})

router.route('/')
    .get(catchAsync(index))
    .post(isLoggedIn, validateCampground, catchAsync(newCampground));

router.route('/:id')
    .get( catchAsync(showCampground))
    .put( isLoggedIn, isAuthor, validateCampground, catchAsync(updateCampground))
    .delete( isLoggedIn, isAuthor, catchAsync(deleteCampground))




router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(editCampground));




module.exports = router;