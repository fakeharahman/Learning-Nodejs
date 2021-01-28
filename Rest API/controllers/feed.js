const { validationResult } = require("express-validator");
const Post = require("../model/post");
const fs = require("fs");
const path = require("path");
const { response } = require("express");
const User = require("../model/user");

const POSTS_PER_PAGE = 2;

exports.getFeed = (req, res, next) => {
  const page = req.query.page || 1;
  Post.find()
    .countDocuments()
    .then((total) => {
      console.log(req.query);
      Post.find()
        .skip(POSTS_PER_PAGE * (page - 1))
        .limit(POSTS_PER_PAGE)
        .then((posts) => {
          // console.log(posts);
          return res.status(200).json({
            posts: posts,
            totalItems: total,
          });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postPost = (req, res, next) => {
  //create post
  if (!req.file) {
    const error = new Error("No image found");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace("\\", "/");
  const errors = validationResult(req);
  let creator;
  let newPost;
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    throw error;
  }
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  post
    .save()
    .then((result) => {
      newPost = result;
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(newPost);
      return user.save();
    })
    .then(() => {
      return res
        .status(201) //resource successfully created
        .json({
          message: "Created Post!",
          post: newPost,
          creator: { _id: creator._id, name: creator.name },
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  // console.log(req.params);
  Post.findById(req.params.id)
    .then((post) => {
      // console.log(post);
      if (!post) {
        const error = new Error("No Post Found!");
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({ post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.putPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    throw error;
  }
  const postId = req.params.id;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("No Image Found!");
    error.statusCode = 404;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No Post Found!");
        error.statusCode = 404;
        throw error;
      }
      if (req.userId !== post.creator.toString()){
        const error=new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
        if (imageUrl !== post.imageUrl) {
          clearImage(post.imageUrl);
        }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((post) => {
      return res.status(200).json({
        message: "Post Updated successfully!",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const id = req.params.id;
  Post.findById(id)
    .then((post) => {
      if (!post) {
        const error = new Error("No Post Found!");
        error.statusCode = 404;
        throw error;
      }
      if (req.userId !== post.creator.toString()){
        const error=new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      const imgUrl = post.imageUrl;
      clearImage(imgUrl);
      return Post.findByIdAndDelete(id);
    })
    .then((response) => {
      return User.findById(req.userId)
    }).then(user=>{
      
      user.posts.pull(id);
      return user.save();
    }).then(response=>{
      
      res.status(200).json({ message: "Deleted Post" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  const p = path.join(__dirname, "..", filePath);
  fs.unlink(p, (err) => console.log(err));
};

exports.getStatus=(req, res, next)=>{
  console.log(req.userId+ " hi");
  User.findById(req.userId).then(user=>{
    console.log();
    res.status(200).json({
      status: user.status
    })
  })
  .catch(err=>{
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}

exports.putStatus=(req,res,next)=>{
  User.findById(req.userId).then(user=>{
    console.log(user);
    const status=req.body.status;
    user.status=status;
    return user.save()
  })
  .then(()=>{
    res.status(200).json({message: "Status updated!"})
  })
  .catch(err=>{
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}