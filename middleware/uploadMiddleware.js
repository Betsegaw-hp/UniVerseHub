const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uploadsDir = path.join(__dirname, '..' ,'public', 'uploads');


if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);  // Upload files to the 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});


const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: function (req, file, cb) {
      // Accept only image files
      const fileTypes = /jpeg|jpg|png|gif/;
      const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = fileTypes.test(file.mimetype);

      if (mimetype && extname) {
          return cb(null, true);
      } else {
          //a custom MulterError with a custom message
          const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
          error.message = 'Invalid file type. Only ( jpeg , jpg , png ,gif ) are allowed!';
          cb(error);
      }
  }
 });

// Function to hash the image content
const hashImage = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
};


const checkDuplicateImage = async (req, res, next) => {
  const uploadDir = path.join(__dirname, '../public/uploads');
  const uploadedFile = req.file; 
  if(!uploadedFile) return next();

  const uploadedFilePath = path.join(uploadDir, uploadedFile.filename);

  try {
    const uploadedFileHash = await hashImage(uploadedFilePath);
    const existingFiles = fs.readdirSync(uploadDir);

    for (let file of existingFiles) {
      const existingFilePath = path.join(uploadDir, file);
      
      if (existingFilePath === uploadedFilePath || !fs.statSync(existingFilePath).isFile()) {
        continue;
      }

      const existingFileHash = await hashImage(existingFilePath);

      if (uploadedFileHash === existingFileHash) {
        // If the file is a duplicate, delete the uploaded file and forward the existing file path
        fs.unlinkSync(uploadedFilePath);

        req.imagePath = `/uploads/${file}`;
        
        console.log('Duplicate image found, forwarding existing file:', req.imagePath);
        
        // Proceed to the next middleware/handler
        return next();
      }
    }

    // If no duplicate is found, proceed with the uploaded file
    req.imagePath = `/uploads/${uploadedFile.filename}`;
    next();

  } catch (err) {
    console.error('Error while checking duplicate image:', err);
    res.status(500).json({ message: 'Error while checking duplicate image' });
  }
};

const multerErrorHandler = (err, req, res, next) => {
  // Handle multer errors or any other errors passed to next
  if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(400).json({ errors: { msg : err.message } });
  } else {
      return res.status(500).json({ errors: { err }});
  }
}


module.exports = { upload, checkDuplicateImage, multerErrorHandler };