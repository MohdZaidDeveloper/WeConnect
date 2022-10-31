const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Creating Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name!"],
  },
  avatar: {
    public_id: String,
    url: String,
  },
  email: {
    type: String,
    required: [true, "Please enter your email!"],
    unique: [true, "Email already exists!"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password!"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  followers: [  
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

//hashing password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

//matching password
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
  //it will return a true or false value
};

//Generating Token
userSchema.methods.generateToken = function() {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
};

//Creating Model
const User = mongoose.model("User", userSchema);

module.exports = User;
