import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js"; // your existing cloudinary config

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "writeer_uploads",        // folder in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

export default upload;
