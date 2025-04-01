import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express-serve-static-core";

// Function to create a Multer instance with a custom path and file type restriction
const createMulter = (uploadPath: string, fileType: "image" | "audio") => {
  // Ensure the directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // File filter to allow only specified file types
  const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const imageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
      "image/svg+xml",
      "image/x-icon",
      "image/heic",
    ];
    const audioTypes = ["audio/mpeg"]; // Only allow MP3

    if (fileType === "image" && imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else if (fileType === "audio" && audioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Only ${
            fileType === "image" ? "images" : "MP3"
          } are allowed.`
        )
      );
    }
  };

  // Storage configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

  return multer({ storage, fileFilter });
};

export const deleteUploadedFile = (req: Request): void => {
  if (req.files) {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    // Loop through each uploaded file field and delete them
    Object.values(files).forEach((fileArray) => {
      fileArray.forEach((file) => {
        const filePath = file.path; //path.join(__dirname, "..", file.path);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${file.filename}:`, err);
          } else {
            console.log(`Deleted file ${file.filename} from ${filePath}`);
          }
        });
      });
    });
  }
};

export default createMulter;
