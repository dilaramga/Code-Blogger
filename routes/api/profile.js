const { Router } = require("express");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const router = Router();

//@route GET api/profile
//@DESC Get all the profiles
//@access Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find({}).populate("user", [
      "avatar",
      "name",
    ]);
    res.json(profiles);
  } catch (error) {
    console.log(error.msg);
    res.status(500).send("Server Error");
  }
});

//@route GET api/profile/me
//@DESC Get current user profile
//@access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["avatar", "name"]);

    if (!profile) {
      return res.status(400).json({ msg: "Your profile can not be found" });
    }
    res.json(profile);
  } catch (error) {
    console.log(error.msg);
    res.status(500).send("Server Error");
  }
});

//@route GET api/profile/user/:user_id
//@DESC Get profile based on user_id
//@access Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["avatar", "name"]);
    res.json(profile);
  } catch (error) {
    console.log(error.msg);
    res.status(500).send("Server Error");
  }
});

//@route POST request api/profile
//@desc create or update profile
//@access Private
router.post(
  "/",
  auth,
  [
    check("skills", "Skills is required").not().isEmpty(),
    check("status", " Your current status as a developer is required")
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills && !Array.isArray(skills)) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //build social object
    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profileExist = await Profile.findOne({ user: req.user.id });
      if (profileExist) {
        //update profile
        const updatedProfile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(updatedProfile);
      } else {
        //create profile
        const newProfile = await new Profile(profileFields);
        await newProfile.save();
        res.json(newProfile);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  }
);

//@route DELETE api/profile
//@desc delete current user profile & user fromt the database
//@access private

router.delete("/", auth, async (req, res) => {
  try {
    //remove posts of that user
    await Post.deleteMany({ user: req.user.id });
    //remove profile of that user id
    await Profile.findOneAndRemove({ user: req.user.id });
    //remove posts by that user id

    //remove user
    await User.findOneAndRemove({ id: req.user.id });
    res.json("User deleted");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.put(
  "/experience",
  auth,
  [
    check("title", "title is required").not().isEmpty(),
    check("company", "company is required").not().isEmpty(),
    check("from", "from date is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      } = req.body;
      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      };
      let profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  }
);

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    profile.experience = profile.experience.filter(
      (experience) => experience.id.toString() !== req.params.exp_id
    );

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.put(
  "/education",
  auth,
  [
    check("school", "School is required").not().isEmpty(),
    check("degree", "Degree is required").not().isEmpty(),
    check("fieldofstudy", "Field of study is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      } = req.body;
      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      };
      let profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  }
);

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    profile.education = profile.education.filter(
      (edu) => edu.id.toString() !== req.params.edu_id
    );
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

//@route GET api/profile/github/:username
//@desc get user repos from github
//@access public
const request = require("request");
const config = require("config");
router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubClientSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No Github profile found" });
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
