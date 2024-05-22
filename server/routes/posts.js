import express from "express";
import { 
  getFeedPosts, 
  getUserPosts, 
  likePost, 
  deletePost, 
  createComment, 
  deleteComment 
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// READ
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

// UPDATE
router.patch("/:id/like", verifyToken, likePost);

// DELETE
router.delete("/:postId", verifyToken, deletePost);

// COMMENTS
router.post("/:postId/comments", verifyToken, createComment);
router.delete("/:postId/comments/:commentId", verifyToken, deleteComment);

export default router;
