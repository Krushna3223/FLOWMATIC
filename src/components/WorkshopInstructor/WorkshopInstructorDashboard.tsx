import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import { 
  AlertTriangle, 
  FileText, 
  CheckCircle,
  Wrench,
  Shield,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Equipment {
  id: string;
  name: string;
  category: 'machine' | 'tool' | 'safety' | 'other';
  location: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'out_of_order';
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_order';
  lastInspection: string;
  nextInspection: string;
  assignedTo?: string;
  notes?: string;
}

interface SafetyNotice {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'safety' | 'maintenance' | 'emergency' | 'general';
  location: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

interface ToolRequest {
  id: string;
  title: string;
  description: string;
  category: 'tool' | 'part' | 'equipment' | 'safety' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  estimatedCost?: number;
}

const WorkshopInstructorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [safetyNotices, setSafetyNotices] = useState<SafetyNotice[]>([]);
  const [toolRequests, setToolRequests] = useState<ToolRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock data for workshop equipment
      const mockEquipment: Equipment[] = [
        {
          id: 'eq-1',
          name: 'CNC Machine',
          category: 'machine',
          location: 'Workshop A',
          condition: 'good',
          status: 'available',
          lastInspection: '2024-01-15',
          nextInspection: '2024-02-15'
        },
        {
          id: 'eq-2',
          name: 'Welding Machine',
          category: 'machine',
          location: 'Workshop B',
          condition: 'excellent',
          status: 'in_use',
          lastInspection: '2024-01-10',
          nextInspection: '2024-02-10',
          assignedTo: 'John Smith'
        },
        {
          id: 'eq-3',
          name: 'Safety Goggles',
          category: 'safety',
          location: 'Safety Cabinet',
          condition: 'fair',
          status: 'available',
          lastInspection: '2024-01-20',
          nextInspection: '2024-02-20'
        }
      ];
      setEquipment(mockEquipment);

      // Mock safety notices
      const mockSafetyNotices: SafetyNotice[] = [
        {
          id: 'notice-1',
          title: 'New Safety Protocol for Welding',
          description: 'Updated safety procedures for welding operations effective immediately',
          priority: 'high',
          type: 'safety',
          location: 'All Workshops',
          status: 'active',
          createdAt: '2024-01-20'
        },
        {
          id: 'notice-2',
          title: 'Equipment Maintenance Schedule',
          description: 'Monthly maintenance schedule for all workshop equipment',
          priority: 'medium',
          type: 'maintenance',
          location: 'Workshop A & B',
          status: 'acknowledged',
          createdAt: '2024-01-18',
          acknowledgedAt: '2024-01-19'
        }
      ];
      setSafetyNotices(mockSafetyNotices);

      // Mock tool requests
      const mockToolRequests: ToolRequest[] = [
        {
          id: 'tr-1',
          title: 'New Safety Helmets',
          description: 'Need 10 new safety helmets for workshop safety compliance',
          category: 'safety',
          priority: 'high',
          status: 'pending',
          requestedBy: 'Workshop Instructor',
          requestedAt: '2024-01-18'
        },
        {
          id: 'tr-2',
          title: 'CNC Machine Parts',
          description: 'Replacement parts for CNC machine maintenance',
          category: 'part',
          priority: 'medium',
          status: 'approved',
          requestedBy: 'Workshop Instructor',
          requestedAt: '2024-01-15',
          approvedBy: 'Store Keeper',
          approvedAt: '2024-01-16'
        }
      ];
      setToolRequests(mockToolRequests);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentUpdate = async (equipmentId: string, status: string, condition?: string, notes?: string) => {
    try {
      setEquipment(prev => prev.map(eq => 
        eq.id === equipmentId 
          ? { 
              ...eq, 
              status: status as any, 
              condition: condition as any,
              notes: notes || eq.notes
            }
          : eq
      ));
      toast.success('Equipment status updated successfully');
    } catch (error) {
      toast.error('Failed to update equipment status');
    }
  };

  const handleSafetyNoticeAcknowledge = async (noticeId: string) => {
    try {
      // Update safety notice status
      setSafetyNotices(prev => prev.map(notice => 
        notice.id === noticeId 
          ? { ...notice, status: 'acknowledged', acknowledgedAt: new Date().toISOString() }
          : notice
      ));
      toast.success('Safety notice acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge safety notice');
    }
  };

  // General Stock Request functions
  // Removed as per edit hint

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'in_use': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'out_of_order': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'out_of_order': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Workshop Instructor Dashboard</h1>
        <p className="text-gray-600">Manage workshop equipment, safety protocols, and tool requests</p>
      </div>

             {/* Quick Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-white rounded-lg shadow p-6">
           <div className="flex items-center">
             <div className="p-2 bg-blue-100 rounded-lg">
               <Wrench className="h-6 w-6 text-blue-600" />
             </div>
             <div className="ml-4">
               <p className="text-sm font-medium text-gray-600">Total Equipment</p>
               <p className="text-2xl font-bold text-gray-900">{equipment.length}</p>
             </div>
           </div>
         </div>

         <div className="bg-white rounded-lg shadow p-6">
           <div className="flex items-center">
             <div className="p-2 bg-green-100 rounded-lg">
               <CheckCircle className="h-6 w-6 text-green-600" />
             </div>
             <div className="ml-4">
               <p className="text-sm font-medium text-gray-600">Functional Equipment</p>
               <p className="text-2xl font-bold text-gray-900">
                 {equipment.filter(eq => eq.status === 'available' || eq.status === 'in_use').length}
               </p>
             </div>
           </div>
         </div>

         <div className="bg-white rounded-lg shadow p-6">
           <div className="flex items-center">
             <div className="p-2 bg-yellow-100 rounded-lg">
               <AlertTriangle className="h-6 w-6 text-yellow-600" />
             </div>
             <div className="ml-4">
               <p className="text-sm font-medium text-gray-600">Safety Notices</p>
               <p className="text-2xl font-bold text-gray-900">
                 {safetyNotices.filter(notice => notice.status === 'active').length}
               </p>
             </div>
           </div>
         </div>

         <div className="bg-white rounded-lg shadow p-6">
           <div className="flex items-center">
             <div className="p-2 bg-purple-100 rounded-lg">
               <Package className="h-6 w-6 text-purple-600" />
             </div>
             <div className="ml-4">
               <p className="text-sm font-medium text-gray-600">Tool Requests</p>
               <p className="text-2xl font-bold text-gray-900">
                 {toolRequests.filter(request => request.status === 'pending').length}
               </p>
             </div>
           </div>
         </div>
       </div>

       {/* Overview Section */}
       <div className="bg-white rounded-lg shadow mb-6">
         <div className="p-6">
           <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-gray-50 rounded-lg p-6">
                 <h3 className="text-lg font-semibold mb-4">Equipment Status</h3>
                 <div className="space-y-3">
                   {equipment.slice(0, 3).map((eq) => (
                     <div key={eq.id} className="flex items-center justify-between p-3 bg-white rounded border">
                       <div>
                         <p className="font-medium">{eq.name}</p>
                         <p className="text-sm text-gray-600">{eq.location}</p>
                       </div>
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(eq.status)}`}>
                         {eq.status}
                       </span>
                     </div>
                   ))}
                 </div>
               </div>

                               <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded border">
                      <p className="font-medium text-gray-800">Equipment Status Updated</p>
                      <p className="text-sm text-gray-600">CNC Machine - Available</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <p className="font-medium text-gray-800">Safety Notice Posted</p>
                      <p className="text-sm text-gray-600">New welding protocols</p>
                    </div>
                  </div>
                </div>
             </div>

             {/* Navigation Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/workshop-instructor/equipment-inventory')}>
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-lg font-semibold mb-2">Equipment Inventory</h3>
                     <p className="text-blue-100 text-sm">Manage workshop equipment</p>
                   </div>
                   <Wrench className="h-8 w-8 text-blue-200" />
                 </div>
               </div>

               <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/workshop-instructor/safety-notices')}>
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-lg font-semibold mb-2">Safety Notices</h3>
                     <p className="text-yellow-100 text-sm">View safety protocols</p>
                   </div>
                   <Shield className="h-8 w-8 text-yellow-200" />
                 </div>
               </div>

               <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/workshop-instructor/tool-requests')}>
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-lg font-semibold mb-2">Tool Requests</h3>
                     <p className="text-purple-100 text-sm">Request tools and equipment</p>
                   </div>
                   <FileText className="h-8 w-8 text-purple-200" />
                 </div>
               </div>

               <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/workshop-instructor/general-stock')}>
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-lg font-semibold mb-2">General Stock</h3>
                     <p className="text-green-100 text-sm">Request general stock items</p>
                   </div>
                   <Package className="h-8 w-8 text-green-200" />
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>

       {/* General Stock Request Modal */}
       {/* Removed as per edit hint */}
     </div>
   );
 };

export default WorkshopInstructorDashboard; 