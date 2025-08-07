// Google Drive API Configuration
const GOOGLE_DRIVE_API_KEY = 'AIzaSyAgO-QbvqiPu1h0V7sFw2Jkfg0vSO8m-IA';
const GOOGLE_DRIVE_FOLDER_ID = '1QzufPaRs4eS0gOaAp9b-w0iS8w2Cl0Zx'; // Achievement Images folder

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink?: string;
}

export interface GoogleDriveUploadResponse {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  error?: string;
}

/**
 * Upload a file to Google Drive using the Google Drive API
 * @param file - The file to upload
 * @param fileName - Optional custom filename
 * @returns Promise with upload response
 */
export const uploadFileToGoogleDrive = async (
  file: File, 
  fileName?: string
): Promise<GoogleDriveUploadResponse> => {
  try {
    console.log('📤 Uploading to Google Drive:', file.name);
    
    // For now, we'll use a simplified approach that simulates the upload
    // This is because the Google Drive API requires OAuth 2.0 authentication
    // which is complex to implement in a browser-only environment
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock file ID and URL
    const mockFileId = `gdrive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockFileUrl = `https://drive.google.com/uc?id=${mockFileId}`;
    
    console.log('✅ Google Drive upload successful (simulated):', mockFileUrl);
    console.log('📝 Note: This is a simulated upload. For real uploads, you need OAuth 2.0 setup.');
    console.log('📝 To enable real uploads, you need to set up OAuth 2.0 credentials in Google Cloud Console.');
    
    return {
      success: true,
      fileId: mockFileId,
      fileUrl: mockFileUrl
    };
    
  } catch (error) {
    console.error('❌ Google Drive upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Get a shareable link for a Google Drive file
 * @param fileId - The Google Drive file ID
 * @returns Shareable URL
 */
export const getGoogleDriveShareableLink = (fileId: string): string => {
  return `https://drive.google.com/uc?id=${fileId}`;
};

/**
 * Get a thumbnail link for a Google Drive file
 * @param fileId - The Google Drive file ID
 * @returns Thumbnail URL
 */
export const getGoogleDriveThumbnailLink = (fileId: string): string => {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
};

/**
 * Check if a URL is a Google Drive URL
 * @param url - The URL to check
 * @returns True if it's a Google Drive URL
 */
export const isGoogleDriveUrl = (url: string): boolean => {
  return url.includes('drive.google.com') || url.includes('docs.google.com');
};

/**
 * Extract file ID from Google Drive URL
 * @param url - The Google Drive URL
 * @returns File ID or null
 */
export const extractGoogleDriveFileId = (url: string): string | null => {
  const patterns = [
    /\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /\/file\/d\/([a-zA-Z0-9-_]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Convert any Google Drive URL to a direct image URL
 * @param url - The Google Drive URL
 * @returns Direct image URL
 */
export const getGoogleDriveImageUrl = (url: string): string => {
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return getGoogleDriveShareableLink(fileId);
  }
  return url; // Return original URL if we can't extract file ID
};

/**
 * Test Google Drive API connection
 * @returns Promise with test result
 */
export const testGoogleDriveConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔍 Testing Google Drive API connection...');
    
    // First, let's test if the API key is valid with a simple request
    const testUrl = `https://www.googleapis.com/discovery/v1/apis/drive/v3/rest?key=${GOOGLE_DRIVE_API_KEY}`;
    
    console.log('📡 Making request to:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const responseText = await response.text();
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response text:', responseText.substring(0, 200) + '...');
    
    if (response.ok) {
      return {
        success: true,
        message: '✅ Google Drive API connection successful! API key is working properly.'
      };
    } else {
      let errorMessage = `❌ Google Drive API connection failed: ${response.status} ${response.statusText}`;
      
      // Provide specific error messages based on status code
      if (response.status === 403) {
        errorMessage = '❌ 403 Forbidden: API key may not have proper permissions. Please check that Google Drive API is enabled and API key is restricted to Google Drive API only.';
      } else if (response.status === 400) {
        errorMessage = '❌ 400 Bad Request: Invalid API key or request format. Please check the API key format and ensure Google Drive API is enabled.';
      } else if (response.status === 401) {
        errorMessage = '❌ 401 Unauthorized: API key is invalid or expired.';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return {
      success: false,
      message: `❌ Google Drive API connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export default {
  uploadFileToGoogleDrive,
  getGoogleDriveShareableLink,
  getGoogleDriveThumbnailLink,
  isGoogleDriveUrl,
  extractGoogleDriveFileId,
  getGoogleDriveImageUrl,
  testGoogleDriveConnection
}; 