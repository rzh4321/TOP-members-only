var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Member = require('../models/member');
const bcrypt = require("bcryptjs");
const passport = require("passport");



const { body, validationResult } = require("express-validator");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/posts');
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.post('/signup', [
  body("firstName")
    .trim()
    .isLength({min: 2})
    .withMessage("First name must be at least 2 characters")
    .escape(),
  body("lastName")
    .trim()
    .isLength({min: 2})
    .withMessage("Last name must be at least 2 characters")
    .escape(),
  body("username")
    .trim()
    .isLength({min: 4})
    .withMessage("Username must be at least 4 characters")
    .custom(async (value, {req}) => {
      const regex = new RegExp(req.body.username, "i");
      const exists = await Member.findOne({username: { $regex: regex}})
      if (exists) {
        throw new Error("Username already taken");
      }
      return true;
    })
    .escape(),
  body("password")
    .trim()
    .isLength({min: 6})
    .withMessage("Password must be at least 6 characters")
    .escape(),
  body('confirmPassword')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const member = new Member({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: hashedPassword, // Store the hashed password
      admin: req.body.isAdmin === undefined ? false: true,
    });
    if (!errors.isEmpty()) {
      res.render('signup', {errors: errors.array(), member, 
        pw: req.body.password, confirm: req.body.confirmPassword});
    }
    else {
      await member.save();
      res.redirect("/posts");
    }
  })
]);

router.get('/login', function(req, res, next) {
  res.render("login");
});

router.get('/login-error', function(req, res, next) {
  res.render("login", {failure: req.session.messages[req.session.messages.length-1]});
});

router.post(
  "/login",
    passport.authenticate("local", {
      failureMessage: true,
      successRedirect: "/posts",
      failureRedirect: "/login-error"
  }
));

router.get('/logout', function(req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/posts');
  })
})

router.get('/membership', async function(req, res, next) {
  const member = await Member.findById(req.user.id);
  if (member.membership) {
    res.render("membership", {member: true, user: req.user})
  }
  else {
    res.render("membership", {user: req.user})
  }
})

router.post('/membership', [
  body("key")
    .trim()
    .escape(),

  async function(req, res, next) {
    if (req.body.key === 'knicks99') {
      console.log(req.user)
      const member = await Member.findById(req.user.id);
      member.membership = true;
      await member.save();
      res.render('membership', {member: true, user: req.user});
    }
    else {
      res.render('membership', {key: req.body.key, user: req.user})
    }
  
  }
  ]
)

module.exports = router;
