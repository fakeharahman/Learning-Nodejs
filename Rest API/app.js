const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");


const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { graphqlHTTP } = require("express-graphql");

const graphQlSchema= require("./graphql/schema")
const graphQlResolver= require("./graphql/resolvers")
const isAuth=require("./middleware/is-auth")

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
  if(req.method==="OPTIONS"){
    return res.sendStatus(200);
  }
  next();
});

app.use(isAuth);

app.use("/graphql", graphqlHTTP({
  schema: graphQlSchema,
  rootValue: graphQlResolver,
  graphiql: true,
  customFormatErrorFn(err){
    if(!err.originalError){
      return err;
    }
    const data= err.originalError.data;
    const code=err.originalError.code || 500;
    const message=err.message || "Error occured";
    return {
      message: message,
      status: code,
      data: data
    }
  }
}))

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
  app.listen(7070);


  })
  .catch((err) => console.log(err));
