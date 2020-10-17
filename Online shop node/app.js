const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const Product = require("./models/product");
const User = require("./models/users");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next)=>{
  User.findByPk(1).then(user=>{
    req.user=user;
    next();
  }).catch(err=>console.log(err))

})

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);

sequelize
  .sync()
  .then((res) => {
    // console.log(res);
    return User.findByPk(1);
  }).then(user=>{
    if(!user){
      User.create({
        name: "fakeha",
        email:"test@test.com" 
      })
    }
    return Promise.resolve(user);
  })
  .then(user=>{
    app.listen(6969);
    // console.log(user, "User");

  })
  .catch((err) => {
    console.log(err);
  });
