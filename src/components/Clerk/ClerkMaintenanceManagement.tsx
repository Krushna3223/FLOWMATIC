import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update, push } from 'firebase/database';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface MaintenanceRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  studentDepartment: string;
  category: string;
  subCategory: string;
  title: string;
  description: string;
  location: string;
  priority: string;
  contactNumber?: string;
  preferredTime?: string;
  status: string;
  currentLevel: string;
  nextLevel: string;
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    level: string;
    action: string;
    timestamp: string;
    user: string;
  }>;
}

export default function ClerkMaintenanceManagement() {
  const { currentUser } = useAuth();
  const db = getDatabase();
  
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  // Category routing logic
  const getNextLevel = (category: string, currentLevel: string) => {
    // Category-based routing logic
    switch (category) {
      case "electrical":
        return "electrical_technician";
      case "plumbing":
        return "plumber";
      case "hvac":
        return "hvac_technician";
      case "structural":
        return "civil_supervisor";
      case "furniture":
        return "carpenter";
      case "equipment":
        return "computer_technician";
      case "safety":
        return "safety_officer";
      case "cleaning":
        return "housekeeping_supervisor";
      case "landscaping":
        return "gardener_supervisor";
      case "other":
      default:
        return "registrar";
    }
  };

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const requestsRef = ref(db, 'maintenanceRequests');
      const unsubscribe = onValue(requestsRef, (snapshot) => {
        if (snapshot.exists()) {
          const requests: MaintenanceRequest[] = [];
          snapshot.forEach((userSnapshot) => {
            const userRequests = userSnapshot.val();
            Object.entries(userRequests).forEach(([requestId, requestData]: [string, any]) => {
              requests.push({
                id: requestId,
                studentId: userSnapshot.key!,
                ...requestData
              });
            });
          });
          
          // Filter requests that are pending and at clerk level
          const clerkRequests = requests.filter(req => 
            req.status === "pending" && req.nextLevel === "clerk"
          );
          
          requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setMaintenanceRequests(clerkRequests);
        } else {
          console.log('⚠️ ClerkMaintenanceManagement: No maintenance requests found in Firebase');
          setMaintenanceRequests([]);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      toast.error('Failed to fetch maintenance requests');
      setLoading(false);
    }
  };

  const handleApprove = async (request: MaintenanceRequest) => {
    try {
      const nextLevel = getNextLevel(request.category, request.currentLevel);
      const nextLevelName = getNextLevelName(request.category);
      
      const updatedData = {
        ...request,
        status: nextLevel === "registrar" ? "approved_by_clerk" : "pending",
        currentLevel: nextLevel,
        nextLevel: nextLevel === "registrar" ? "registrar" : nextLevel,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...request.timeline,
          {
            level: "clerk",
            action: `Approved and forwarded to ${nextLevelName}`,
            timestamp: new Date().toISOString(),
            user: currentUser?.name || "Clerk"
          }
        ]
      };

      const requestRef = ref(db, `maintenanceRequests/${request.studentId}/${request.id}`);
      await update(requestRef, updatedData);

      // Create notification for student
      const notificationData = {
        type: 'maintenance_approved',
        title: 'Maintenance Request Approved',
        message: `Your maintenance request "${request.title}" has been approved by Clerk and forwarded to ${nextLevelName}`,
        requestId: request.id,
        status: 'unread',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const notificationRef = ref(db, `notifications/${request.studentId}`);
      await push(notificationRef, notificationData);

      toast.success(`Request approved and forwarded to ${nextLevelName}!`);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (request: MaintenanceRequest) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const updatedData = {
        ...request,
        status: "rejected",
        currentLevel: "clerk",
        nextLevel: "student",
        updatedAt: new Date().toISOString(),
        rejectionReason: reason,
        timeline: [
          ...request.timeline,
          {
            level: "clerk",
            action: `Rejected: ${reason}`,
            timestamp: new Date().toISOString(),
            user: currentUser?.name || "Clerk"
          }
        ]
      };

      const requestRef = ref(db, `maintenanceRequests/${request.studentId}/${request.id}`);
      await update(requestRef, updatedData);

      // Create notification for student
      const notificationData = {
        type: 'maintenance_rejected',
        title: 'Maintenance Request Rejected',
        message: `Your maintenance request "${request.title}" has been rejected by Clerk: ${reason}`,
        requestId: request.id,
        rejectionReason: reason,
        status: 'unread',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const notificationRef = ref(db, `notifications/${request.studentId}`);
      await push(notificationRef, notificationData);

      toast.success('Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      "pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      "approved_by_clerk": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      "approved_by_supervisor": "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      "approved_by_registrar": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      "completed": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      "rejected": "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      "low": "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      "medium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      "high": "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      "urgent": "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    };
    return colors[priority] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      "electrical": "⚡",
      "plumbing": "🚰",
      "hvac": "❄️",
      "structural": "🏗️",
      "furniture": "🪑",
      "equipment": "💻",
      "safety": "🛡️",
      "cleaning": "🧹",
      "landscaping": "🌳",
      "other": "🔧"
    };
    return icons[category] || "🔧";
  };

  const getNextLevelName = (category: string) => {
    // Category-based department names
    switch (category) {
      case "electrical":
        return "Electrical Technician";
      case "plumbing":
        return "Plumber";
      case "hvac":
        return "HVAC Technician";
      case "structural":
        return "Civil Supervisor";
      case "furniture":
        return "Carpenter";
      case "equipment":
        return "Computer Technician";
      case "safety":
        return "Safety Officer";
      case "cleaning":
        return "Housekeeping Supervisor";
      case "landscaping":
        return "Gardener Supervisor";
      case "other":
      default:
        return "Registrar";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredRequests = maintenanceRequests.filter(request => {
    if (activeTab === "all") return true;
    return request.status === activeTab;
  });

  const stats = {
    total: maintenanceRequests.length,
    pending: maintenanceRequests.filter(r => r.status === "pending").length,
    approved: maintenanceRequests.filter(r => r.status === "approved_by_clerk").length,
    rejected: maintenanceRequests.filter(r => r.status === "rejected").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Requests</h2>
          <p className="text-gray-600 dark:text-gray-400">Review and manage student maintenance requests</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {[
          { id: "all", name: "All Requests", count: stats.total },
          { id: "pending", name: "Pending", count: stats.pending },
          { id: "approved_by_clerk", name: "Approved", count: stats.approved },
          { id: "rejected", name: "Rejected", count: stats.rejected }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white dark:bg-gray-700 shadow-md text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>{tab.name}</span>
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                {tab.count}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Maintenance Requests
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {activeTab === "all" ? "No maintenance requests assigned to you yet." : `No ${activeTab} requests found.`}
              </p>
            </div>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow p-6">
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCategoryIcon(request.category)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {request.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {request.subCategory} • {request.location}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Student: {request.studentName} ({request.studentRollNo})
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(request.status)}`}>
                    {request.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full ${getPriorityColor(request.priority)}`}>
                    {request.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {request.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Category:</span>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {request.category}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Next Level:</span>
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    {getNextLevelName(request.category)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {request.status === 'pending' && (
                <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleApprove(request)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ✅ Approve & Forward to {getNextLevelName(request.category)}
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ❌ Reject
                  </button>
                </div>
              )}

              {/* Timeline */}
              {request.timeline && request.timeline.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Request Timeline</h4>
                  <div className="space-y-2">
                    {request.timeline.map((event, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {event.action} by {event.user}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 