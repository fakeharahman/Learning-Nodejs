const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mondoDBstore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const errorController = require("./controllers/error");
// const mongoConnect = require("./util/database").mongoConnect;

const MONGODB_URI =
  "mongodb+srv://fakeha:14789632@cluster0.4pkpi.mongodb.net/shop?retryWrites=true&w=majority";

const app = express();
const store = new mondoDBstore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const User = require("./models/users");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); //to add css files
app.use(
  session({
    secret: "my secret token",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
  res.locals.isAuth = req.session.isAuth;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error Occured",
    path: "/500",
  });
});
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    //   if (!user) {
    //     const user = new User({
    //       name: "Fakeha",
    //       email: "test@test.com",
    //       cart: { itmes: [] },
    //     });
    //     user.save();
    //   }
    // }); // User.findOne().then((user) => {

    app.listen(6969);
  })
  .catch((err) => console.log(err));
