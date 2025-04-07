const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner'); 
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ImageMetadata = require('../model/ImageMetadata');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Multer config (Uses Memory Storage)
const memoryStorage = multer.memoryStorage();

const upload = multer({
    storage: memoryStorage, // Use memory storage
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpeg|jpg|svg|webp|png|gif|bmp|tiff|ico/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
            error.message = 'Invalid file type. Only ( jpeg , jpg , png , gif ) are allowed!';
            cb(error);
        }
    }
});


const calculateHash = (buffer) => {
    return crypto.createHash('md5').update(buffer).digest('hex'); // Using md5 for speed, sha256 is more collision-resistant
};

// --- Middleware for Duplicate Check and S3 Upload ---
const checkDuplicateAndUpload = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const fileBuffer = req.file.buffer;
    const fileHash = calculateHash(fileBuffer);

    try {
        const existingImage = await ImageMetadata.findOne({ hash: fileHash });

        if (existingImage) {
            console.log(`Duplicate found for hash ${fileHash}. Reusing S3 key: ${existingImage.s3Key}`);

            req.s3File = {
                _id: existingImage._id,
                key: existingImage.s3Key,
                location: existingImage.s3Location,
                hash: fileHash,
                size: existingImage.size,
                mimetype: existingImage.mimetype,
                isDuplicate: true
            };

            return next(); 
        } else {
            console.log(`No duplicate found for hash ${fileHash}. Uploading to S3...`);

            // Generate a unique S3 key
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(req.file.originalname);
            const s3Key = `uploads/${fileHash}-${uniqueSuffix}${extension}`; // Include hash in key for potential verification

            // Prepare S3 upload parameters
            const params = {
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: fileBuffer,
                ContentType: req.file.mimetype,
                // ACL: 'public-read', // Only if you need public access AND configured bucket for it
                Metadata: { 
                  'original-filename': req.file.originalname
                }
            };

            // Create and send the PutObjectCommand
            const command = new PutObjectCommand(params);
            const uploadResult = await s3Client.send(command);
            console.log(`Successfully uploaded to S3. Key: ${s3Key}, ETag: ${uploadResult.ETag}`);
            
            const newImageMetadata = new ImageMetadata({
                hash: fileHash,
                s3Key: s3Key,
                originalFilename: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                
            });
            await newImageMetadata.save();
            console.log(`Saved metadata to DB for hash ${fileHash}`);
          
            // Attach NEW S3 info to request object
            req.s3File = {
                _id: newImageMetadata._id,
                key: newImageMetadata.s3Key,
                location: newImageMetadata.s3Location,
                hash: fileHash,
                size: newImageMetadata.size,
                mimetype: newImageMetadata.mimetype,
                isDuplicate: false
            };

            return next(); 
        }
    } catch (err) {
        console.error("Error during duplicate check or S3 upload:", err);
        // Pass error to the central error handler
        // I might want more specific error handling (DB vs S3 errors)
        err.message = `Failed during file processing: ${err.message}`; // Add context
        return next(err);
    }
};


const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error("Multer Error:", err);
        return res.status(400).json({ errors: { msg: err.message } });
    } else if (err) {
        console.error("Caught Error:", err);
        return res.status(500).json({ errors: { msg: "Failed to process file upload." } });
    }
    
    next();
};

module.exports = {
    upload, // uses memory storage
    checkDuplicateAndUpload, 
    multerErrorHandler
};