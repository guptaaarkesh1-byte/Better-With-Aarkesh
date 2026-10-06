import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure Cloudinary with credentials from environment
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log(`Cloudinary configured successfully for cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
  });
  console.log('Cloudinary configured using CLOUDINARY_URL');
}

// Ensure local uploads directory exists with absolute path as fallback / cache
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

// @desc    Upload image to Cloudinary (with fallback to local storage)
// @route   POST /api/upload, POST /api/upload/image, POST /api/upload/single
// @access  Public / Admin
const handleUpload = async (req, res) => {
  try {
    const uploadedFile = req.file || (req.files && req.files[0]);
    if (!uploadedFile) {
      return res.status(400).json({ message: 'No image file provided in request.' });
    }

    const localRelativeUrl = `/uploads/${uploadedFile.filename}`;

    // Try uploading to Cloudinary if credentials are present
    const hasCloudinary = (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) || process.env.CLOUDINARY_URL;

    if (hasCloudinary) {
      try {
        const uploadResult = await cloudinary.uploader.upload(uploadedFile.path, {
          folder: 'better_with_aarkesh',
          resource_type: 'auto',
        });

        // Optionally remove temp local file after successful upload to Cloudinary
        try {
          if (fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
          }
        } catch (_) {}

        return res.json({
          message: 'Image Uploaded to Cloudinary Successfully',
          imageUrl: uploadResult.secure_url,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          originalName: uploadedFile.originalname,
        });
      } catch (cloudErr) {
        console.error('Cloudinary upload error, falling back to local storage:', cloudErr.message || cloudErr);
      }
    }

    // Fallback response with local file URL
    res.json({
      message: 'Image Uploaded Successfully (Local)',
      imageUrl: localRelativeUrl,
      url: localRelativeUrl,
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalname,
      size: uploadedFile.size,
    });
  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({ message: 'Server error processing file upload' });
  }
};

router.post('/', uploadMiddleware, handleUpload);
router.post('/image', uploadMiddleware, handleUpload);
router.post('/single', uploadMiddleware, handleUpload);

export default router;
