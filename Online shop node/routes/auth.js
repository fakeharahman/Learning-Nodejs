const express = require("express");
const authController = require("../controllers/auth");
const { check, body } = require("express-validator/check");
const User = require("../models/users");

const router = express.Router();

router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    body("email", "Not a valid email").isEmail().normalizeEmail(),
    body("password", "Wrong password")
      .isAlphanumeric()
      .isLength({ min: 5 })
      .trim(),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter valid email")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email exists"); //async validation
          }
          //doesnt go in if block, automativally promise is returned true
        });
        // return true;
      }),
    body("password", "Password should be atlease 5 char and only alphanumeric")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password)
          throw new Error("Passwords dont match");
        return true;
      })
      .trim(),
  ],
  authController.postSignup
);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
