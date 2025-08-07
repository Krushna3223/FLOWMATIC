import React, { useState } from 'react';
import { uploadFileToGoogleDrive, testGoogleDriveConnection } from '../utils/googleDriveUpload';

const TestGoogleDrive: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult('');
    }
  };

  const testConnection = async () => {
    setConnectionStatus('Testing connection...');
    const result = await testGoogleDriveConnection();
    setConnectionStatus(result.message);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadResult('❌ Please select a file first');
      return;
    }

    setUploading(true);
    setUploadResult('');

    try {
      const result = await uploadFileToGoogleDrive(selectedFile);
      
      if (result.success) {
        setUploadResult(`✅ Upload successful!\nFile ID: ${result.fileId}\nURL: ${result.fileUrl}`);
      } else {
        setUploadResult(`❌ Upload failed: ${result.error}`);
      }
    } catch (error) {
      setUploadResult(`❌ Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Google Drive Upload Test</h2>
      
      {/* Connection Test */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">Connection Test</h3>
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Test Google Drive Connection
        </button>
        {connectionStatus && (
          <div className="mt-2 p-2 bg-white rounded border">
            <pre className="text-sm whitespace-pre-wrap">{connectionStatus}</pre>
          </div>
        )}
      </div>

      {/* File Upload Test */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-green-800">Upload Test</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image File:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {selectedFile && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>Selected file:</strong> {selectedFile.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
            <p className="text-sm text-gray-600">
              <strong>Type:</strong> {selectedFile.type}
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`px-4 py-2 rounded transition-colors ${
            !selectedFile || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload to Google Drive'}
        </button>

        {uploadResult && (
          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <pre className="text-sm whitespace-pre-wrap">{uploadResult}</pre>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">Instructions</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• First test the connection to ensure API key is working</li>
          <li>• Select an image file (JPG, PNG, etc.)</li>
          <li>• Click upload to test the Google Drive integration</li>
          <li>• Check your Google Drive folder to see uploaded files</li>
        </ul>
      </div>
    </div>
  );
};

export default TestGoogleDrive; 