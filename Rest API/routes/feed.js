const express = require("express");
const { check } = require("express-validator");

const feedController = require("../controllers/feed");

const router = express.Router();

router.get("/posts", [check("title").isLength({min: 5}), check("content").isLength({min: 5})] ,feedController.getFeed);
router.post("/post", feedController.postPost);

module.exports = router;
