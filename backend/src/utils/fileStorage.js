import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Save file to local storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalFilename - Original filename
 * @returns {Object} - { filePath, filename }
 */
export const saveFileLocally = (fileBuffer, originalFilename) => {
  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(originalFilename);
    const filename = `${timestamp}_${originalFilename}`;
    const filePath = path.join(uploadsDir, filename);

    // Write file to disk
    fs.writeFileSync(filePath, fileBuffer);

    console.log('💾 File saved locally:', {
      filename,
      filePath,
      size: fileBuffer.length
    });

    return {
      success: true,
      filePath,
      filename,
      size: fileBuffer.length
    };
  } catch (error) {
    console.error('❌ Error saving file locally:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete file from local storage
 * @param {string} filePath - Full path to file
 * @returns {Object} - { success, message }
 */
export const deleteFileLocally = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️ File deleted locally:', filePath);
      return {
        success: true,
        message: 'File deleted successfully'
      };
    } else {
      console.log('⚠️ File not found for deletion:', filePath);
      return {
        success: false,
        message: 'File not found'
      };
    }
  } catch (error) {
    console.error('❌ Error deleting file locally:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get file from local storage as buffer
 * @param {string} filePath - Full path to file
 * @returns {Buffer|null} - File buffer or null
 */
export const getFileBuffer = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      console.log('📖 File read from local storage:', {
        filePath,
        size: buffer.length
      });
      return buffer;
    } else {
      console.log('⚠️ File not found:', filePath);
      return null;
    }
  } catch (error) {
    console.error('❌ Error reading file:', error);
    return null;
  }
};

/**
 * Get uploads directory path
 * @returns {string} - Uploads directory path
 */
export const getUploadsDir = () => {
  return uploadsDir;
};

/**
 * List all uploaded files
 * @returns {Array} - Array of filenames
 */
export const listUploadedFiles = () => {
  try {
    const files = fs.readdirSync(uploadsDir);
    console.log('📋 Uploaded files:', files);
    return files;
  } catch (error) {
    console.error('❌ Error listing files:', error);
    return [];
  }
};

/**
 * Clean up old files (older than specified hours)
 * @param {number} hoursOld - Delete files older than this many hours
 * @returns {Object} - { success, deletedCount, message }
 */
export const cleanupOldFiles = (hoursOld = 24) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const maxAge = hoursOld * 60 * 60 * 1000;
    let deletedCount = 0;

    files.forEach((file) => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;

      if (fileAge > maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log('🗑️ Cleaned up old file:', file);
      }
    });

    console.log(`✅ Cleanup complete: ${deletedCount} files deleted`);
    return {
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} files older than ${hoursOld} hours`
    };
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
