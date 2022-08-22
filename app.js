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

mongoose.connect('mongodb://localhost:27017/yelp-camp', 
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

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next) => {
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)



app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong.'
    res.status(statusCode).render('error', {err})
    
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})