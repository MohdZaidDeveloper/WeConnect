const Post = require("../model/postModel");
const User = require("../model/userModel");
const { post } = require("../routes/postRoutes");

//Creating New Post
const createPost = async (req, res) => {
  try {
    // res.status(200).json({ message: "Post created!" });
    const newPostData = {
      caption: req.body.caption,
      image: {
        public_id: "public_id",
        url: "url",
      },
      owner: req.user._id,
    };
    const post = await Post.create(newPostData);

    const user = await User.findById(req.user._id);
    user.posts.push(post._id);
    await user.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Deleting Post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if user is deleting the post which exist
    if (!post) {
      return res.status(404).json({ message: "Post Not Found!" });
    }

    // Check if user is deleting his/her post only
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized User!" });
    }

    await post.remove();

    //Deleting Post from user posts array also
    const user = await User.findById(req.user._id);

    const index = user.posts.indexOf(req.params.id);

    user.posts.splice(index, 1);
    await user.save();

    res.status(200).json({ message: "Post Deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Liking and Disliking Post
const likeAndDislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post Not Found!" });
    }

    if (post.likes.includes(req.user._id)) {
      const index = post.likes.indexOf(req.params.id);
      post.likes.splice(index, 1);
      await post.save();
      return res.status(200).json({ message: "Post Disliked!" });
    } else {
      post.likes.push(req.user._id);
      await post.save();
      return res.status(200).json({ message: "Post Liked!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Getting Posts of Following
const getPostOfFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = await Post.find({
      owner: {
        $in: user.following,
      },
    });
    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Update Caption
const updateCaption = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Unauthorized User!" });
    }

    post.caption = req.body.caption;
    await post.save();
    res.status(200).json({ message: "Caption updated!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Adding Comments
const commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post Not Found!" });
    }

    let commentIndex = -1;

    //Checking if comment already exists
    post.comments.forEach((item, index) => {
      if (item.user.toString() === req.user._id.toString()) {
        commentIndex = index;
      }
    });

    if (commentIndex !== -1) {
      post.comments[commentIndex].comment = req.body.comment;

      await post.save();
      return res.status(200).json({ message: "Comment Updated!" });
    } else {
      post.comments.push({
        user: req.user._id,
        comment: req.body.comment,
      });

      await post.save();
      return res.status(201).json({ message: "Comment Added!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Adding Comments
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post Not Found!" });
    }

    if (req.body.commentId === undefined) {
      return res.status(400).json({ message: "Comment Id required!" });
    }

    if (post.owner.toString() === req.user._id.toString()) {
      post.comments.forEach((item, index) => {
        if (item._id.toString() === req.body.commentId.toString()) {
          return post.comments.splice(index, 1);
        }
      });
      await post.save();
      return res.status(200).json({ message: "Comment has been Deleted!" });
    } else {
      post.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          return post.comments.splice(index, 1);
        }
      });

      await post.save();
      res.status(200).json({ message: "Your Comment has been Deleted!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPost,
  deletePost,
  likeAndDislikePost,
  getPostOfFollowing,
  updateCaption,
  commentOnPost,
  deleteComment,
};
