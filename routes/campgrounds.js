const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const  {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const {index, newCampground, showCampground, editCampground, updateCampground, deleteCampground, home, searchCampground} = require('../controllers/campgrounds');
const multer = require('multer');
const {storage, cloudinary} = require('../cloudinary/index');
const upload = multer({storage});

// CAMPGROUND ROUTES

router.get('/new', isLoggedIn, (req,res) => {
    res.render('campgrounds/new')
})

router.route('/search/')
    .get(catchAsync(searchCampground))
    

router.route('/')
    .get(catchAsync(index))
    .post(isLoggedIn,  upload.array('image'), validateCampground, catchAsync(newCampground));

router.route('/:id')
    .get( catchAsync(showCampground))
    .put( isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(updateCampground))
    .delete( isLoggedIn, isAuthor, catchAsync(deleteCampground))




router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(editCampground));




module.exports = router;