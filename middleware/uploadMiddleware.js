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


const upload = multer({ storage: storage });

// Utility function to generate a hash from a file
const generateFileHash = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);  // Read the file content
    const hashSum = crypto.createHash('sha256');   // Create SHA256 hash
    hashSum.update(fileBuffer);                    // Update hash with file content
    return hashSum.digest('hex');                  // Return the resulting hash
  };

const isDuplicate = (filename) => {
    const newFilePath = uploadsDir + '/' + filename;
    const newFileHash = generateFileHash(newFilePath);

    const existingFiles = fs.readdirSync(uploadsDir);  // Get list of existing files
  
    for (const file of existingFiles) {
      const existingFilePath = path.join(uploadsDir, file);
      const existingFileHash = generateFileHash(existingFilePath);
  
      // Compare the hash of the new file with each existing file
      if (newFileHash === existingFileHash) {
        return file.filename;  // Duplicate found
      }
    }
  
    return null;  // No duplicate found
}


module.exports = { upload, isDuplicate };