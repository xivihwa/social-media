import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  AttachmentOutlined,
} from "@mui/icons-material";
import { Box, IconButton, Typography, useTheme, Modal, Button } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";
import CommentSection from "components/CommentSection";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  videoPath,
  attachmentPath,
  audioPath,
  userPicturePath,
  likes,
  comments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const handleCopyLink = () => {
    const link = `http://localhost:3001/posts/${postId}`;
    navigator.clipboard.writeText(link).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        setIsShareModalOpen(false);
      }, 2000);
    });
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
        postId={postId}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`http://localhost:3001/assets/${picturePath}`}
        />
      )}
      {videoPath && (
        <video
          controls
          width="100%"
          height="auto"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`http://localhost:3001/assets/${videoPath}`} 
        />
      )}
      {attachmentPath && (
        <Box
          display="flex"
          alignItems="center"
          mt="0.75rem"
        >
          <AttachmentOutlined sx={{ marginRight: "0.5rem", transform: "rotate(270deg)" }} />
          <a
            href={`http://localhost:3001/assets/${attachmentPath}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {attachmentPath.split("/").pop()}
          </a>
        </Box>
      )}
      {audioPath && (
        <Box>
          <audio controls style={{ width: "100%" }}>
            <source src={`http://localhost:3001/assets/${audioPath}`} type="audio/mp3" />
          </audio>
        </Box>
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        <IconButton onClick={() => setIsShareModalOpen(true)}>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          <CommentSection postId={postId} comments={comments} />
        </Box>
      )}
      <Modal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: '1rem',
        }}>
          <Typography variant="h6" component="h2">
            Share this link
          </Typography>
          <Button onClick={handleCopyLink} sx={{ borderRadius: '1rem', mt: 2 }}>
            Copy link
          </Button>
          {isCopied && (
            <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
              Link copied!
            </Typography>
          )}
        </Box>
      </Modal>
    </WidgetWrapper>
  );
};

export default PostWidget;
