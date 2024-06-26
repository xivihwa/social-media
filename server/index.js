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
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import multerS3 from "multer-s3";
import s3 from "./s3.js";
import fs from "fs";

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
app.use(cors({
  origin: ["https://social-media-client-plum-nine.vercel.app"],
  methods: ["POST", "GET", "OPTIONS", "HEAD", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

app.use("/assets/:filename", (req, res, next) => {
  const filePath = path.join(__dirname, "./public/assets", req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      res.sendFile(filePath);
    } else {
      const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.params.filename}`;
      res.redirect(s3Url);
    }
  });
});

app.use("/assets", express.static(path.join(__dirname, "./public/assets")));

// FILE STORAGE
const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploadRegister = multer({
  storage: s3Storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// ROUTES WITH FILES
app.post("/auth/register", uploadRegister.single("picture"), register);
app.post("/posts", verifyToken, upload.fields([
  { name: 'picture', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'attachment', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
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
