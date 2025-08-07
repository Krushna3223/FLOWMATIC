import React, { useState } from 'react';
import { 
  Database, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Building2,
  CheckCircle,
  AlertCircle,
  Loader,
  Play,
  Settings,
  FileText,
  Award,
  Bell,
  Wrench,
  Trophy,
  Upload,
  Image
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  initializeCompleteDatabase,
  createSampleData,
  createSampleAchievements,
  validateDatabaseStructure,
  updateInstituteStats,
  updateDepartmentStats
} from '../../utils/databaseInitializer';
import { uploadTestImages } from '../../utils/uploadTestImages';
import { clearAndRecreateAchievements } from '../../utils/clearAndRecreateAchievements';
import { fixExistingAchievements } from '../../utils/fixExistingAchievements';
import { updateAchievementsWithRealImages } from '../../utils/uploadRealImages';
import { fixAchievementPhotos } from '../../utils/fixAchievementPhotos';

const DatabaseSetup: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCreatingSample, setIsCreatingSample] = useState(false);
  const [isCreatingAchievements, setIsCreatingAchievements] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploadingTestImages, setIsUploadingTestImages] = useState(false);
  const [isRecreatingAchievements, setIsRecreatingAchievements] = useState(false);
  const [isFixingAchievements, setIsFixingAchievements] = useState(false);
  const [isUploadingRealImages, setIsUploadingRealImages] = useState(false);
  const [isFixingAchievementPhotos, setIsFixingAchievementPhotos] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  const handleInitializeDatabase = async () => {
    try {
      setIsInitializing(true);
      setCurrentStep('Initializing institute structure...');
      
      const success = await initializeCompleteDatabase();
      
      if (success) {
        toast.success('Database initialized successfully!');
        setCurrentStep('Database initialization completed');
      } else {
        toast.error('Failed to initialize database. Check console for details.');
        setCurrentStep('Database initialization failed');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      toast.error('Error initializing database');
      setCurrentStep('Database initialization error');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCreateSampleData = async () => {
    try {
      setIsCreatingSample(true);
      setCurrentStep('Creating sample data...');
      
      const success = await createSampleData();
      
      if (success) {
        toast.success('Sample data created successfully!');
        setCurrentStep('Sample data creation completed');
      } else {
        toast.error('Failed to create sample data. Check console for details.');
        setCurrentStep('Sample data creation failed');
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast.error('Error creating sample data');
      setCurrentStep('Sample data creation error');
    } finally {
      setIsCreatingSample(false);
    }
  };

  const handleCreateSampleAchievements = async () => {
    try {
      setIsCreatingAchievements(true);
      setCurrentStep('Creating sample achievements with photos...');
      
      const success = await createSampleAchievements();
      
      if (success) {
        toast.success('Sample achievements created successfully!');
        setCurrentStep('Sample achievements creation completed');
      } else {
        toast.error('Failed to create sample achievements. Check console for details.');
        setCurrentStep('Sample achievements creation failed');
      }
    } catch (error) {
      console.error('Error creating sample achievements:', error);
      toast.error('Error creating sample achievements');
      setCurrentStep('Sample achievements creation error');
    } finally {
      setIsCreatingAchievements(false);
    }
  };

  const handleUploadTestImages = async () => {
    try {
      setIsUploadingTestImages(true);
      setCurrentStep('Uploading test images to ImgBB...');
      
      const results = await uploadTestImages();
      
      if (Object.keys(results).length > 0) {
        toast.success('Test images uploaded successfully!');
        setCurrentStep('Test image upload completed');
        console.log('📋 Test image URLs:', results);
      } else {
        toast.error('Failed to upload test images. Check console for details.');
        setCurrentStep('Test image upload failed');
      }
    } catch (error) {
      console.error('Error uploading test images:', error);
      toast.error('Error uploading test images');
      setCurrentStep('Test image upload error');
    } finally {
      setIsUploadingTestImages(false);
    }
  };

  const handleRecreateAchievements = async () => {
    try {
      setIsRecreatingAchievements(true);
      setCurrentStep('Clearing and recreating achievements with photo URLs...');
      
      const success = await clearAndRecreateAchievements();
      
      if (success) {
        toast.success('Achievements recreated successfully with photo URLs!');
        setCurrentStep('Achievements recreation completed');
      } else {
        toast.error('Failed to recreate achievements. Check console for details.');
        setCurrentStep('Achievements recreation failed');
      }
    } catch (error) {
      console.error('Error recreating achievements:', error);
      toast.error('Error recreating achievements');
      setCurrentStep('Achievements recreation error');
    } finally {
      setIsRecreatingAchievements(false);
    }
  };

  const handleFixAchievements = async () => {
    try {
      setIsFixingAchievements(true);
      setCurrentStep('Fixing existing achievements by adding photo URLs...');
      
      const success = await fixExistingAchievements();
      
      if (success) {
        toast.success('Achievements fixed successfully with photo URLs!');
        setCurrentStep('Achievements fix completed');
      } else {
        toast.error('Failed to fix achievements. Check console for details.');
        setCurrentStep('Achievements fix failed');
      }
    } catch (error) {
      console.error('Error fixing achievements:', error);
      toast.error('Error fixing achievements');
      setCurrentStep('Achievements fix error');
    } finally {
      setIsFixingAchievements(false);
    }
  };

  const handleUploadRealImages = async () => {
    try {
      setIsUploadingRealImages(true);
      setCurrentStep('Uploading real images to ImgBB and updating achievements...');
      
      const success = await updateAchievementsWithRealImages();
      
      if (success) {
        toast.success('Real images uploaded and achievements updated successfully!');
        setCurrentStep('Real images upload completed');
      } else {
        toast.error('Failed to upload real images. Check console for details.');
        setCurrentStep('Real images upload failed');
      }
    } catch (error) {
      console.error('Error uploading real images:', error);
      toast.error('Error uploading real images');
      setCurrentStep('Real images upload error');
    } finally {
      setIsUploadingRealImages(false);
    }
  };

  const handleFixAchievementPhotos = async () => {
    try {
      setIsFixingAchievementPhotos(true);
      setCurrentStep('Fixing achievement photos - preserving real student uploads...');
      
      const success = await fixAchievementPhotos();
      
      if (success) {
        toast.success('Achievement photos fixed successfully!');
        setCurrentStep('Achievement photos fix completed');
      } else {
        toast.error('Failed to fix achievement photos. Check console for details.');
        setCurrentStep('Achievement photos fix failed');
      }
    } catch (error) {
      console.error('Error fixing achievement photos:', error);
      toast.error('Error fixing achievement photos');
      setCurrentStep('Achievement photos fix error');
    } finally {
      setIsFixingAchievementPhotos(false);
    }
  };

  const handleValidateDatabase = async () => {
    try {
      setIsValidating(true);
      setCurrentStep('Validating database structure...');
      
      const isValid = await validateDatabaseStructure();
      setValidationResults({ isValid, timestamp: new Date().toISOString() });
      
      if (isValid) {
        toast.success('Database structure validation passed!');
        setCurrentStep('Database validation completed');
      } else {
        toast.error('Database structure validation failed. Check console for details.');
        setCurrentStep('Database validation failed');
      }
    } catch (error) {
      console.error('Error validating database:', error);
      toast.error('Error validating database');
      setCurrentStep('Database validation error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpdateStats = async () => {
    try {
      setCurrentStep('Updating institute statistics...');
      
      // Update institute stats
      await updateInstituteStats();
      
      // Update department stats for all departments
      const departments = ['CSE', 'AI_DS', 'MECH', 'CIVIL', 'ECE', 'EEE'];
      for (const dept of departments) {
        await updateDepartmentStats(dept);
      }
      
      toast.success('Statistics updated successfully!');
      setCurrentStep('Statistics update completed');
    } catch (error) {
      console.error('Error updating statistics:', error);
      toast.error('Error updating statistics');
      setCurrentStep('Statistics update error');
    }
  };

  const setupSteps = [
    {
      id: 'initialize',
      title: 'Initialize Database Structure',
      description: 'Create the complete institute ERP database structure',
      icon: Database,
      action: handleInitializeDatabase,
      loading: isInitializing,
      color: 'bg-blue-500'
    },
    {
      id: 'sample',
      title: 'Create Sample Data',
      description: 'Add sample users and data for testing',
      icon: Users,
      action: handleCreateSampleData,
      loading: isCreatingSample,
      color: 'bg-green-500'
    },
    {
      id: 'achievements',
      title: 'Create Sample Achievements',
      description: 'Add sample achievements with photos for testing',
      icon: Award,
      action: handleCreateSampleAchievements,
      loading: isCreatingAchievements,
      color: 'bg-purple-500'
    },
    {
      id: 'test-images',
      title: 'Upload Test Images',
      description: 'Upload test images to ImgBB to verify image display',
      icon: Upload,
      action: handleUploadTestImages,
      loading: isUploadingTestImages,
      color: 'bg-pink-500'
    },
    {
      id: 'recreate-achievements',
      title: 'Recreate Achievements with Photos',
      description: 'Clear existing achievements and recreate with proper photo URLs',
      icon: Award,
      action: handleRecreateAchievements,
      loading: isRecreatingAchievements,
      color: 'bg-red-500'
    },
    {
      id: 'fix-achievements',
      title: 'Fix Existing Achievements',
      description: 'Add photo URLs to existing achievements without clearing data',
      icon: Award,
      action: handleFixAchievements,
      loading: isFixingAchievements,
      color: 'bg-green-500'
    },
    {
      id: 'upload-real-images',
      title: 'Upload Real Images',
      description: 'Create and upload real images to ImgBB for working URLs',
      icon: Upload,
      action: handleUploadRealImages,
      loading: isUploadingRealImages,
      color: 'bg-blue-500'
    },
    {
      id: 'fix-achievement-photos',
      title: 'Fix Achievement Photos',
      description: 'Preserve real student uploads and use proper placeholders',
      icon: Image,
      action: handleFixAchievementPhotos,
      loading: isFixingAchievementPhotos,
      color: 'bg-purple-500'
    },
    {
      id: 'validate',
      title: 'Validate Database Structure',
      description: 'Check if all required database nodes exist',
      icon: CheckCircle,
      action: handleValidateDatabase,
      loading: isValidating,
      color: 'bg-purple-500'
    },
    {
      id: 'stats',
      title: 'Update Statistics',
      description: 'Calculate and update institute and department statistics',
      icon: Settings,
      action: handleUpdateStats,
      loading: false,
      color: 'bg-orange-500'
    }
  ];

  const databaseNodes = [
    { name: 'Institute Info', path: 'institute', icon: Building2 },
    { name: 'Users', path: 'users', icon: Users },
    { name: 'Students', path: 'students', icon: GraduationCap },
    { name: 'Academics', path: 'academics', icon: BookOpen },
    { name: 'Finance', path: 'finance', icon: FileText },
    { name: 'Certificates', path: 'certificates', icon: Award },
    { name: 'Achievements', path: 'achievements', icon: Award },
    { name: 'Facilities', path: 'facilities', icon: Wrench },
    { name: 'Notifications', path: 'notifications', icon: Bell },
    { name: 'Reports', path: 'reports', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Database Setup</h1>
              <p className="text-gray-600">Initialize and configure your institute ERP database</p>
            </div>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {setupSteps.map((step) => (
            <div key={step.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${step.color} bg-opacity-10`}>
                  <step.icon className={`h-6 w-6 ${step.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <button
                    onClick={step.action}
                    disabled={step.loading}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      step.loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : step.color
                    } hover:opacity-90 transition-opacity`}
                  >
                    {step.loading ? (
                      <div className="flex items-center space-x-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span>Run</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Step Status */}
        {currentStep && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
            <div className="flex items-center space-x-3">
              <Loader className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="text-gray-700">{currentStep}</span>
            </div>
          </div>
        )}

        {/* Validation Results */}
        {validationResults && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Results</h3>
            <div className="flex items-center space-x-3 mb-4">
              {validationResults.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                validationResults.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {validationResults.isValid ? 'Database structure is valid' : 'Database structure has issues'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Last validated: {new Date(validationResults.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Database Structure Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Database Structure Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {databaseNodes.map((node) => (
              <div key={node.path} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <node.icon className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{node.name}</h4>
                    <p className="text-sm text-gray-500">/{node.path}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Setup Instructions</h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-3">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              <p>Click "Initialize Database Structure" to create the complete ERP database structure</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              <p>Click "Create Sample Data" to add test users and data for development</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
              <p>Click "Create Sample Achievements" to add sample achievements with photos for testing</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
              <p>Click "Upload Test Images" to verify image display functionality</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
              <p>Click "Recreate Achievements with Photos" to clear and recreate achievements with proper photo URLs</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">6</span>
              <p>Click "Validate Database Structure" to verify all nodes are created correctly</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">7</span>
              <p>Click "Update Statistics" to calculate current institute and department statistics</p>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">Important Notes</h3>
          <div className="space-y-2 text-yellow-800">
            <p>• This setup will create a complete database structure for institute-wide ERP</p>
            <p>• All existing data will be preserved during initialization</p>
            <p>• Make sure you have proper Firebase permissions before running setup</p>
            <p>• Sample data is for testing purposes only - remove in production</p>
            <p>• Database structure supports multiple departments and user roles</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup; 