var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Member = require('../models/member');
const bcrypt = require("bcryptjs");


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

module.exports = router;
