/*
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { promisify } from "util";

// Simple interface for uploaded files
interface UploadedFileDto {
  originalname: string;
  buffer?: Buffer;
  path?: string;
}

// Clean file storage function
async function storeFile(
  uploadPath: string,
  file: UploadedFileDto,
  keepOriginalName: boolean = false
): Promise<string> {
  // Create directory if needed
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Get file extension
  const fileExtension = path.extname(file.originalname);

  // Create new filename
  let newFilename = keepOriginalName
    ? `${path
        .parse(file.originalname)
        .name.replace(/[^a-zA-Z0-9]/g, "_")
        .substring(0, 40)}-${uuidv4()}${fileExtension}`
    : `${uuidv4()}${fileExtension}`;

  const filePath = path.join(uploadPath, newFilename);

  // Handle the file based on what's available
  if (file.buffer) {
    await promisify(fs.writeFile)(filePath, file.buffer);
  } else if (file.path) {
    await promisify(fs.copyFile)(file.path, filePath);
    await promisify(fs.unlink)(file.path);
  } else {
    throw new Error("Invalid file: needs buffer or path");
  }

  return newFilename;
}

export { storeFile, UploadedFileDto };
*/
