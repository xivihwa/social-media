import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    location: String,
    description: String,
    picturePath: String,
    videoPath: String,
    attachmentPath: String,
    audioPath: String,
    userPicturePath: String,
    likes: {
      type: Map,
      of: Boolean,
    },
    comments: [{
      text: String,
      userId: String,
      createdAt: { type: Date, default: Date.now },
    }],
    files: [{
      filename: String,
      filePath: String,
    }],
  },
  {
    timestamps: {
      createdAt: true,
    },
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
