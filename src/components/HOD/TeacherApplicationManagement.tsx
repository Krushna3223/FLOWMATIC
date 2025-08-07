import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

interface TeacherApplication {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  applicationType: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  currentLevel: string;
  submittedAt: number;
  comments?: string;
  attachments?: string[];
}

const TeacherApplicationManagement: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<TeacherApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [comment, setComment] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    if (!user) return;

    const applicationsRef = ref(database, 'teacherApplications');
    const unsubscribe = onValue(applicationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const applicationsList: TeacherApplication[] = [];
        Object.keys(data).forEach((key) => {
          const application = data[key];
          // Show applications that are pending HOD review or forwarded to HOD
          if (application.currentLevel === 'hod' || 
              (application.status === 'pending' && application.currentLevel === 'hod')) {
            applicationsList.push({
              id: key,
              ...application
            });
          }
        });
        setApplications(applicationsList);
      } else {
        setApplications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleApprove = async (applicationId: string) => {
    if (!user) return;

    try {
      const applicationRef = ref(database, `teacherApplications/${applicationId}`);
      await update(applicationRef, {
        status: 'approved_by_hod',
        currentLevel: 'registrar',
        approvedByHod: user.uid,
        hodApprovalTime: Date.now(),
        hodComment: comment || 'Approved by HOD'
      });

      // Create notification for registrar
      const notificationRef = ref(database, 'notifications');
      await push(notificationRef, {
        userId: 'registrar', // Will be sent to all registrars
        title: 'Teacher Application Requires Review',
        message: `A teacher application has been approved by HOD and forwarded to Registrar for review.`,
        type: 'teacher_application',
        applicationId: applicationId,
        timestamp: Date.now(),
        read: false
      });

      setShowDetails(false);
      setSelectedApplication(null);
      setComment('');
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!user) return;

    try {
      const applicationRef = ref(database, `teacherApplications/${applicationId}`);
      await update(applicationRef, {
        status: 'rejected_by_hod',
        currentLevel: 'hod',
        rejectedByHod: user.uid,
        hodRejectionTime: Date.now(),
        hodComment: comment || 'Rejected by HOD'
      });

      setShowDetails(false);
      setSelectedApplication(null);
      setComment('');
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const handleForward = async (applicationId: string) => {
    if (!user) return;

    try {
      const applicationRef = ref(database, `teacherApplications/${applicationId}`);
      await update(applicationRef, {
        status: 'forwarded_to_registrar',
        currentLevel: 'registrar',
        forwardedByHod: user.uid,
        hodForwardTime: Date.now(),
        hodComment: comment || 'Forwarded to Registrar for further review'
      });

      // Create notification for registrar
      const notificationRef = ref(database, 'notifications');
      await push(notificationRef, {
        userId: 'registrar',
        title: 'Teacher Application Forwarded',
        message: `A teacher application has been forwarded by HOD to Registrar for review.`,
        type: 'teacher_application',
        applicationId: applicationId,
        timestamp: Date.now(),
        read: false
      });

      setShowDetails(false);
      setSelectedApplication(null);
      setComment('');
    } catch (error) {
      console.error('Error forwarding application:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending Review</span>;
      case 'approved_by_hod':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Approved by HOD</span>;
      case 'rejected_by_hod':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Rejected by HOD</span>;
      case 'forwarded_to_registrar':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Forwarded to Registrar</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">High</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Low</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{priority}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Application Management</h1>
        <p className="text-gray-600">Review and manage teacher applications - Approve, Reject, or Forward to Registrar</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="approved_by_hod">Approved by HOD</option>
            <option value="rejected_by_hod">Rejected by HOD</option>
            <option value="forwarded_to_registrar">Forwarded to Registrar</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{application.teacherName}</div>
                      <div className="text-sm text-gray-500">{application.teacherEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.applicationType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(application.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(application.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(application.status === 'pending' || application.currentLevel === 'hod') && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetails(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teacher</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.teacherName} ({selectedApplication.teacherEmail})</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Application Type</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.applicationType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.subject}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <div className="mt-1">{getPriorityBadge(selectedApplication.priority)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Add your comment..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedApplication(null);
                    setComment('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedApplication.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleForward(selectedApplication.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Forward to Registrar
                </button>
                <button
                  onClick={() => handleApprove(selectedApplication.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherApplicationManagement; 