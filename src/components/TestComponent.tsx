import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tailwind CSS Test</h2>
            <p className="text-gray-600">If you can see this styled content, Tailwind is working!</p>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="bg-blue-500 text-white p-4 rounded-lg">
              <p className="font-semibold">Blue Card</p>
              <p className="text-sm opacity-90">This should have a blue background</p>
            </div>
            
            <div className="bg-green-500 text-white p-4 rounded-lg">
              <p className="font-semibold">Green Card</p>
              <p className="text-sm opacity-90">This should have a green background</p>
            </div>
            
            <div className="bg-red-500 text-white p-4 rounded-lg">
              <p className="font-semibold">Red Card</p>
              <p className="text-sm opacity-90">This should have a red background</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Test Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestComponent; 