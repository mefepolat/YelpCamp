const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews')

const opts = { toJSON: {virtuals: true}};

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
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required:true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this.id}"> ${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`;
})


CampgroundSchema.post('findOneAndDelete', async function (campground) {
    if(campground.reviews.length){

        const res = await Review.deleteMany({ _id: {$in: campground.reviews}})
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)

