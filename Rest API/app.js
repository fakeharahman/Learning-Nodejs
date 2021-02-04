const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(bodyParser.json());
const filetype = (req, file, cb) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    return cb(null, true);
  }
  return cb(null, false);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images"),
  filename: (req, file, cb) => cb(null, uuidv4() + "-" + file.originalname),
});

app.use(multer({ storage: storage, fileFilter: filetype }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

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
app.use("/auth", authRoutes);
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const message = err.message;
  const data=err.data||[];
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://fakeha:14789632@cluster0.4pkpi.mongodb.net/messages?retryWrites=true&w=majority"
  )
  .then(() => {
   const server= app.listen(7070);
    const io=require("./socket").init(server);
    io.on("connection", socket=>{
      console.log("Connected");
    })
  })
  .catch((err) => console.log(err));
