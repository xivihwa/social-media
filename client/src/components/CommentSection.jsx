import React, { useState } from "react";
import { DeleteOutlined } from "@mui/icons-material";
import { Box, Typography, Divider, InputBase, Button, useTheme, IconButton } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { createComment, deleteComment } from "state/index";
import WidgetWrapper from "./WidgetWrapper";

const CommentSection = ({ postId, comments }) => {
  const [newComment, setNewComment] = useState("");
  const loggedInUserId = useSelector((state) => state.user._id);
  const token = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;

  const handleCreateComment = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId, text: newComment }),
    });
    const updatedPost = await response.json();
    dispatch(createComment({ postId, comment: updatedPost.comments[updatedPost.comments.length - 1] }));
    setNewComment("");
  };
  
  const handleDeleteComment = async (commentId) => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await response.json();
    dispatch(deleteComment({ postId, commentId }));
  };
  

  return (
    <WidgetWrapper>
        <Box mt="0.5rem">
          {comments.map((comment, i) => (
            <Box key={comment._id} sx={{ mb: "0.5rem" }}>
              <Divider />
              <Box display="flex" alignItems="center" pl="1rem" mt="0.5rem">
                <Typography sx={{ color: "neutral.main", flexGrow: 1 }}>
                  {comment.text}
                </Typography>
                {comment.userId === loggedInUserId && (
                  <IconButton
                    onClick={() => handleDeleteComment(comment._id)}
                    variant="contained"
                    color="error"
                    sx={{ backgroundColor: primaryLight, ml: "1rem" }}
                  >
                    <DeleteOutlined sx={{ color: primaryDark }} />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}
          <Divider />
          <Box display="flex" alignItems="center" mt="0.5rem">
          <InputBase
            placeholder="Add a comment..."
            onChange={(e) => setNewComment(e.target.value)}
            value={newComment}
            sx={{
              width: "100%",
              backgroundColor: palette.neutral.light,
              borderRadius: "2rem",
              padding: "0.5rem 2rem",
            }}
          />
            <Button
            disabled={!newComment}
            onClick={handleCreateComment}
            sx={{
              color: palette.background.alt,
              backgroundColor: palette.primary.main,
              borderRadius: "3rem",
              ml: "1rem",
            }}
          >
            POST
          </Button>
          </Box>
        </Box>
    </WidgetWrapper>
  );
};

export default CommentSection;

