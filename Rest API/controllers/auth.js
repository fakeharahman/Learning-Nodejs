const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const User = require("../model/user");

exports.postSignup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  bcrypt
    .hash(password, 12)
    .then((hashedPass) => {
      const user = new User({
          email: email,
          password: hashedPass,
          name: name
      });
      return user.save()
    }) 
    .then((result)=>{
        res.status(201).json({message: "User created!", userId: result._id})
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
