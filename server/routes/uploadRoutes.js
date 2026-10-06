import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists with absolute path
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeBaseName}-${Date.now()}${ext || '.jpg'}`);
  },
});

// Init upload
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter(req, file, cb) {
    const filetypes = /jpe?g|png|webp|gif|svg|avif|bmp|ico|tiff/i;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const isImageMime = file.mimetype.startsWith('image/');

    if (extname || isImageMime) {
      return cb(null, true);
    } else {
      return cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG, AVIF) are allowed!'));
    }
  },
});

// Middleware to handle multer execution and capture errors cleanly
const uploadMiddleware = (req, res, next) => {
  // Accept 'image', 'file', 'photo', 'coverImage', or any field
  const uploadHandler = upload.any();
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer upload error:', err.message);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('File filter error:', err.message);
      return res.status(400).json({ message: err.message || 'Invalid file format' });
    }
    next();
  });
};

// @desc    Upload image
// @route   POST /api/upload and POST /api/upload/image
// @access  Public / Admin
const handleUpload = (req, res) => {
  const uploadedFile = req.file || (req.files && req.files[0]);
  if (!uploadedFile) {
    return res.status(400).json({ message: 'No image file provided in request.' });
  }

  const relativeUrl = `/uploads/${uploadedFile.filename}`;
  res.json({
    message: 'Image Uploaded Successfully',
    imageUrl: relativeUrl,
    url: relativeUrl,
    filename: uploadedFile.filename,
    originalName: uploadedFile.originalname,
    size: uploadedFile.size,
  });
};

router.post('/', uploadMiddleware, handleUpload);
router.post('/image', uploadMiddleware, handleUpload);
router.post('/single', uploadMiddleware, handleUpload);

export default router;
