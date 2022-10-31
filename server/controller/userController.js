const User = require("../model/userModel");
const Post = require("../model/postModel");

const register = async (req, res) => {
  try {
    // res.status(200).json({ message: "user registered!" });
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: "User already exists!" });
      return;
    }
    user = await User.create({
      name,
      email,
      password,
      avatar: { public_id: "sample public id", url: "sample url" },
    });

    // res.status(200).json(user);

    //Method to generate Token
    const token = await user.generateToken();

    //Options for cookies
    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(201).cookie("token", token, options).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    // res.status(200).json({message:"User logged in!"});
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(400).json({ message: "Invalid user!" });
      return;
    }
    //Method to match password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(400).json({ message: "Incorrect password!" });
      return;
    }

    //Method to generate Token
    const token = await user.generateToken();

    //Options for cookies
    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(200).cookie("token", token, options).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({ message: "Logged Out!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Follow unfollow users
const follow = async (req, res) => {
  // res.send("hello")
  try {
    const userToFollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    //UnFollow
    if (loggedInUser.following.includes(userToFollow._id)) {
      const indexFollowing = loggedInUser.following.indexOf(userToFollow._id);
      loggedInUser.following.splice(indexFollowing, 1);

      const indexFollowers = userToFollow.followers.indexOf(loggedInUser._id);
      userToFollow.followers.splice(indexFollowers, 1);

      await loggedInUser.save();
      await userToFollow.save();
      res.status(200).json({ message: "User Unfollowed!" });
    } else {
      loggedInUser.following.push(userToFollow._id);
      userToFollow.followers.push(loggedInUser._id);

      await loggedInUser.save();
      await userToFollow.save();

      res.status(200).json({ message: "User Followed!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Update Password
const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Please Provide Password to change!" });
    }

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Old Password!" });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "Cannot take old password again!" });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password Changed!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Update Profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, email } = req.body;

    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }

    //Avatar will do later
    await user.save();
    res.status(200).json({ message: "Profile Updated!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Delete Profile
const deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = user.posts;
    const followers = user.followers;
    const following = user.following;
    const userId = user._id;

    if (!user) {
      return res.status(200).json({ message: "Please login first!" });
    }
    await user.remove();

    // logging user out after deleting profile
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    //Deleting all posts
    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i]);
      await post.remove();
    }

    //Deleting User from follower's following
    for (let i = 0; i < followers.length; i++) {
      const follower = await User.findById(followers[i]);
      const index = follower.following.indexOf(userId);
      follower.following.splice(index, 1);

      await follower.save();
    }

    //Deleting User from following's follower
    for (let i = 0; i < following.length; i++) {
      const follows = await User.findById(following[i]);
      const index = follows.followers.indexOf(userId);
      follows.followers.splice(index, 1);

      await follows.save();
    }

    res.status(200).json({ message: "Profile deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//View My Profile Data
const myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("posts");

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//View Any User's profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("posts");
    if (!user) {
      res.status(404).json({ message: "User Not Found!" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//View All User's profile
const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({});

    res.status(200).json({ allUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
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
};
