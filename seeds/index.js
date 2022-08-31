const mongoose = require('mongoose');
const cities = require('./cities')
const Campground = require('../models/campground')
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', 
{   useNewUrlParser: true, 
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('database connection');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDb = async() => {
    await Campground.deleteMany({});
    for (let i =0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
       const camp = new Campground({
            author: '630315619fd0835407c65954',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: { type: 'Point', coordinates: [ -79.383935, 43.653482 ] },
            images:[{
                url: 'https://res.cloudinary.com/dumxd1a8b/image/upload/v1661717616/YelpCamp/nvciwevz34rzxogovubr.jpg',
                fileName: 'YelpCamp/nvciwevz34rzxogovubr'
              },
              {
                url: 'https://res.cloudinary.com/dumxd1a8b/image/upload/v1661717616/YelpCamp/v9rxn9fxdyn7hg1nhisp.jpg',
                fileName: 'YelpCamp/v9rxn9fxdyn7hg1nhisp'
              }],
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus dolorem laboriosam reiciendis vitae iure labore nostrum exercitationem assumenda tempore possimus, veniam neque voluptatum, corrupti ad corporis molestias temporibus nesciunt? Sapiente?",
            price: price
        })
        await camp.save();
    }
}

seedDb()
.then(() => {
    mongoose.connection.close();
})
