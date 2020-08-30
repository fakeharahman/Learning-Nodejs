const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const notFoundController=require("./controllers/404")

const app = express();

app.set("view engine", "ejs");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(notFoundController.notFound);

app.listen(6969);
