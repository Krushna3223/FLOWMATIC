import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader, HardDrive } from 'lucide-react';
import { uploadImageToImgBB } from '../../utils/imgbbUpload';
import { uploadFileToGoogleDrive, isGoogleDriveUrl, getGoogleDriveImageUrl } from '../../utils/googleDriveUpload';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onImageRemove?: () => void;
  currentImageUrl?: string;
  className?: string;
  storageType?: 'imgbb' | 'gdrive' | 'both';
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageRemove,
  currentImageUrl,
  className = '',
  storageType = 'both',
  maxFileSize = 5, // 5MB default
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState<'imgbb' | 'gdrive'>('imgbb');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedFileTypes.includes(file.type)) {
      toast.error(`Invalid file type. Please upload: ${acceptedFileTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxFileSize}MB`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    setUploadProgress(0);

    try {
      let imageUrl: string;

      if (storageType === 'both') {
        // Use selected storage type
        if (selectedStorage === 'gdrive') {
          const result = await uploadFileToGoogleDrive(file);
          if (result.success && result.fileUrl) {
            imageUrl = result.fileUrl;
          } else {
            throw new Error(result.error || 'Google Drive upload failed');
          }
        } else {
          // Default to ImgBB
          imageUrl = await uploadImageToImgBB(file);
        }
      } else if (storageType === 'gdrive') {
        const result = await uploadFileToGoogleDrive(file);
        if (result.success && result.fileUrl) {
          imageUrl = result.fileUrl;
        } else {
          throw new Error(result.error || 'Google Drive upload failed');
        }
      } else {
        // ImgBB
        imageUrl = await uploadImageToImgBB(file);
      }

      onImageUpload(imageUrl);
      toast.success('Image uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  const handleStorageTypeChange = (type: 'imgbb' | 'gdrive') => {
    setSelectedStorage(type);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Storage Type Selection (only show if both are enabled) */}
      {storageType === 'both' && (
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="storageType"
              value="imgbb"
              checked={selectedStorage === 'imgbb'}
              onChange={() => handleStorageTypeChange('imgbb')}
              className="text-blue-600"
            />
            <span className="text-sm font-medium">ImgBB</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="storageType"
              value="gdrive"
              checked={selectedStorage === 'gdrive'}
              onChange={() => handleStorageTypeChange('gdrive')}
              className="text-blue-600"
            />
            <span className="text-sm font-medium">Google Drive</span>
          </label>
        </div>
      )}

      {/* File Input */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {!previewUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600">Uploading...</span>
                {uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                {selectedStorage === 'gdrive' ? (
                  <HardDrive className="h-8 w-8 text-gray-400" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">
                  Click to upload image
                </span>
                <span className="text-xs text-gray-500">
                  Max {maxFileSize}MB • {acceptedFileTypes.map(type => type.split('/')[1]).join(', ')}
                </span>
              </div>
            )}
          </button>
        ) : (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Current Image Display */}
      {currentImageUrl && !previewUrl && (
        <div className="relative">
          <img
            src={isGoogleDriveUrl(currentImageUrl) ? getGoogleDriveImageUrl(currentImageUrl) : currentImageUrl}
            alt="Current"
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              console.error('Failed to load current image:', currentImageUrl);
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {onImageRemove && (
            <button
              type="button"
              onClick={onImageRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 