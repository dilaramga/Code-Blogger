const { Router } = require("express");
const router = Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const config = require("config");

//@route api/auth
//@desc user data of authorised user
//@private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route POST api/auth
//@desc  user log in
//type public
const validateNewUser = () => [
  check("email", "Email is not valid").isEmail(),
  check("password", "Password does not exist").exists(),
];
router.post("/", validateNewUser(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    //see if the user does not exist
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ error: [{ msg: "Invalid Credential" }] });
    }
    const isMatch = await bcrypt.compare(password, userExist.password);
    if (!isMatch) {
      return res.status(400).json({ error: [{ msg: "Invalid Credential" }] });
    }

    const payload = {
      user: {
        id: userExist.id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: 3600000 },
      (err, token) => {
        if (err) {
          throw err;
        } else {
          res.json({ token });
        }
      }
    );
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
