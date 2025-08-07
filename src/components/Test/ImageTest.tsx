import React from 'react';

const ImageTest: React.FC = () => {
  const testImages = [
    "https://i.ibb.co/9vK8MpL/coding-competition.jpg",
    "https://i.ibb.co/0jK8MpL/project-award.jpg",
    "https://i.ibb.co/1jK8MpL/sports-champion.jpg",
    "https://i.ibb.co/VqKJ8Mp/cultural-event.jpg"
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Image Test Component</h1>
      <p className="text-gray-600">Testing ImgBB image display</p>
      
      <div className="grid grid-cols-2 gap-4">
        {testImages.map((url, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Test Image {index + 1}</h3>
            <img 
              src={url} 
              alt={`Test ${index + 1}`}
              className="w-full h-32 object-cover rounded"
              onLoad={() => console.log(`✅ Image ${index + 1} loaded successfully:`, url)}
              onError={(e) => {
                console.error(`❌ Image ${index + 1} failed to load:`, url);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <p className="text-xs text-gray-500 mt-2 break-all">{url}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageTest; 