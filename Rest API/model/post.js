const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const post = new Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  creator: {
    type: Object,
    required: true,
  },
}, {timestamps: true}); //gives createdAt and updatedAt

module.exports= mongoose.model("Post", post)
