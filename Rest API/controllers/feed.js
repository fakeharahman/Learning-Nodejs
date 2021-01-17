exports.getFeed = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first post!",
        imageUrl: "/images/other.jpg",
        creator: {
          name: "Fakeha",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.postPost = (req, res, next) => {
  //create post
  const title = req.body.title;
  const content = req.body.content;
  res
    .status(201) //resource successfully created
    .json({
      message: "Created Post!",
      post: {
        _id: new Date().toISOString(),
        title: title,
        content: content,
        createdAt: new Date(),
        creator: { name: "Fakeha" },
      },
    });
};
