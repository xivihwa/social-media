import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostWidget from "./PostWidget";

const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);

  const getPosts = async () => {
    const response = await fetch("https://social-media-server-flax.vercel.app/posts", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    dispatch(setPosts({ posts: data }));
  };

  const getUserPosts = async () => {
    const response = await fetch(
      `https://social-media-server-flax.vercel.app/posts/${userId}/posts`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    dispatch(setPosts({ posts: data }));
  };

  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {posts.map(
        ({
          _id,
          userId,
          firstName,
          lastName,
          description,
          location,
          picturePath,
          videoPath,
          attachmentPath,
          audioPath,
          userPicturePath,
          likes,
          comments,
          files
        }) => (
          <PostWidget
            key={_id}
            postId={_id}
            postUserId={userId}
            name={`${firstName} ${lastName}`}
            description={description}
            location={location}
            picturePath={files.find(elem => elem.filetype === "picture") ? files.find(elem => elem.filetype === "picture").filePath : picturePath}
            videoPath={files.find(elem => elem.filetype === "video") ? files.find(elem => elem.filetype === "video").filePath : videoPath}
            attachmentPath={files.find(elem => elem.filetype === "attachment") ? files.find(elem => elem.filetype === "attachment").filePath : attachmentPath }
            audioPath={files.find(elem => elem.filetype === "audio") ? files.find(elem => elem.filetype === "audio").filePath : audioPath}
            userPicturePath={userPicturePath}
            likes={likes}
            comments={comments}
          />
        )
      )}
    </>
  );
};

export default PostsWidget;