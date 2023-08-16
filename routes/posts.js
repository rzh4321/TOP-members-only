var express = require('express');
var router = express.Router();
const Post = require('../models/post');
const asyncHandler = require('express-async-handler');


/* GET users listing. */
router.get('/', asyncHandler(async(req, res, next) => {
    const allPosts = await Post.find().populate("member");
    res.render("posts", {allPosts: allPosts, user: req.user});
}));

module.exports = router;
