// ImgBB API Configuration
const IMGBB_API_KEY = '18931809d69f5537b78130d42655f3c1'; // ImgBB API key
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url: string;
    display_url: string;
    size: number;
    delete_url: string;
    time: string;
    expiration: number;
  };
  success: boolean;
  status: number;
}

/**
 * Upload image to ImgBB
 * @param file - The image file to upload
 * @returns Promise with the image URL
 */
export const uploadImageToImgBB = async (file: File): Promise<string> => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    // Upload to ImgBB
    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result: ImgBBResponse = await response.json();

    if (!result.success) {
      throw new Error('ImgBB upload failed');
    }

    console.log('✅ Image uploaded to ImgBB:', result.data.display_url);
    return result.data.display_url;
  } catch (error) {
    console.error('❌ Error uploading to ImgBB:', error);
    throw error;
  }
};

/**
 * Convert base64 image to file and upload to ImgBB
 * @param base64String - Base64 encoded image string
 * @param filename - Name for the file
 * @returns Promise with the image URL
 */
export const uploadBase64ToImgBB = async (base64String: string, filename: string = 'image.jpg'): Promise<string> => {
  try {
    // Convert base64 to file
    const byteCharacters = atob(base64String.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const file = new File([byteArray], filename, { type: 'image/jpeg' });

    // Upload to ImgBB
    return await uploadImageToImgBB(file);
  } catch (error) {
    console.error('❌ Error converting base64 to ImgBB:', error);
    throw error;
  }
};

/**
 * Validate if a URL is from ImgBB
 * @param url - URL to validate
 * @returns boolean indicating if it's an ImgBB URL
 */
export const isImgBBUrl = (url: string): boolean => {
  return url.includes('i.ibb.co') || url.includes('imgbb.com');
};

/**
 * Get ImgBB thumbnail URL (smaller version for previews)
 * @param url - Original ImgBB URL
 * @returns Thumbnail URL
 */
export const getImgBBThumbnail = (url: string): string => {
  if (!isImgBBUrl(url)) return url;
  
  // ImgBB thumbnail format: add -thumb suffix
  const baseUrl = url.replace(/\.[^/.]+$/, '');
  return `${baseUrl}-thumb.jpg`;
};

/**
 * Get ImgBB medium URL (medium size for better performance)
 * @param url - Original ImgBB URL
 * @returns Medium size URL
 */
export const getImgBBMedium = (url: string): string => {
  if (!isImgBBUrl(url)) return url;
  
  // ImgBB medium format: add -medium suffix
  const baseUrl = url.replace(/\.[^/.]+$/, '');
  return `${baseUrl}-medium.jpg`;
};

export default {
  uploadImageToImgBB,
  uploadBase64ToImgBB,
  isImgBBUrl,
  getImgBBThumbnail,
  getImgBBMedium
}; 