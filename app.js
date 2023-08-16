var createError = require('http-errors');
var express = require('express');
var path = require('path');
const mongoose = require("mongoose");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
require('dotenv').config(); // Load environment variables from .env file

const Member = require("./models/member");

const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const membersRouter = require('./routes/members');


const app = express();
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URL;
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
passport.use(
  new LocalStrategy(async(username, password, done) => {
    try {
      const regex = new RegExp(username, "i");
      const member = await Member.findOne({ username: {$regex: regex} });
      if (!member) {
        return done(null, false, { message: "Username does not exist" });
      };
      const match = await bcrypt.compare(password, member.password);
      if (!match) {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" })
      }
      return done(null, member);
    } catch(err) {
      return done(err);
    };
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await Member.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});

app.use(passport.initialize());
app.use(passport.session());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/members', membersRouter);
app.use('/posts', postsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
