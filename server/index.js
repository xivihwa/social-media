import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { error } from "console";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import fs from 'fs';
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

// CONFIGURATIONS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors(
  {
    origin: ["https://social-media-client-plum-nine.vercel.app"],
    methods: ["POST", "GET", "OPTIONS", "HEAD", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }
));
app.use("/assets", express.static(path.join(__dirname, "./public/assets")));

// FILE STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    fs.access(`public/assets/${file.originalname}`, (err) => {
      if (err) {
        fs.writeFile(`public/assets/${file.originalname}`, '', (err) => {
          if (err) {
            console.error(err);
            return cb(null, false);
          }
          return cb(null, true);
        });
      } else {
        return cb(null, true);
      }
    });
  },
});


// ROUTES WITH FILES
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.fields([
  { name: 'picture', maxCount: 1 }, 
  { name: 'video', maxCount: 1 }, 
  { name: 'attachment', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), createPost);

// ROUTES
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// MONGOOSE SETUP
mongoose
  .connect(process.env.MONGO_URL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => console.error("MongoDB Connection Error: ", error));

export default app;
