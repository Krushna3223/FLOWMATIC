import React, { useState } from 'react';
import { Upload, Image as ImageIcon, HardDrive, CheckCircle, X, Wifi, Database } from 'lucide-react';
import { uploadFileToGoogleDrive, isGoogleDriveUrl, getGoogleDriveImageUrl, testGoogleDriveConnection } from '../../utils/googleDriveUpload';
import { uploadFileToFirebaseStorage, isFirebaseStorageUrl, getFirebaseStorageThumbnailUrl } from '../../utils/firebaseStorageUpload';
import { uploadImageToImgBB } from '../../utils/imgbbUpload';
import { toast } from 'react-hot-toast';

const GoogleDriveTest: React.FC = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState<'firebase' | 'imgbb' | 'gdrive'>('firebase');
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await testGoogleDriveConnection();
      setConnectionStatus(result);
      if (result.success) {
        toast.success('Google Drive API connection successful!');
      } else {
        toast.error('Google Drive API connection failed');
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Connection test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      toast.error('Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let imageUrl: string;

      if (selectedStorage === 'firebase') {
        const result = await uploadFileToFirebaseStorage(file, 'achievements');
        if (result.success && result.fileUrl) {
          imageUrl = result.fileUrl;
          toast.success('Image uploaded to Firebase Storage successfully!');
        } else {
          throw new Error(result.error || 'Firebase Storage upload failed');
        }
      } else if (selectedStorage === 'gdrive') {
        const result = await uploadFileToGoogleDrive(file);
        if (result.success && result.fileUrl) {
          imageUrl = result.fileUrl;
          toast.success('Image uploaded to Google Drive successfully!');
        } else {
          throw new Error(result.error || 'Google Drive upload failed');
        }
      } else {
        imageUrl = await uploadImageToImgBB(file);
        toast.success('Image uploaded to ImgBB successfully!');
      }

      setUploadedImageUrl(imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const testGoogleDriveUrl = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing';
  const testImgBBUrl = 'https://i.ibb.co/9vK8MpL/coding-competition.jpg';
  const testFirebaseUrl = 'https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/achievements%2Ftest.jpg?alt=media';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Image Upload Integration Test</h2>
        
        {/* Storage Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Select Storage Type</h3>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="storageType"
                value="firebase"
                checked={selectedStorage === 'firebase'}
                onChange={() => setSelectedStorage('firebase')}
                className="text-blue-600"
              />
              <Database className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Firebase Storage (Recommended)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="storageType"
                value="gdrive"
                checked={selectedStorage === 'gdrive'}
                onChange={() => setSelectedStorage('gdrive')}
                className="text-blue-600"
              />
              <HardDrive className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Google Drive</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="storageType"
                value="imgbb"
                checked={selectedStorage === 'imgbb'}
                onChange={() => setSelectedStorage('imgbb')}
                className="text-blue-600"
              />
              <ImageIcon className="h-5 w-5 text-green-500" />
              <span className="font-medium">ImgBB</span>
            </label>
          </div>
        </div>

        {/* Connection Test */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Google Drive API Connection Test</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={testConnection}
              disabled={isTestingConnection}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Wifi className="h-4 w-4" />
              <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
            </button>
            {connectionStatus && (
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                connectionStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {connectionStatus.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <span className="text-sm">{connectionStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Upload Test Image</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {isUploading && (
            <div className="mt-2 flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Uploading...
            </div>
          )}
        </div>

        {/* Uploaded Image Display */}
        {uploadedImageUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Uploaded Image</h3>
            <div className="relative">
              <img
                src={uploadedImageUrl}
                alt="Uploaded"
                className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300"
                onLoad={() => console.log('✅ Test image loaded successfully')}
                onError={() => console.log('❌ Test image failed to load')}
              />
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs break-all">
                <strong>URL:</strong> {uploadedImageUrl}
              </div>
            </div>
          </div>
        )}

        {/* URL Detection Tests */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">URL Detection Tests</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Firebase Storage URL Test</h4>
              <p className="text-sm text-gray-600 mb-2">{testFirebaseUrl}</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Is Firebase Storage URL:</span>
                {isFirebaseStorageUrl(testFirebaseUrl) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Google Drive URL Test</h4>
              <p className="text-sm text-gray-600 mb-2">{testGoogleDriveUrl}</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Is Google Drive URL:</span>
                {isGoogleDriveUrl(testGoogleDriveUrl) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="mt-2">
                <img
                  src={getGoogleDriveImageUrl(testGoogleDriveUrl)}
                  alt="Google Drive Test"
                  className="w-32 h-24 object-cover rounded border"
                  onError={() => console.log('❌ Google Drive test image failed')}
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">ImgBB URL Test</h4>
              <p className="text-sm text-gray-600 mb-2">{testImgBBUrl}</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Is Google Drive URL:</span>
                {isGoogleDriveUrl(testImgBBUrl) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="mt-2">
                <img
                  src={testImgBBUrl}
                  alt="ImgBB Test"
                  className="w-32 h-24 object-cover rounded border"
                  onError={() => console.log('❌ ImgBB test image failed')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li><strong>Firebase Storage (Recommended):</strong> Already configured and working</li>
            <li><strong>Google Drive:</strong> Requires OAuth 2.0 setup (complex)</li>
            <li><strong>ImgBB:</strong> Requires API key setup</li>
            <li>Test with a real image upload using Firebase Storage</li>
            <li>Verify images display correctly in HOD/Principal panels</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveTest; 