exports.getFeed = (req, res, next) => {
  res.status(200).json({ posts: [{ "First Post": "this first post" }] });
};

exports.postPost = (req, res, next) => {
  //create post
  const title = req.body.title;
  const content = req.body.content;
  res
    .status(201) //resource successfully created
    .json({
      message: "Created Post!",
      post: { id: new Date().toISOString(), title: title, content: content },
    });
};
