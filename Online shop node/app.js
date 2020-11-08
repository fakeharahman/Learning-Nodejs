const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const mongoConnect= require("./util/database").mongoConnect
const app = express();


app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const User = require("./models/users");
 


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next)=>{
  User.findById('5fa51752751b2a5f2ba0e926')
  .then(user=>{
    console.log("DISPLAY USERCART", user.cart);
    if (!user.cart) {
      user.cart = { items: [] };
    }
    console.log("No cart.", user.cart);
    req.user=new User(user.name, user.email, user.cart, user._id);
    next();
  }).catch(err=>console.log(err))
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
mongoConnect(()=>{

  app.listen(6969);

})