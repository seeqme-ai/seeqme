import { uploadService } from './apiService';
import { compressImage } from '@/utils/image';

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  originalFilename: string;
}

export const cloudinaryService = {
  /**
   * Upload a file to Cloudinary with optional compression for images
   */
  uploadFile: async (file: File): Promise<UploadResult> => {
    try {
      let fileToUpload = file;

      // Compress if it's an image
      if (file.type.startsWith('image/')) {
        try {
          fileToUpload = await compressImage(file);
        } catch (err) {
          console.warn('Compression failed, uploading original:', err);
        }
      }

      // Check file size (max 10MB after compression)
      if (fileToUpload.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload images, PDFs, or text files.');
      }

      const response = await uploadService.uploadFile(fileToUpload);
     
      const url = response.secure_url || response.url || response.SecureURL || response.URL;
      const publicId = response.public_id || response.PublicID;

      if (!url) {
        console.error('[cloudinaryService] Upload response missing URL fields:', response);
      }

      return {
        publicId: publicId,
        url: url,
        secureUrl: url,
        originalFilename: file.name
      };
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to upload file';
      throw new Error(errorMessage);
    }
  },

  /**
   * Delete a file from Cloudinary 
   */
  deleteFile: async (publicId: string): Promise<void> => {
    try {
      if (!publicId) return;
      await uploadService.deleteFile(publicId);
    } catch (error: any) {
      console.error('Cloudinary delete error:', error);
      // We don't necessarily want to crash the UI if deletion fails, but log it
    }
  },

  /**
   * Extract text content from uploaded file for AI processing
   */
  extractContentFromFile: async (file: File): Promise<string> => {
    try {
      // For text files, read directly
      if (file.type === 'text/plain') {
        return await file.text();
      }

      // For images, we'll need to use OCR (to be implemented)
      if (file.type.startsWith('image/')) {
        throw new Error('Image OCR not yet implemented. Please provide text content directly.');
      }

      // For PDFs, we'll need to extract text (to be implemented)
      if (file.type === 'application/pdf') {
        throw new Error('PDF text extraction not yet implemented. Please copy and paste the content.');
      }

      throw new Error('Unsupported file type for content extraction');
    } catch (error: any) {
      console.error('Content extraction error:', error);
      throw error;
    }
  },

  /**
   * Upload CV and extract content for AI generation
   */
  uploadCV: async (file: File): Promise<{ uploadResult: UploadResult; content: string }> => {
    try {
      const uploadResult = await cloudinaryService.uploadFile(file);
      const content = await cloudinaryService.extractContentFromFile(file);
      return { uploadResult, content };
    } catch (error: any) {
      console.error('CV upload error:', error);
      throw error;
    }
  }
};

export default cloudinaryService;