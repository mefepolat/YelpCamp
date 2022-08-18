const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews')

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
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

