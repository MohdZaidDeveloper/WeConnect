const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const {
  register,
  login,
  logout,
  myProfile,
  getUserProfile,
  getAllUsers,
  follow,
  updatePassword,
  updateProfile,
  deleteProfile,
} = require("../controller/userController");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

router.get("/my-profile", isAuthenticated, myProfile);
router.get("/user/:id", isAuthenticated, getUserProfile);
router.get("/users", isAuthenticated, getAllUsers);

router.get("/follow/:id", isAuthenticated, follow);

router.patch("/update/password", isAuthenticated, updatePassword);
router.patch("/update/profile", isAuthenticated, updateProfile);

router.delete("/delete", isAuthenticated, deleteProfile);

module.exports = router;
