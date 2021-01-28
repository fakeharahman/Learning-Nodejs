const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader= req.get("Authorization");
  if(!authHeader){
    const err=new Error("Not Authorized");
    err.statusCode=401;
    throw err;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "mysecretstringbigtimesecretdonotshare");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  // req.userEmail=decodedToken.email;
  next();
};
