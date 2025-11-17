import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export const uploadVideoToCloudinary = async (filePath, playlistName, videoTitle, isDemo = false, maxRetries = 3) => {
  try {
    console.log('☁️ Cloudinary upload function called with:');
    console.log('- filePath:', filePath);
    console.log('- playlistName:', playlistName);
    console.log('- videoTitle:', videoTitle);
    console.log('- isDemo:', isDemo);
    console.log('- maxRetries:', maxRetries);

    // Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileStats = fs.statSync(filePath);
    const fileSizeInMB = fileStats.size / (1024 * 1024);
    console.log('- File size:', fileSizeInMB.toFixed(2), 'MB');

    // Create folder path: playlist_name/demo or playlist_name/videos
    const folderPath = isDemo 
      ? `${playlistName}/demo` 
      : `${playlistName}/videos`;

    // Create public_id from video title
    const publicId = `${folderPath}/${videoTitle.replace(/\s+/g, '_').toLowerCase()}`;

    console.log('- folderPath:', folderPath);
    console.log('- publicId:', publicId);

    // Upload from file path using appropriate method based on size
    console.log('☁️ Starting Cloudinary upload from file path...');

    const uploadOptions = {
      resource_type: 'video',
      folder: folderPath,
      public_id: publicId,
      timeout: 1800000, // 30 minutes timeout for large files
      chunk_size: 20000000, // 20MB chunks for better reliability
      eager_async: true, // Process transformations asynchronously
      eager_notification_url: process.env.WEBHOOK_URL // Optional: for async processing notifications
    };

    // For smaller videos we can safely apply automatic quality/format
    if (fileStats.size <= 40 * 1024 * 1024) {
      uploadOptions.quality = 'auto';
      uploadOptions.fetch_format = 'auto';
    }

    let result;
    let lastError;
    
    // Retry logic for failed uploads
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`☁️ Upload attempt ${attempt}/${maxRetries}...`);
        
        if (fileStats.size > 40 * 1024 * 1024) {
          console.log('☁️ Using upload_stream for big video file (chunked upload)...');
          // For large files, use upload_stream with readable stream
          result = await new Promise((resolve, reject) => {
            try {
              const readStream = fs.createReadStream(filePath);
              
              // Create upload stream with callback
              const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, uploadResult) => {
                if (error) {
                  console.error('☁️ Upload stream callback error:', error.message);
                  console.error('☁️ Full error:', error);
                  reject(error);
                } else {
                  console.log('☁️ Upload stream callback success');
                  console.log('☁️ Result received:', JSON.stringify(uploadResult, null, 2));
                  resolve(uploadResult);
                }
              });
              
              // Handle stream errors
              uploadStream.on('error', (error) => {
                console.error('☁️ Upload stream error event:', error.message);
                reject(error);
              });
              
              readStream.on('error', (error) => {
                console.error('☁️ Read stream error event:', error.message);
                reject(error);
              });
              
              // Pipe file to upload stream
              console.log('☁️ Piping file to upload stream...');
              readStream.pipe(uploadStream);
            } catch (error) {
              console.error('☁️ Error creating streams:', error.message);
              reject(error);
            }
          });
        } else {
          console.log('☁️ Using standard upload for smaller video file...');
          result = await cloudinary.uploader.upload(filePath, uploadOptions);
        }
        
        // Success - break out of retry loop
        break;
      } catch (error) {
        lastError = error;
        console.error(`❌ Upload attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delayMs = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏳ Waiting ${delayMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    // If all retries failed, throw the last error
    if (!result) {
      throw lastError || new Error('Upload failed after all retry attempts');
    }

    // Log full result for debugging
    console.log('☁️ Cloudinary upload raw result:', JSON.stringify(result, null, 2));

    const url = result?.secure_url || result?.url;
    const publicIdFromResult = result?.public_id;

    if (!url || !publicIdFromResult) {
      console.error('☁️ Cloudinary upload missing URL or public_id.');
      throw new Error('Cloudinary upload did not return a valid URL/public_id');
    }

    console.log('☁️ Cloudinary upload successful:');
    console.log('- URL:', url);
    console.log('- Public ID:', publicIdFromResult);
    console.log('- Duration:', result.duration);

    return {
      success: true,
      url,
      public_id: publicIdFromResult,
      duration: result.duration || 0
    };
  } catch (error) {
    console.error('☁️ Cloudinary upload error:');
    console.error('- Error message:', error.message);
    console.error('- Error code:', error.code);
    console.error('- Error http_code:', error.http_code);
    console.error('- Full error:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete video from Cloudinary
 * @param {string} publicId - Public ID of the video
 * @returns {Promise<Object>} - Delete result
 */
export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video'
    });

    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get video details from Cloudinary
 * @param {string} publicId - Public ID of the video
 * @returns {Promise<Object>} - Video details
 */
export const getVideoDetails = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'video'
    });

    return {
      success: true,
      details: {
        url: result.secure_url,
        duration: result.duration,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height,
        created_at: result.created_at
      }
    };
  } catch (error) {
    console.error('Cloudinary get details error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate Cloudinary video URL with transformations
 * @param {string} publicId - Public ID of the video
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed URL
 */
export const generateCloudinaryUrl = (publicId, options = {}) => {
  try {
    const url = cloudinary.url(publicId, {
      resource_type: 'video',
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    });

    return url;
  } catch (error) {
    console.error('Cloudinary URL generation error:', error);
    return null;
  }
};

/**
 * List all videos in a playlist folder
 * @param {string} playlistName - Playlist name
 * @returns {Promise<Array>} - List of videos
 */
export const listPlaylistVideos = async (playlistName) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: `${playlistName}/videos`,
      resource_type: 'video',
      max_results: 500
    });

    return {
      success: true,
      videos: result.resources || []
    };
  } catch (error) {
    console.error('Cloudinary list videos error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get demo video for a playlist
 * @param {string} playlistName - Playlist name
 * @returns {Promise<Object>} - Demo video details
 */
export const getDemoVideo = async (playlistName) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: `${playlistName}/demo`,
      resource_type: 'video',
      max_results: 1
    });

    if (result.resources && result.resources.length > 0) {
      const demoVideo = result.resources[0];
      return {
        success: true,
        demo: {
          url: demoVideo.secure_url,
          public_id: demoVideo.public_id,
          duration: demoVideo.duration,
          size: demoVideo.bytes
        }
      };
    }

    return {
      success: false,
      error: 'No demo video found'
    };
  } catch (error) {
    console.error('Cloudinary get demo error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  uploadVideoToCloudinary,
  deleteVideoFromCloudinary,
  getVideoDetails,
  generateCloudinaryUrl,
  listPlaylistVideos,
  getDemoVideo
};
