const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const feedRoutes = require("./routes/feed");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());
app.use('/images',express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use("/feed", feedRoutes);
app.use((err, req, res, next)=>{
  console.log(err);
  const status= err.statusCode||500;
  const message=err.message;
  res.status(status).json({message: message})
})

mongoose
  .connect(
    "mongodb+srv://fakeha:14789632@cluster0.4pkpi.mongodb.net/messages?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(7070);
  })
  .catch((err) => console.log(err));
