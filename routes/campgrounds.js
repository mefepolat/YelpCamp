const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema} = require('../schemas.js');



const validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }
}

// router.get('/', (req,res) => {

//     res.render('home')
// })

router.get('/', catchAsync(async (req,res,next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

router.get('/new', (req,res) => {

    res.render('campgrounds/new')
})

router.post('/', validateCampground, catchAsync(async (req,res,next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsync(async (req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews')

    res.render('campgrounds/show.ejs', {campground})
}))


router.get('/:id/edit', catchAsync(async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground})
}))

router.put('/:id', validateCampground, catchAsync(async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', catchAsync(async(req,res,next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted the campground.')

    res.redirect('/campgrounds')
}))


module.exports = router;