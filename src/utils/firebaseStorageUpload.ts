import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export interface FirebaseStorageUploadResponse {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

/**
 * Upload a file to Firebase Storage
 * @param file - The file to upload
 * @param folder - The folder path in storage (e.g., 'achievements', 'certificates')
 * @param fileName - Optional custom filename
 * @returns Promise with upload response
 */
export const uploadFileToFirebaseStorage = async (
  file: File,
  folder: string = 'achievements',
  fileName?: string
): Promise<FirebaseStorageUploadResponse> => {
  try {
    console.log('📤 Uploading to Firebase Storage:', file.name);
    
    // Generate a unique filename
    const timestamp = Date.now();
    const uniqueFileName = fileName || `${timestamp}_${file.name}`;
    const storagePath = `${folder}/${uniqueFileName}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, storagePath);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('✅ File uploaded successfully:', snapshot.metadata.name);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ Download URL generated:', downloadURL);
    
    return {
      success: true,
      fileUrl: downloadURL
    };
    
  } catch (error) {
    console.error('❌ Firebase Storage upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Check if a URL is a Firebase Storage URL
 * @param url - The URL to check
 * @returns True if it's a Firebase Storage URL
 */
export const isFirebaseStorageUrl = (url: string): boolean => {
  return url.includes('firebasestorage.googleapis.com') || url.includes('firebaseapp.com');
};

/**
 * Get a thumbnail URL for Firebase Storage images
 * @param url - The Firebase Storage URL
 * @returns Thumbnail URL
 */
export const getFirebaseStorageThumbnailUrl = (url: string): string => {
  // Firebase Storage URLs can be used directly for thumbnails
  return url;
};

export default {
  uploadFileToFirebaseStorage,
  isFirebaseStorageUrl,
  getFirebaseStorageThumbnailUrl
}; 