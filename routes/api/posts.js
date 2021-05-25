const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const router = Router();

//@route POST api/posts
//@desc create a post
//@access Private
router.post(
  "/",
  auth,
  [check("text", "Post Body is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id);
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);

//@route GET api/posts
//@desc get all the posts
//@access Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
//@route DELETE api/posts/:post_id
//@desc delete post by post_id
//@access Private
router.delete("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    //check if post exist
    if (!post) {
      return res.status(404).json({ msg: "Page not found" });
    }
    //check if the user trying to delete the post is authorised user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await post.remove();
    res.json({ msg: "Post removed" });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post Not found" });
    }
    res.status(500).send("Server Error");
  }
});
//@route ge t api/posts/:post_id
//@desc get post by post_id
//@access Private
router.get("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    //check if post exist
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post Not found" });
    }
    res.status(500).send("Server Error");
  }
});

//@route put api/posts/like/:post_id
//@desc add users who liked the post to post data
//@access Private
router.put("/like/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    //check if post exist
    if (!post) {
      return res.status(404).json({ msg: "Page not found" });
    }
    //check if the post has already been liked by that user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.json(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post Not found" });
    }
    res.status(500).send("Server Error");
  }
});

//@route put api/posts/unlike/:post_id
//@desc add users who liked the post to post data
//@access Private
router.put("/unlike/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    //check if post exist
    if (!post) {
      return res.status(404).json({ msg: "Page not found" });
    }
    //check if the post has not been liked by that user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.json(400).json({ msg: "Post hasnt been liked" });
    }
    //delete the user from the posts likes users
    post.likes = post.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post Not found" });
    }
    res.status(500).send("Server Error");
  }
});

//@route post api/posts/comment/:post_id
//@desc add comment to posts
//@access Private
router.put(
  "/comment/:post_id",
  auth,
  check("text", "Comment is required").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const post = await Post.findById(req.params.post_id);
      const user = await User.findById(req.user.id);
      //check if post exist
      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }
      const comment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };

      post.comments.unshift(comment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ msg: "Post Not found" });
      }
      res.status(500).send("Server Error");
    }
  }
);

//@route delete api/posts/comment/:post_id
//@desc delete comment from post by comment id
//@access Private
router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    const comment = post.comments.find(
      (i) => i.id.toString() === req.params.comment_id
    );
    //check if post exist
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    //check if commetn exist
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }
    //check if the user is authorised to delete the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User Not authorised" });
    }
    //delete comment
    await comment.remove();
    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post Not found" });
    }
    res.status(500).send("Server Error");
  }
});
module.exports = router;
