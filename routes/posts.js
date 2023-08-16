var express = require('express');
var router = express.Router();
const Post = require('../models/post');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");





/* GET users listing. */
router.get('/', asyncHandler(async(req, res, next) => {
    const allPosts = await Post.find().populate("member");
    res.render("posts", {allPosts: allPosts, user: req.user});
}));

router.get('/create', asyncHandler(async(req, res, next) => {
    if (req.user === undefined) {
        res.redirect("/login")
    }
    else {
        res.render("create-post");
    }
}));

router.post('/create', [
    body("title", "Title cannot be empty")
      .trim()
      .notEmpty()
      .escape(),

    body("desc", "Description cannot be empty")
      .trim()
      .notEmpty()
      .escape(),
  
    async function(req, res, next) {
        const errors = validationResult(req);
        const post = new Post({title: req.body.title, description: req.body.desc,
            timestamp: new Date(), member: req.user})
        if (!errors.isEmpty()) {
            res.render("/posts/create", {errors: errors.array(),
                title: req.body.title, desc: req.body.desc})
        }
        else {
            await post.save();
            res.redirect("/posts");
        }
    
    }
    ]
  )

module.exports = router;
