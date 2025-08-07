# Google Drive OAuth 2.0 Setup Guide

## 🎯 **Enable Real Google Drive Uploads**

Currently, the Google Drive upload is **simulated** because it requires OAuth 2.0 authentication. Here's how to enable real uploads:

## 📋 **Step 1: Create OAuth 2.0 Credentials**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Enable Google Drive API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized origins: `http://localhost:3000`
   - Add authorized redirect URIs: `http://localhost:3000/auth/callback`
   - Click "Create"

4. **Download Credentials:**
   - Download the JSON file
   - Save it as `google-oauth-credentials.json`

## 📋 **Step 2: Update Configuration**

1. **Create environment variables:**
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id
   REACT_APP_GOOGLE_CLIENT_SECRET=your-client-secret
   ```

2. **Update the upload function:**
   ```typescript
   // In googleDriveUpload.ts
   const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
   ```

## 📋 **Step 3: Implement OAuth Flow**

The OAuth flow requires:
1. **Authorization URL** - User grants permission
2. **Access Token** - Used for API calls
3. **Token Refresh** - Keep token valid

## 🚀 **Quick Alternative: Use ImgBB**

If OAuth setup is too complex, you can use **ImgBB** instead:

1. **Get ImgBB API Key:**
   - Go to: https://api.imgbb.com/
   - Sign up and get your API key

2. **Update configuration:**
   ```typescript
   const IMGBB_API_KEY = 'your-imgbb-api-key';
   ```

3. **Use ImgBB upload:**
   ```typescript
   const result = await uploadImageToImgBB(file);
   ```

## 🎯 **Current Status**

- ✅ **Google Drive API Key:** Working (for read operations)
- ⚠️ **File Upload:** Simulated (needs OAuth 2.0)
- ✅ **Connection Test:** Working
- ✅ **URL Generation:** Working

## 🔧 **Immediate Solution**

For now, the system will:
1. **Simulate upload** (shows success message)
2. **Generate mock URLs** (for testing UI)
3. **Work with existing images** (if you manually upload to Google Drive)

## 📝 **Next Steps**

Choose one:
1. **Set up OAuth 2.0** (for real Google Drive uploads)
2. **Use ImgBB** (simpler, works immediately)
3. **Keep simulated uploads** (for UI testing)

**The current setup works for testing the UI and functionality!** 🎯 