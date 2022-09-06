if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const ejsMate = require('ejs-mate');
const path = require('path');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const reviewRoutes = require('./routes/reviews');
const flash = require('connect-flash');
const campgroundRoutes = require('./routes/campgrounds');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const userRoutes = require('./routes/users')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoStore = require('connect-mongo');

// const dbUrl = process.env.DB_URL;

const dbUrl2 = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

const secret = process.env.SECRET || 'thisshouldbeabettersecret'

// 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl2, 
{   useNewUrlParser: true, 
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('database connection');
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'))

const store = MongoStore.create({
    mongoUrl: dbUrl2,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});
store.on('error', function(err){
    console.log('Session store error', err)
})

const sessionConfig = {
    store: store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
// app.use(helmet());

app.use(mongoSanitize());
app.use(session(sessionConfig));
app.use(flash());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://events.mapbox.com",
    "https://*.tiles.mapbox.com"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
   
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dumxd1a8b/image/upload/", 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req,res) => {
    res.render('home')
})

app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong.'
    res.status(statusCode).render('error', {err})
    
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})