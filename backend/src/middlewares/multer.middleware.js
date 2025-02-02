import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure the destination folder exists
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./public/temp"; // Path where files will be stored
    ensureDirectoryExistence(uploadPath); // Ensure the folder exists
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // You might want to give the file a unique name instead of using the original name.
    // Example: Use current timestamp and original file extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Ensures original extension is preserved
  },
});

// Multer middleware setup
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Maximum file size (10 MB in this case)
  },
  fileFilter: (req, file, cb) => {
    // Validate file types, for example, allowing only images
    const allowedTypes = /jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = allowedTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      return cb(new Error("Only image files are allowed!"), false);
    }
  },
});
