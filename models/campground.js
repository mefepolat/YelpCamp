const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews')

const ImageSchema = new Schema({

    url:String,
    fileName: String

})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload','/upload/w_200');
})
const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [ImageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

CampgroundSchema.post('findOneAndDelete', async function (campground) {
    if(campground.reviews.length){

        const res = await Review.deleteMany({ _id: {$in: campground.reviews}})
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)

