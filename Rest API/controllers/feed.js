const { validationResult } = require("express-validator");
const Post = require("../model/post");

exports.getFeed = (req, res, next) => {
  Post.find()
    .then((posts) => {
      // console.log(posts);
      return res.status(200).json({
        posts: posts,
      });
    })
    .catch((err) => {
      if(!err.statusCode){
        err.statusCode=500
      }
      next(err)
    });
};

exports.postPost = (req, res, next) => {
  //create post
  const title = req.body.title;
  const content = req.body.content;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error=new Error("Validation Failed");
    error.statusCode=422;
    throw error;
    
  }
  const post = new Post({
    title: title,
    content: content,
    imageUrl: "/images/other.jpg",
    creator: {
      name: "Fakeha",
    },
  });
  post
    .save()
    .then((result) => {
      return res
        .status(201) //resource successfully created
        .json({
          message: "Created Post!",
          post: result,
        });
    })
    .catch((err) => {
      if(!err.statusCode){
        err.statusCode=500
      }
      next(err)
    });
};

exports.getPost=(req,res,next)=>{
  // console.log(req.params);
  Post.findById(req.params.id).then(post=>{
    // console.log(post);
    if(!post){
      const error= new Error("No Post Found!")
      error.statusCode=404;
      throw error;
    }
    return res.status(200).json({post:post})
  }).catch(err=>{
    if(!err.statusCode){
      err.statusCode=500
    }
    next(err)
  })
}
