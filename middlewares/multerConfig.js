const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { BadRequestError } = require('../utils/error');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Choose destination based on file type
    let uploadPath = uploadsDir;
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(uploadsDir, 'images');
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = path.join(uploadsDir, 'documents');
    } else {
      uploadPath = path.join(uploadsDir, 'other');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
  // Define allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(BadRequestError(`File type not allowed: ${file.mimetype}`), false);
  }
};

// Configure size limits
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB max file size
  files: 10 // Max 10 files per upload
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits
});

// Export configured multer instance
module.exports = { upload };