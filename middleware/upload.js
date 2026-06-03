import multer from "multer";

// Use memory storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Convert buffer to base64 data URL and return it
export const bufferToDataUrl = (fileBuffer, mimetype) => {
  const base64 = fileBuffer.toString("base64");
  return `data:${mimetype};base64,${base64}`;
};
