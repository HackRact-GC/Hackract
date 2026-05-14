import express from 'express';
import { protect } from '../../middleware/Auth.middleware.js';
import { s3Upload, isS3Configured } from '../../utils/s3Upload.js';
import AppError from '../../utils/AppError.js';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/v1/uploads:
 *   post:
 *     summary: Upload a file/image to S3
 *     tags: [Upload]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Optional folder name in S3 (e.g. 'avatars', 'proofs')
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 url:
 *                   type: string
 *                   description: Public URL of the uploaded file
 *       400:
 *         description: No file uploaded or S3 not configured
 */
router.post('/', s3Upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded or invalid file format.', 400);
    }

    let fileUrl = '';
    
    if (isS3Configured) {
      // multer-s3 attaches the S3 URL to req.file.location
      fileUrl = req.file.location;
    } else {
      // For local fallback testing (you could adapt this to save locally and serve statically if needed)
      // Since it's memory storage fallback, we don't have a real URL.
      throw new AppError('AWS S3 is not configured. File cannot be stored.', 500);
    }

    res.status(200).json({
      success: true,
      url: fileUrl,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
