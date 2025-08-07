import { ref, push, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase/config';
import toast from 'react-hot-toast';

export interface LibraryResourceRequest {
  id: string;
  title: string;
  description: string;
  resourceType: 'book' | 'journal' | 'magazine' | 'reference' | 'digital' | 'equipment' | 'other';
  priority: 'low' | 'medium' | 'high';
  additionalDetails?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  currentApproverRole: string;
  approvalFlow: Array<{
    role: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string | null;
    comment?: string;
  }>;
  history: Array<{
    action: string;
    by: string;
    role: string;
    timestamp: string;
    comment?: string;
  }>;
}

export interface LibraryTimingRequest {
  id: string;
  title: string;
  description: string;
  requestedTiming: {
    startTime: string;
    endTime: string;
    days: string[];
    startDate: string;
    endDate: string;
  };
  reason: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  currentApproverRole: string;
  approvalFlow: Array<{
    role: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string | null;
    comment?: string;
  }>;
  history: Array<{
    action: string;
    by: string;
    role: string;
    timestamp: string;
    comment?: string;
  }>;
}

export class LibraryRequestManager {
  private static instance: LibraryRequestManager;
  
  private constructor() {}
  
  public static getInstance(): LibraryRequestManager {
    if (!LibraryRequestManager.instance) {
      LibraryRequestManager.instance = new LibraryRequestManager();
    }
    return LibraryRequestManager.instance;
  }

  // Create a new library resource request
  async createResourceRequest(requestData: Omit<LibraryResourceRequest, 'id' | 'status' | 'createdAt' | 'currentApproverRole' | 'approvalFlow' | 'history'>): Promise<string> {
    try {
      const requestRef = ref(database, 'libraryResourceRequests');
      const newRequestRef = push(requestRef);
      
      const request: LibraryResourceRequest = {
        ...requestData,
        id: newRequestRef.key!,
        status: 'pending',
        createdAt: new Date().toISOString(),
        currentApproverRole: 'asst_librarian',
        approvalFlow: [
          {
            role: 'asst_librarian',
            name: 'Assistant Librarian',
            status: 'pending',
            timestamp: new Date().toISOString()
          },
          {
            role: 'registrar',
            name: 'Registrar',
            status: 'pending',
            timestamp: null
          },
          {
            role: 'principal',
            name: 'Principal',
            status: 'pending',
            timestamp: null
          }
        ],
        history: [
          {
            action: 'Request Created',
            by: requestData.createdByName,
            role: requestData.createdBy,
            timestamp: new Date().toISOString(),
            comment: 'Library resource request submitted'
          }
        ]
      };

      await update(ref(database, `libraryResourceRequests/${newRequestRef.key}`), request);
      
      toast.success('Library resource request submitted successfully!');
      return newRequestRef.key!;
    } catch (error) {
      console.error('Error creating library resource request:', error);
      toast.error('Failed to submit request. Please try again.');
      throw error;
    }
  }

  // Create a new library timing request
  async createTimingRequest(requestData: Omit<LibraryTimingRequest, 'id' | 'status' | 'createdAt' | 'currentApproverRole' | 'approvalFlow' | 'history'>): Promise<string> {
    try {
      const requestRef = ref(database, 'libraryTimingRequests');
      const newRequestRef = push(requestRef);
      
      const request: LibraryTimingRequest = {
        ...requestData,
        id: newRequestRef.key!,
        status: 'pending',
        createdAt: new Date().toISOString(),
        currentApproverRole: 'registrar',
        approvalFlow: [
          {
            role: 'registrar',
            name: 'Registrar',
            status: 'pending',
            timestamp: new Date().toISOString()
          },
          {
            role: 'principal',
            name: 'Principal',
            status: 'pending',
            timestamp: null
          }
        ],
        history: [
          {
            action: 'Request Created',
            by: requestData.createdByName,
            role: requestData.createdBy,
            timestamp: new Date().toISOString(),
            comment: 'Library timing request submitted'
          }
        ]
      };

      await update(ref(database, `libraryTimingRequests/${newRequestRef.key}`), request);
      
      toast.success('Library timing request submitted successfully!');
      return newRequestRef.key!;
    } catch (error) {
      console.error('Error creating library timing request:', error);
      toast.error('Failed to submit request. Please try again.');
      throw error;
    }
  }

  // Get library resource requests for a user
  async getResourceRequests(userId: string, userRole: string): Promise<LibraryResourceRequest[]> {
    try {
      const requestsRef = ref(database, 'libraryResourceRequests');
      const snapshot = await get(requestsRef);
      
      if (!snapshot.exists()) return [];
      
      const requests: LibraryResourceRequest[] = [];
      snapshot.forEach((childSnapshot) => {
        const request = childSnapshot.val();
        // Show requests that are pending for the user's role or were created by the user
        if (request.currentApproverRole === userRole || request.createdBy === userId) {
          requests.push({
            id: childSnapshot.key!,
            ...request
          });
        }
      });
      
      return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching library resource requests:', error);
      throw error;
    }
  }

  // Get library timing requests for a user
  async getTimingRequests(userId: string, userRole: string): Promise<LibraryTimingRequest[]> {
    try {
      const requestsRef = ref(database, 'libraryTimingRequests');
      const snapshot = await get(requestsRef);
      
      if (!snapshot.exists()) return [];
      
      const requests: LibraryTimingRequest[] = [];
      snapshot.forEach((childSnapshot) => {
        const request = childSnapshot.val();
        // Show requests that are pending for the user's role or were created by the user
        if (request.currentApproverRole === userRole || request.createdBy === userId) {
          requests.push({
            id: childSnapshot.key!,
            ...request
          });
        }
      });
      
      return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching library timing requests:', error);
      throw error;
    }
  }

  // Approve or reject a library resource request
  async approveResourceRequest(
    requestId: string,
    userId: string,
    userName: string,
    userRole: string,
    action: 'approve' | 'reject',
    comment?: string
  ): Promise<void> {
    try {
      const requestRef = ref(database, `libraryResourceRequests/${requestId}`);
      const snapshot = await get(requestRef);
      
      if (!snapshot.exists()) {
        throw new Error('Request not found');
      }
      
      const request = snapshot.val() as LibraryResourceRequest;
      
      // Update approval flow
      const updatedApprovalFlow = request.approvalFlow.map(step => {
        if (step.role === userRole) {
          const newStatus: 'pending' | 'approved' | 'rejected' = action === 'approve' ? 'approved' : 'rejected';
          return { ...step, status: newStatus, timestamp: new Date().toISOString(), comment };
        }
        return step;
      });

      // Add to history
      const updatedHistory = [
        ...request.history,
        {
          action: action === 'approve' ? 'Request Approved' : 'Request Rejected',
          by: userName,
          role: userRole,
          timestamp: new Date().toISOString(),
          comment: comment || `Request ${action} by ${userName}`
        }
      ];

      const updateData: Partial<LibraryResourceRequest> = {
        approvalFlow: updatedApprovalFlow,
        history: updatedHistory
      };

      // Determine next approver or final status
      if (action === 'approve') {
        if (userRole === 'asst_librarian') {
          updateData.status = 'pending';
          updateData.currentApproverRole = 'registrar';
        } else if (userRole === 'registrar') {
          updateData.status = 'pending';
          updateData.currentApproverRole = 'principal';
        } else if (userRole === 'principal') {
          updateData.status = 'approved';
        }
      } else {
        updateData.status = 'rejected';
      }

      await update(requestRef, updateData);
      
      toast.success(`Request ${action}d successfully`);
    } catch (error) {
      console.error('Error approving library resource request:', error);
      toast.error('Failed to process request');
      throw error;
    }
  }

  // Approve or reject a library timing request
  async approveTimingRequest(
    requestId: string,
    userId: string,
    userName: string,
    userRole: string,
    action: 'approve' | 'reject',
    comment?: string
  ): Promise<void> {
    try {
      const requestRef = ref(database, `libraryTimingRequests/${requestId}`);
      const snapshot = await get(requestRef);
      
      if (!snapshot.exists()) {
        throw new Error('Request not found');
      }
      
      const request = snapshot.val() as LibraryTimingRequest;
      
      // Update approval flow
      const updatedApprovalFlow = request.approvalFlow.map(step => {
        if (step.role === userRole) {
          const newStatus: 'pending' | 'approved' | 'rejected' = action === 'approve' ? 'approved' : 'rejected';
          return { ...step, status: newStatus, timestamp: new Date().toISOString(), comment };
        }
        return step;
      });

      // Add to history
      const updatedHistory = [
        ...request.history,
        {
          action: action === 'approve' ? 'Request Approved' : 'Request Rejected',
          by: userName,
          role: userRole,
          timestamp: new Date().toISOString(),
          comment: comment || `Request ${action} by ${userName}`
        }
      ];

      const updateData: Partial<LibraryTimingRequest> = {
        approvalFlow: updatedApprovalFlow,
        history: updatedHistory
      };

      // Determine next approver or final status
      if (action === 'approve') {
        if (userRole === 'registrar') {
          updateData.status = 'pending';
          updateData.currentApproverRole = 'principal';
        } else if (userRole === 'principal') {
          updateData.status = 'approved';
        }
      } else {
        updateData.status = 'rejected';
      }

      await update(requestRef, updateData);
      
      toast.success(`Request ${action}d successfully`);
    } catch (error) {
      console.error('Error approving library timing request:', error);
      toast.error('Failed to process request');
      throw error;
    }
  }

  // Get request statistics
  async getRequestStats(userId: string, userRole: string): Promise<{
    resourceRequests: { total: number; pending: number; approved: number; rejected: number };
    timingRequests: { total: number; pending: number; approved: number; rejected: number };
  }> {
    try {
      const resourceRequests = await this.getResourceRequests(userId, userRole);
      const timingRequests = await this.getTimingRequests(userId, userRole);

      return {
        resourceRequests: {
          total: resourceRequests.length,
          pending: resourceRequests.filter(r => r.status === 'pending').length,
          approved: resourceRequests.filter(r => r.status === 'approved').length,
          rejected: resourceRequests.filter(r => r.status === 'rejected').length
        },
        timingRequests: {
          total: timingRequests.length,
          pending: timingRequests.filter(r => r.status === 'pending').length,
          approved: timingRequests.filter(r => r.status === 'approved').length,
          rejected: timingRequests.filter(r => r.status === 'rejected').length
        }
      };
    } catch (error) {
      console.error('Error getting request stats:', error);
      throw error;
    }
  }

  // Get pending requests for approval
  async getPendingRequests(userRole: string): Promise<{
    resourceRequests: LibraryResourceRequest[];
    timingRequests: LibraryTimingRequest[];
  }> {
    try {
      const resourceRequests = await this.getResourceRequests('', userRole);
      const timingRequests = await this.getTimingRequests('', userRole);

      return {
        resourceRequests: resourceRequests.filter(r => r.status === 'pending' && r.currentApproverRole === userRole),
        timingRequests: timingRequests.filter(r => r.status === 'pending' && r.currentApproverRole === userRole)
      };
    } catch (error) {
      console.error('Error getting pending requests:', error);
      throw error;
    }
  }
}

export default LibraryRequestManager; 