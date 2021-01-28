const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/auth");
const User = require("../model/user");

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
            console.log(user)
          if (user) {
            return Promise.reject("Email exists");
          }
        });
      })
      .normalizeEmail(),
    body("name").trim().notEmpty(),
    body("password").trim().isLength({ min: 5 }),
  ],
  authController.postSignup
);

router.post("/login", authController.postLogin )

module.exports = router;
