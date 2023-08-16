var express = require('express');
var router = express.Router();
const Member = require('../models/member');
const Post = require('../models/post');
const asyncHandler = require('express-async-handler');



/* GET users listing. */
router.get('/', asyncHandler(async (req, res, next) => {
  if (req.user) {
    const members = await Member.find({membership: true});
    res.render("members-list", {members, user: req.user})
  }
  else {
    res.render("login")
  }
}));

router.get('/:id', asyncHandler(async (req, res, next) => {
  if (req.user === undefined) res.redirect("/posts");
  else {
    const posts = await Post.find({member: req.params.id})
    posts.sort((a, b) => b.timestamp - a.timestamp);
    res.render("member-details", {user: req.user, posts})
  }
}));

module.exports = router;
