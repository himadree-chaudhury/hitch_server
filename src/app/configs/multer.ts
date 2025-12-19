import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryConfig } from "./cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryConfig,
  params: {
    public_id: (req, file) => {
      // extract extension safely
      const original = file.originalname.toLowerCase();
      const lastDot = original.lastIndexOf(".");
      const base = lastDot !== -1 ? original.slice(0, lastDot) : original;
      const ext = lastDot !== -1 ? original.slice(lastDot + 1) : "";

      // clean the base name
      const safeBase = base.replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

      // unique name with extension kept
      return `${Math.random()
        .toString(36)
        .substring(2, 8)}-${safeBase}-${Date.now()}${ext ? "." + ext : ""}`;
    },
  },
});

export const multerConfig = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }

    cb(null, true);
  },
});
