const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const passport = require('passport');

const app = express();

// load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// passport config
require('./config/passport')(passport);

// connect to mongodb
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/nodejs-notejot', { useNewUrlParser: true }, () => {
  console.log('connected to mongodb');
});

// handlebars middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars')

// bodyParser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// static folder
app.use(express.static(path.join(__dirname, 'public')));

// method override middleware
app.use(methodOverride('_method'));

// express session middleware
app.use(session({
  secret: 'secret123',
  resave: true,
  saveUninitialized: true
}))

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// flash middleware
app.use(flash());

// global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', { title });
});

app.get('/about', (req, res) => {
  res.render('about');
});


// use routes
app.use('/ideas', ideas);
app.use('/users', users);

const port = 3000;
app.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});