const bcrypt = require("bcryptjs");
const User = require("../models/users");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid");
const crypto = require("crypto");
const { validationResult } = require("express-validator/check");

const transporter = nodemailer.createTransport(
  sendgrid({
    apiKey:
      "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",
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuth: false,
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const errors = validationResult(req);
  const email = req.body.email;
  const password = req.body.password;
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      isAuth: false,
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // req.flash("error", "Invalid email or password");
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          isAuth: false,
          errorMessage: "Invalid email or password",
          oldInput: { email: email, password: password },
          validationErrors: [{ param: "email" }, { param: "password" }],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isAuth = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            isAuth: false,
            errorMessage: "Invalid email or password",
            oldInput: { email: email, password: password },
            validationErrors: [{ param: "email" }, { param: "password" }],
          });
        })
        .catch((err) => {
          console.log(err);
          req.flash("error", "There was some error");
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors.array());
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      isAuth: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPass) => {
      const user = new User({
        email: email,
        password: hashedPass,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(() => {
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "fakeha126@gmail.com",
        subject: "yo",
        html:
          "<h4> Hey Fakeha, </h4> <p> Thanks for being in my life. You are the best sister ever. Mama precious little boy, Tanzii </p>",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "This email doesn't exist");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "fakeha126@gmail.com",
          subject: "Reset Password",
          html: `<p> You requested a password reset</p>
          <p>Click on this <a href='http://localhost:6969/reset/${token}'>link </a> to reset the password to your account</p>`,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.setStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  // console.log(req.params);
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passToken = req.body.passwordToken;
  let user = null;
  User.findOne({
    _id: userId,
    resetToken: passToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((dbuser) => {
      user = dbuser;
      return bcrypt.hash(newPassword, 12);
    })
    .then((pass) => {
      user.password = pass;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      return user.save();
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};
