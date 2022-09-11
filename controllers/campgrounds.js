
const Campground = require('../models/campground')
const {cloudinary} = require('../cloudinary/index.js')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken: mapBoxToken})


module.exports.index = async (req,res,next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
};

module.exports.searchCampground = async (req,res,next) => {
    
    const {q} = req.query;
    let regex = new RegExp(q, 'i');
    const campgrounds = await Campground.find({$and: [ { $or: [{title:regex}, {location: regex}]}]}).exec();
    if(campgrounds.length){

    req.flash('success', `Success! ${campgrounds.length} campground(s) found.`)
    return res.render('campgrounds/search.ejs', {campgrounds});
    }  else {
        req.flash('success', `No results found.`)
        res.redirect('/campgrounds')
    }
    }
    

module.exports.newCampground = async (req,res,next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    if(!geoData.body.features[0]){
        req.flash('error', 'Please enter a valid location.');
        res.redirect('/campgrounds/new');
    }
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, fileName: f.filename}));
    campground.author = req.user._id;
   
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.showCampground = async (req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if(!campground){
        req.flash('error', 'Cannot find that campground.')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show.ejs', {campground})
};

module.exports.editCampground = async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find that campground.')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
};

module.exports.updateCampground = async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, fileName: f.filename}))
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    if(!geoData.body.features[0]){
        req.flash('error', 'Please enter a valid location.');
        res.redirect(`/campgrounds/${id}/edit`);
    }
    campground.geometry = geoData.body.features[0].geometry;
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
           await cloudinary.uploader.destroy(filename);
        }
       await campground.updateOne({$pull: {images: {fileName: {$in: req.body.deleteImages}}}});
       console.log(campground)
    }
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteCampground = async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${campground._id}`);
    }

    for(let image of campground.images){
        await cloudinary.uploader.destroy(image.fileName)
    }
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted the campground.')

    res.redirect('/campgrounds')
}