const express = require("express");
const router = express.Router();

const {
  createPost,
  likeAndDislikePost,
  deletePost,
  getPostOfFollowing,
  updateCaption,
  commentOnPost,
  deleteComment,
} = require("../controller/postController");

const {isAuthenticated} = require("../middlewares/auth");

router.post("/post/create", isAuthenticated, createPost);
router
  .get("/post/:id", isAuthenticated, likeAndDislikePost)
  .patch("/post/:id", isAuthenticated, updateCaption)
  .delete("/post/:id", isAuthenticated, deletePost);
router.get("/posts", isAuthenticated, getPostOfFollowing);
router
  .put("/post/comment/:id", isAuthenticated, commentOnPost)
  .delete("/post/comment/:id", isAuthenticated, deleteComment);





module.exports = router