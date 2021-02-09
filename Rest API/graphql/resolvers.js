const User = require("../model/user");
const Post = require("../model/post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: validator } = require("validator");
// const { Error } = require("mongoose");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const user = await User.findOne({ email: userInput.email });
    if (user) {
      throw new Error("User Exists");
    }
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "Email invalid" });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "Invalid Password" });
    }
    if (errors.length > 0) {
      const err = new Error("validation failed");
      err.data = errors;
      err.code = 422;
      throw err;
    }
    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const newUser = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPassword,
    });
    const createdUser = await newUser.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
  login: async function ({ email, password }, req) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const err = new Error("Email not found");
      err.code = 401;
      throw err;
    }
    const isPass = await bcrypt.compare(password, user.password);
    if (!isPass) {
      const err = new Error("Wrong Password");
      err.code = 401;
      throw err;
    }
    const token = jwt.sign(
      { email: email, userId: user._id.toString() },
      "SecretString",
      { expiresIn: "1h" }
    );
    return {
      token: token,
      userId: user._id.toString(),
    };
  },

  createPost: async function ({ postInput }, req) {
    if (!req.isAuth) {
      const err = new Error("Not authenticated");
      err.code = 401;
      throw err;
    }
    const errors = [];
    if (!validator.isLength(postInput.title, { min: 5 })) {
      errors.push({ message: "Title too short" });
    }
    if (!validator.isLength(postInput.content, { min: 5 })) {
      errors.push({ message: "Content too short" });
    }
    if (errors.length > 0) {
      const err = new Error("validation failed");
      err.data = errors;
      err.code = 422;
      throw err;
    }
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("Auth Error");
      err.code = 401;
      throw err;
    }

    const post = new Post({
      title: postInput.title,
      imageUrl: postInput.imageUrl,
      content: postInput.content,
      creator: user,
    });
    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },
  getPosts: async function ({ page }, req) {
    if (!req.isAuth) {
      const err = new Error("Not authenticated");
      err.code = 401;
      throw err;
    }
    const POSTS_PER_PAGE=2;
    if(!page){
      page=1;
    }
    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("creator")
      .skip(POSTS_PER_PAGE * (page - 1))
      .limit(POSTS_PER_PAGE);
    // console.log(posts);
    return {
      posts: posts.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
      totalPosts: totalPosts,
    };
  },
};
