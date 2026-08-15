import multer from "multer";
import { env } from "./env";
import { ApiError } from "../utils/ApiError";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("audio/")) {
      callback(new ApiError(400, "Only audio files are allowed"));
      return;
    }
    callback(null, true);
  },
});
