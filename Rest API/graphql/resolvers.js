const User = require("../model/user");
const bcrypt = require("bcrypt");
const { default: validator } = require("validator");
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
    if(errors.length>0){
        const err= new Error("validation failed");
        err.data= errors
        err.code=422;
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
};
