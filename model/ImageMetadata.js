const mongoose = require('mongoose');

const imageMetadataSchema = new mongoose.Schema({
    hash: { 
        type: String,
        required: true,
        unique: true, 
        index: true, 
    },
    s3Key: { // The key (path) of the object in the S3 bucket
        type: String,
        required: true,
        unique: true,
    },
    s3Location: { // The full S3 URL (useful if objects are public, otherwise less critical)
        type: String,
    },
    originalFilename: {
        type: String,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
    size: { // Size in bytes
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value. size is in bytes',
        },
        min: [1, 'Size must be at least 1 byte.'],
    },
}, { timestamps: true });

// Construct the S3 location URL 
imageMetadataSchema.pre('save', function(next) {
    if (!this.s3Location) {
       this.s3Location = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${this.s3Key}`;
    }
    next();
});


const ImageMetadata = mongoose.model('ImageMetadata', imageMetadataSchema);

module.exports = ImageMetadata;