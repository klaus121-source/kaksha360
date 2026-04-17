import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Local storage temporarily for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'temp/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'), false);
    }
  }
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const uploadFileToS3 = async (filePath, filename) => {
  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: 'examverse-videos',
    Key: `materials/${filename}`,
    Body: fileStream,
    ContentType: 'application/pdf',
  };

  const parallelUpload = new Upload({
    client: s3Client,
    params: uploadParams,
  });
  await parallelUpload.done();
  return `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
};
