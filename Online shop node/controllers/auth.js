const User= require('../models/users')

exports.getLogin = (req, res, next) => {
  // const isAuth=(req.get('Cookie').split(';')[1].split('=')[1])
  console.log(req.session.auth);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuth: req.session.isAuth

  });
};

exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie', 'auth=true; Max-Age=10')
  User.findById("5fb39c4c69228933d8cbbb72")
  .then((user) => {
    req.session.isAuth=true; 
    req.session.user = user;
    res.redirect("/");
  })
  .catch((err) => console.log(err));
};
