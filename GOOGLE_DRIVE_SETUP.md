# Google Drive Integration Setup Guide

This guide will help you set up Google Drive as the storage solution for student achievement images.

## Prerequisites

1. **Google Account**: You need a Google account with access to Google Drive
2. **Google Cloud Console Access**: To create API credentials
3. **Node.js**: For development environment

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on it and press "Enable"

## Step 2: Create Credentials

### Option A: API Key (Simpler)
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. **IMPORTANT**: Click on the API key to edit it
5. Under "API restrictions", select "Restrict key"
6. Select "Google Drive API" from the dropdown
7. Click "Save"

### Option B: OAuth 2.0 (More Secure - Recommended)
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - Your production callback URL
6. Download the client configuration

## Step 3: Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder for achievement images
3. Right-click the folder > "Share" > "Copy link"
4. Extract the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID`
   - Copy the FOLDER_ID part

## Step 4: Configure Environment Variables

Create a `.env` file in your project root:

```env
# Google Drive Configuration
REACT_APP_GOOGLE_DRIVE_API_KEY=your_api_key_here
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
REACT_APP_GOOGLE_DRIVE_CLIENT_ID=your_client_id_here
REACT_APP_GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret_here
```

## Step 5: Update Configuration

Update the `googleDriveUpload.ts` file with your actual credentials:

```typescript
// Replace these with your actual values
const GOOGLE_DRIVE_API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY || 'YOUR_API_KEY';
const GOOGLE_DRIVE_FOLDER_ID = process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID || 'YOUR_FOLDER_ID';
```

## Step 6: Install Google Drive API Client

```bash
npm install googleapis
```

## Step 7: Implement Real Google Drive Upload

Replace the mock implementation in `googleDriveUpload.ts` with real API calls:

```typescript
import { google } from 'googleapis';

const drive = google.drive('v3');

export const uploadFileToGoogleDrive = async (
  file: File, 
  fileName?: string
): Promise<GoogleDriveUploadResponse> => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'path/to/your/credentials.json', // For service account
      // OR use API key for simpler setup
      apiKey: GOOGLE_DRIVE_API_KEY,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    const response = await drive.files.create({
      auth,
      requestBody: {
        name: fileName || file.name,
        parents: [GOOGLE_DRIVE_FOLDER_ID],
        mimeType: file.type
      },
      media: {
        mimeType: file.type,
        body: file.stream()
      }
    });

    const fileId = response.data.id;
    const fileUrl = `https://drive.google.com/uc?id=${fileId}`;

    return {
      success: true,
      fileId,
      fileUrl
    };

  } catch (error) {
    console.error('Google Drive upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};
```

## Step 8: Test the Integration

1. Start your development server
2. Go to the student achievement upload page
3. Select "Google Drive" as the storage option
4. Upload an image
5. Verify the image appears in your Google Drive folder
6. Check that the image displays correctly in HOD/Principal panels

## Security Considerations

1. **API Key Restrictions**: Always restrict your API key to specific APIs and domains
2. **CORS**: Configure CORS properly for your domain
3. **File Permissions**: Set appropriate sharing permissions for uploaded files
4. **Rate Limiting**: Implement rate limiting to prevent abuse

## Troubleshooting

### Common Issues:

1. **CORS Error**: 
   - Add your domain to authorized origins in Google Cloud Console
   - Check that your API key is properly configured

2. **Authentication Error**:
   - Verify your API key is correct
   - Check that Google Drive API is enabled
   - Ensure proper scopes are configured

3. **Upload Fails**:
   - Check file size limits (Google Drive has 5TB limit per file)
   - Verify file type is supported
   - Check network connectivity

4. **Images Not Displaying**:
   - Verify file sharing permissions
   - Check that the file ID is correctly extracted
   - Test the direct URL in browser

### Debug Steps:

1. Check browser console for errors
2. Verify API responses in Network tab
3. Test Google Drive URLs directly
4. Check file permissions in Google Drive

## Production Deployment

1. **Environment Variables**: Set production environment variables
2. **Domain Configuration**: Update authorized origins for production domain
3. **SSL**: Ensure HTTPS is enabled
4. **Monitoring**: Set up error monitoring and logging
5. **Backup**: Implement backup strategy for uploaded files

## Alternative: Firebase Storage

If Google Drive setup is complex, consider using Firebase Storage instead:

```typescript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadToFirebaseStorage = async (file: File): Promise<string> => {
  const storage = getStorage();
  const storageRef = ref(storage, `achievements/${Date.now()}_${file.name}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};
```

This would integrate seamlessly with your existing Firebase setup.

## Support

For additional help:
1. Check Google Drive API documentation
2. Review Google Cloud Console error logs
3. Test with Google Drive API Explorer
4. Consider using Firebase Storage as an alternative 