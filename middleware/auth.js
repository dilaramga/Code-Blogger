const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  //get token from header
  const token = req.header("x-auth-token");
  //check if the token is empty
  if (!token) {
    return res.status(401).json({ msg: "No token, Authorization denied" });
  } else {
    //verify token
    try {
      const decoded = jwt.verify(token, config.get("jwtSecret"));
      req.user = decoded.user;
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ msg: "Token is not valid" });
    }
  }
};
