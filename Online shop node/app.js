const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");
// const mongoConnect = require("./util/database").mongoConnect;
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const User = require("./models/users");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("5fb39c4c69228933d8cbbb72")
    .then((user) => {
      // console.log("DISPLAY USERCART", user.cart);
      // if (!user.cart) {
      //   user.cart = { items: [] };
      // }
      // console.log("No cart.", user.cart);
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
mongoose
  .connect(
    "mongodb+srv://fakeha:14789632@cluster0.4pkpi.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then(() => {
    User.findOne().then(user=>{
      if(!user){
        const user = new User({
          name: "Fakeha",
          email: "test@test.com",
          cart: { itmes: [] },
        });
        user.save();
      }
    })
      
    app.listen(6969);
  })
  .catch((err) => console.log(err));
 