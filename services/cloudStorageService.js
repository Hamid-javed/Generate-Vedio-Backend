const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

class CloudStorageService {
  constructor() {
    // Configure AWS S3 (you can also use other cloud providers like Google Cloud, Azure)
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  /**
   * Upload video to cloud storage
   * @param {string} localFilePath - Local path of the video file
   * @param {string} videoId - Unique video identifier
   * @param {string} childName - Child's name for file naming
   * @returns {Promise<string>} - Public URL of uploaded video
   */
  async uploadVideo(localFilePath, videoId, childName) {
    try {
      if (!fs.existsSync(localFilePath)) {
        throw new Error('Video file not found at local path');
      }

      // Create a clean filename
      const cleanChildName = childName.replace(/[^a-zA-Z0-9]/g, '');
      const fileName = `videos/santa-video-${cleanChildName}-${videoId}.mp4`;
      
      // Read the video file
      const fileContent = fs.readFileSync(localFilePath);
      
      // Upload parameters
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileContent,
        ContentType: 'video/mp4',
        ContentDisposition: `attachment; filename="SantaVideo-${cleanChildName}.mp4"`,
        // Make the file publicly accessible
        ACL: 'public-read',
        // Add metadata
        Metadata: {
          'child-name': childName,
          'video-id': videoId,
          'upload-date': new Date().toISOString(),
          'file-type': 'santa-video'
        }
      };

      // Upload to S3
      const uploadResult = await this.s3.upload(uploadParams).promise();
      
      // Clean up local file after successful upload
      try {
        fs.unlinkSync(localFilePath);
        console.log(`✅ Local file cleaned up: ${localFilePath}`);
      } catch (cleanupError) {
        console.warn(`⚠️ Could not clean up local file: ${cleanupError.message}`);
      }

      console.log(`✅ Video uploaded to cloud: ${uploadResult.Location}`);
      return uploadResult.Location;

    } catch (error) {
      console.error('❌ Cloud upload error:', error);
      
      // If cloud upload fails, return local fallback
      if (fs.existsSync(localFilePath)) {
        const fallbackUrl = `/uploads/videos/${path.basename(localFilePath)}`;
        console.log(`⚠️ Using local fallback URL: ${fallbackUrl}`);
        return fallbackUrl;
      }
      
      throw error;
    }
  }

  /**
   * Upload video using Cloudinary as alternative
   * @param {string} localFilePath 
   * @param {string} videoId 
   * @param {string} childName 
   * @returns {Promise<string>}
   */
  async uploadVideoCloudinary(localFilePath, videoId, childName) {
    try {
      const cloudinary = require('cloudinary').v2;
      
      // Configure Cloudinary
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const cleanChildName = childName.replace(/[^a-zA-Z0-9]/g, '');
      const publicId = `santa-videos/video-${cleanChildName}-${videoId}`;

      const uploadResult = await cloudinary.uploader.upload(localFilePath, {
        resource_type: 'video',
        public_id: publicId,
        folder: 'santa-videos',
        use_filename: true,
        unique_filename: false,
        overwrite: true
      });

      // Clean up local file
      try {
        fs.unlinkSync(localFilePath);
        console.log(`✅ Local file cleaned up: ${localFilePath}`);
      } catch (cleanupError) {
        console.warn(`⚠️ Could not clean up local file: ${cleanupError.message}`);
      }

      console.log(`✅ Video uploaded to Cloudinary: ${uploadResult.secure_url}`);
      return uploadResult.secure_url;

    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      throw error;
    }
  }

  /**
   * Get appropriate upload method based on configuration
   */
  async uploadVideoToCloud(localFilePath, videoId, childName) {
    const cloudProvider = process.env.CLOUD_STORAGE_PROVIDER || 'local';
    
    switch (cloudProvider.toLowerCase()) {
      case 's3':
      case 'aws':
        if (!this.bucketName) {
          throw new Error('AWS S3 bucket name not configured');
        }
        return await this.uploadVideo(localFilePath, videoId, childName);
      
      case 'cloudinary':
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
          throw new Error('Cloudinary configuration not found');
        }
        return await this.uploadVideoCloudinary(localFilePath, videoId, childName);
      
      case 'local':
      default:
        // Keep file local and return local URL
        const localUrl = `/uploads/videos/${path.basename(localFilePath)}`;
        console.log(`📁 Using local storage: ${localUrl}`);
        return localUrl;
    }
  }

  /**
   * Generate a presigned URL for temporary access (S3 only)
   */
  async generatePresignedUrl(fileKey, expiresInSeconds = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        Expires: expiresInSeconds
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      console.error('❌ Error generating presigned URL:', error);
      throw error;
    }
  }

  /**
   * Delete video from cloud storage
   */
  async deleteVideo(fileKey) {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: fileKey
      };

      await this.s3.deleteObject(deleteParams).promise();
      console.log(`✅ Video deleted from cloud: ${fileKey}`);
    } catch (error) {
      console.error('❌ Error deleting video:', error);
      throw error;
    }
  }
}

module.exports = new CloudStorageService();
