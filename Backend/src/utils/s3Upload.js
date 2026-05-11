import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Validate environment variables
const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET_NAME'];
const isS3Configured = requiredEnvVars.every((envVar) => process.env[envVar] && process.env[envVar] !== `your_${envVar.toLowerCase()}_here` && !process.env[envVar].includes('your_'));

let s3Client;

if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
} else {
  console.warn('⚠️ AWS S3 is not fully configured in .env. Falling back to local memory storage for uploads.');
}

const fileFilter = (req, file, cb) => {
  // Accept images, videos, audio, and common document/archive formats
  const allowedMimeTypes = [
    'image/', 'video/', 'audio/',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument',
    'application/vnd.ms-excel',
    'application/zip', 'application/x-rar-compressed',
    'text/plain', 'text/markdown', 'text/csv'
  ];

  const isAllowed = allowedMimeTypes.some(type => file.mimetype.startsWith(type));

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${file.mimetype}). This format is not supported.`), false);
  }
};

const storage = isS3Configured
  ? multerS3({
      s3: s3Client,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      acl: 'public-read', // Change to 'private' if you don't want public URLs
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        const ext = path.extname(file.originalname);
        // Organize by folder based on a query param or route if needed, default to 'uploads/'
        const folder = req.query.folder ? `${req.query.folder}/` : 'uploads/';
        cb(null, `${folder}${uniqueSuffix}${ext}`);
      },
    })
  : multer.memoryStorage(); // Fallback if S3 is not configured

const s3Upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export { s3Upload, isS3Configured };
