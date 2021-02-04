const express = require("express");
const { body } = require("express-validator");

const feedController = require("../controllers/feed");
const isAuth=require("../middleware/is-auth")

const router = express.Router();

router.get("/posts", isAuth ,feedController.getFeed);
router.post(
  "/post", isAuth, 
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.postPost
);
router.get("/post/:id", isAuth, feedController.getPost);
router.put(
  "/post/:id", isAuth ,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.putPost
);

router.delete("/post/:id", isAuth , feedController.deletePost);

router.get('/status', isAuth, feedController.getStatus)
router.put('/status', isAuth, feedController.putStatus)

module.exports = router;
