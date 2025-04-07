const express = require('express');
const router = express.Router();
const ImageMetadata = require('../model/ImageMetadata'); 
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

router.get('/image/:hash', async (req, res) => {
    try {
        const image = await ImageMetadata.findOne({ hash: req.params.hash });

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const commandGet = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: image.s3Key,
        });

        const url = await getSignedUrl(s3Client, commandGet, { expiresIn: 3600 }); // Generate new URL

        res.redirect(302, url);
    } catch (err) {
        console.error('Error getting pre-signed URL:', err);
        res.status(500).json({ message: 'Failed to retrieve image URL' });
    }
});

module.exports = router;