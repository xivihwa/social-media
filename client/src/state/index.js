import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload.friends;
      } else {
        console.error("user friends non-existent :(");
      }
    },
    setPosts: (state, action) => {
      const sortedPosts = action.payload.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      state.posts = sortedPosts;    
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
    setPostDelete: (state, action) => {
      state.posts = state.posts.filter(post => post._id !== action.payload.post._id);
    },
    createComment: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.postId) {
          return {
            ...post,
            comments: [...post.comments, action.payload.comment],
          };
        }
        return post;
      });
      state.posts = updatedPosts;
    },
    deleteComment: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.postId) {
          return {
            ...post,
            comments: post.comments.filter(comment => comment._id !== action.payload.commentId),
          };
        }
        return post;
      });
      state.posts = updatedPosts;
    },
  },
});
export const { setMode, setLogin, setLogout, setFriends, setPosts, setPost, setPostDelete, createComment, deleteComment } =
  authSlice.actions;
export default authSlice.reducer;
