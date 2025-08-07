# Google Drive API 403 Error - Troubleshooting Guide

## 🔍 **Step-by-Step Fix for 403 Error**

### **Step 1: Enable Google Drive API**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **"APIs & Services"** → **"Library"**
4. Search for **"Google Drive API"**
5. Click on **"Google Drive API"**
6. Click **"Enable"** button
7. Wait for it to show **"API enabled"**

### **Step 2: Check API Key Restrictions**

1. Go to **"APIs & Services"** → **"Credentials"**
2. Find your API key: `AIzaSyCVgOV055ZyAmnD4zDXLPGIkBjc60QzQMI`
3. **Click on the API key** to edit it
4. Under **"API restrictions"**, make sure it shows:
   - ✅ **"Restrict key"** is selected
   - ✅ **"Google Drive API"** is in the list
5. If not, select **"Restrict key"** and add **"Google Drive API"**
6. Click **"Save"**

### **Step 3: Enable Billing (If Required)**

1. Go to **"Billing"** in the left menu
2. Make sure billing is enabled for your project
3. Some APIs require billing to be enabled

### **Step 4: Check Project Permissions**

1. Go to **"IAM & Admin"** → **"IAM"**
2. Make sure your account has proper permissions
3. You should have at least **"Editor"** role

### **Step 5: Alternative - Create New API Key**

If the above doesn't work, create a new API key:

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the new API key
4. **Immediately** click on the new API key to edit it
5. Set restrictions:
   - **API restrictions**: Select "Restrict key"
   - **Select APIs**: Choose "Google Drive API"
6. Click **"Save"**
7. Update the code with the new API key

### **Step 6: Test the Fix**

1. Go to your app: `http://localhost:3000/gdrive-test`
2. Click **"Test Connection"**
3. Check the console for detailed logs

## 🔧 **Quick Alternative: Use Firebase Storage**

If Google Drive continues to have issues, we can use Firebase Storage instead:

### **Benefits of Firebase Storage:**
- ✅ Already configured with your Firebase project
- ✅ No API key restrictions
- ✅ Works immediately
- ✅ Secure and reliable

### **To Switch to Firebase Storage:**

1. The Firebase Storage integration is already implemented
2. Just change the storage type to "Firebase Storage" in the upload component
3. No additional setup required

## 📋 **Checklist**

- [ ] Google Drive API is enabled
- [ ] API key has "Google Drive API" restriction
- [ ] Billing is enabled (if required)
- [ ] Project permissions are correct
- [ ] Test connection works

## 🆘 **If Still Not Working**

1. **Try Firebase Storage** - It's already set up and will work immediately
2. **Check console logs** - Look for detailed error messages
3. **Verify project ID** - Make sure you're in the right Google Cloud project
4. **Wait a few minutes** - API changes can take time to propagate

## 🚀 **Recommended Solution**

Since you already have Firebase set up, I recommend using **Firebase Storage** instead:

1. It's already configured
2. No API key issues
3. Works with your existing authentication
4. More reliable for your use case

Would you like me to help you switch to Firebase Storage, or do you want to continue troubleshooting Google Drive? 