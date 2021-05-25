const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const config = require("config");
const User = require("../../models/User");
const router = Router();
//@route POST api/users
//@desc  user register
//type public
const validateNewUser = () => [
  check("name", "Name is requird").not().isEmpty(),
  check("email", "Email is not valid").isEmail(),
  check("password", "Password should be 6 or more character").isLength({
    min: 6,
  }),
];
router.post("/", validateNewUser(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
  try {
    //see if the user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ error: [{ msg: "User already exist" }] });
    }
    //Get users gravatar
    const avatar = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "mm",
    });

    //encrypt password
    const salt = await bcrypt.genSalt(10);
    const newUser = new User({
      name,
      email,
      avatar,
      password: await bcrypt.hash(password, salt),
    });
    await newUser.save();

    const payload = {
      user: {
        id: newUser.id,
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
