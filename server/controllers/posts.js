import Post from "../models/Post.js";
import User from "../models/User.js";
import s3 from "../s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const uploadFileToS3 = async (file) => {
  const s3Params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: file.originalname,
    Body: file.buffer,
  };

  try {
    const command = new PutObjectCommand(s3Params);
    const data = await s3.send(command);
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.originalname}`;
    return { [file.fieldname]: fileUrl };
  } catch (err) {
    console.error(err);
    return {};
  }
};

// CREATE
export const createPost = async (req, res) => {
  try {
    const { userId, description } = req.body;
    const user = await User.findById(userId);

    let newPostData = {
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      likes: {},
      comments: [],
    };

    if (req.files) {
      const files = req.files;
      const promises = [];
      if (files.picture) {
        promises.push(uploadFileToS3(files.picture[0]));
      }
      if (files.video) {
        promises.push(uploadFileToS3(files.video[0]));
      }
      if (files.attachment) {
        promises.push(uploadFileToS3(files.attachment[0]));
      }
      if (files.audio) {
        promises.push(uploadFileToS3(files.audio[0]));
      }

      const results = await Promise.all(promises);
      newPostData = {...newPostData,...results };
    }

    const newPost = new Post(newPostData);
    await newPost.save();

    const posts = await Post.find();
    res.status(201).json(posts);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, text } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      text,
      userId,
      createdAt: new Date(),
    };
    post.comments.push(newComment);
    await post.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// UPDATE
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// DELETE
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};