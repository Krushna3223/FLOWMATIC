import { ref, push, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase/config';
import { 
  HIERARCHY_CONFIG, 
  REQUEST_FLOWS, 
  canSendRequestTo, 
  canReceiveFrom, 
  getNextApprover,
  getRoleLevel 
} from '../types/hierarchy';

export interface Request {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: string;
  toUserId?: string;
  toUserName?: string;
  toUserRole: string;
  requestType: 'certificate' | 'maintenance' | 'academic' | 'complaint' | 'inventory' | 'general';
  subject: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'forwarded' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  comments: RequestComment[];
  attachments?: string[];
  autoForwarded: boolean;
  escalationLevel: number;
  maxResponseTime?: number;
  department?: string;
  tags?: string[];
}

export interface RequestComment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  timestamp: string;
  isInternal: boolean;
}

export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  forwarded: number;
  completed: number;
  overdue: number;
}

export class RequestManager {
  private static instance: RequestManager;
  
  private constructor() {}
  
  public static getInstance(): RequestManager {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager();
    }
    return RequestManager.instance;
  }

  // Create a new request
  async createRequest(requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'comments' | 'autoForwarded' | 'escalationLevel'>): Promise<string> {
    try {
      const requestRef = ref(database, 'requests');
      const newRequestRef = push(requestRef);
      
      const request: Request = {
        ...requestData,
        id: newRequestRef.key!,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        autoForwarded: false,
        escalationLevel: 0
      };

      await update(ref(database, `requests/${newRequestRef.key}`), request);
      
      // Auto-forward if configured
      await this.handleAutoForward(request);
      
      return newRequestRef.key!;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  }

  // Handle auto-forwarding based on hierarchy
  private async handleAutoForward(request: Request): Promise<void> {
    const flow = REQUEST_FLOWS.find(f => 
      f.fromRole === request.fromUserRole && f.toRole === request.toUserRole
    );

    if (flow?.autoForward) {
      const nextApprover = getNextApprover(request.toUserRole, request.requestType);
      if (nextApprover) {
        // Find a user with the next approver role
        const usersRef = ref(database, 'users');
        const usersQuery = query(usersRef, orderByChild('role'), equalTo(nextApprover));
        const snapshot = await get(usersQuery);
        
        if (snapshot.exists()) {
          const users = snapshot.val();
          const nextApproverUser = Object.values(users)[0] as any;
          
          // Update request to forward to next approver
          await update(ref(database, `requests/${request.id}`), {
            toUserId: nextApproverUser.uid,
            toUserName: nextApproverUser.name,
            toUserRole: nextApproverUser.role,
            status: 'forwarded',
            autoForwarded: true,
            escalationLevel: request.escalationLevel + 1,
            updatedAt: new Date().toISOString()
          });

          // Add internal comment about auto-forward
          await this.addComment(request.id, {
            userId: 'system',
            userName: 'System',
            userRole: 'system',
            comment: `Auto-forwarded to ${nextApproverUser.name} (${nextApproverUser.role})`,
            timestamp: new Date().toISOString(),
            isInternal: true
          });
        }
      }
    }
  }

  // Get requests for a user (incoming)
  async getIncomingRequests(userId: string, userRole: string): Promise<Request[]> {
    try {
      const requestsRef = ref(database, 'requests');
      const requestsQuery = query(requestsRef, orderByChild('toUserId'), equalTo(userId));
      const snapshot = await get(requestsQuery);
      
      if (!snapshot.exists()) return [];
      
      const requests: Request[] = [];
      Object.values(snapshot.val()).forEach((request: any) => {
        if (canReceiveFrom(userRole, request.fromUserRole)) {
          requests.push(request as Request);
        }
      });
      
      return requests.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching incoming requests:', error);
      throw error;
    }
  }

  // Get requests sent by a user (outgoing)
  async getOutgoingRequests(userId: string): Promise<Request[]> {
    try {
      const requestsRef = ref(database, 'requests');
      const requestsQuery = query(requestsRef, orderByChild('fromUserId'), equalTo(userId));
      const snapshot = await get(requestsQuery);
      
      if (!snapshot.exists()) return [];
      
      return Object.values(snapshot.val()).sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) as Request[];
    } catch (error) {
      console.error('Error fetching outgoing requests:', error);
      throw error;
    }
  }

  // Get all requests for admin/principal
  async getAllRequests(userRole: string): Promise<Request[]> {
    try {
      const permissions = this.getRolePermissions(userRole);
      if (!permissions.canViewAuditLogs) {
        throw new Error('Insufficient permissions');
      }

      const requestsRef = ref(database, 'requests');
      const snapshot = await get(requestsRef);
      
      if (!snapshot.exists()) return [];
      
      return Object.values(snapshot.val()).sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) as Request[];
    } catch (error) {
      console.error('Error fetching all requests:', error);
      throw error;
    }
  }

  // Approve or reject a request
  async approveRequest(
    requestId: string, 
    userId: string, 
    userName: string, 
    userRole: string, 
    action: 'approve' | 'reject',
    comment?: string
  ): Promise<void> {
    try {
      const requestRef = ref(database, `requests/${requestId}`);
      const snapshot = await get(requestRef);
      
      if (!snapshot.exists()) {
        throw new Error('Request not found');
      }
      
      const request = snapshot.val() as Request;
      
      // Check if user can approve this request
      if (!this.canApproveRequest(userRole, request.fromUserRole)) {
        throw new Error('Insufficient permissions to approve this request');
      }
      
      const updateData: Partial<Request> = {
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedAt: new Date().toISOString(),
        approvedBy: userId,
        approvedByName: userName,
        updatedAt: new Date().toISOString()
      };
      
      await update(requestRef, updateData);
      
      // Add approval/rejection comment
      if (comment) {
        await this.addComment(requestId, {
          userId,
          userName,
          userRole,
          comment: `${action === 'approve' ? 'Approved' : 'Rejected'}: ${comment}`,
          timestamp: new Date().toISOString(),
          isInternal: false
        });
      }
      
      // Handle auto-forward after approval if needed
      if (action === 'approve') {
        await this.handleAutoForward({
          ...request,
          ...updateData
        });
      }
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  }

  // Add comment to request
  async addComment(requestId: string, comment: Omit<RequestComment, 'id'>): Promise<void> {
    try {
      const commentId = Date.now().toString();
      const fullComment: RequestComment = {
        ...comment,
        id: commentId
      };
      
      const requestRef = ref(database, `requests/${requestId}/comments/${commentId}`);
      await update(requestRef, fullComment);
      
      // Update request timestamp
      await update(ref(database, `requests/${requestId}`), {
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get request statistics
  async getRequestStats(userId: string, userRole: string): Promise<RequestStats> {
    try {
      let requests: Request[];
      
      if (this.getRolePermissions(userRole).canViewAuditLogs) {
        requests = await this.getAllRequests(userRole);
      } else {
        const incoming = await this.getIncomingRequests(userId, userRole);
        const outgoing = await this.getOutgoingRequests(userId);
        requests = [...incoming, ...outgoing];
      }
      
      const stats: RequestStats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        forwarded: requests.filter(r => r.status === 'forwarded').length,
        completed: requests.filter(r => r.status === 'completed').length,
        overdue: requests.filter(r => this.isOverdue(r)).length
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting request stats:', error);
      throw error;
    }
  }

  // Check if request is overdue
  private isOverdue(request: Request): boolean {
    if (!request.maxResponseTime) return false;
    
    const createdAt = new Date(request.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff > request.maxResponseTime;
  }

  // Check if user can approve a request from another role
  private canApproveRequest(userRole: string, fromUserRole: string): boolean {
    const config = HIERARCHY_CONFIG[userRole];
    if (!config) return false;
    
    return config.canApprove.includes(fromUserRole) || 
           config.canApprove.includes('all') ||
           config.canApprove.includes('all_staff') ||
           config.canApprove.includes('all_non_teaching');
  }

  // Get role permissions
  private getRolePermissions(role: string) {
    // This would typically come from the hierarchy config
    // For now, return basic permissions
    return {
      canViewAuditLogs: ['principal', 'registrar', 'admin'].includes(role),
      canViewAllDepartments: ['principal', 'registrar', 'admin'].includes(role)
    };
  }

  // Get available recipients for a user
  async getAvailableRecipients(userRole: string): Promise<Array<{uid: string, name: string, role: string, department?: string}>> {
    try {
      const config = HIERARCHY_CONFIG[userRole];
      if (!config) return [];
      
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) return [];
      
      const users = snapshot.val();
      const availableRecipients: Array<{uid: string, name: string, role: string, department?: string}> = [];
      
      Object.entries(users).forEach(([uid, userData]: [string, any]) => {
        if (config.canSendRequestsTo.includes(userData.role) || 
            config.canSendRequestsTo.includes('all') ||
            config.canSendRequestsTo.includes('all_staff') ||
            config.canSendRequestsTo.includes('all_non_teaching')) {
          availableRecipients.push({
            uid,
            name: userData.name,
            role: userData.role,
            department: userData.department
          });
        }
      });
      
      return availableRecipients;
    } catch (error) {
      console.error('Error getting available recipients:', error);
      throw error;
    }
  }

  // Escalate overdue requests
  async escalateOverdueRequests(): Promise<void> {
    try {
      const requestsRef = ref(database, 'requests');
      const snapshot = await get(requestsRef);
      
      if (!snapshot.exists()) return;
      
      const requests = snapshot.val();
      const now = new Date();
      
      for (const [requestId, request] of Object.entries(requests)) {
        const req = request as Request;
        
        if (req.status === 'pending' && this.isOverdue(req)) {
          // Find next approver in hierarchy
          const nextApprover = getNextApprover(req.toUserRole, req.requestType);
          if (nextApprover) {
            // Escalate to next level
            await update(ref(database, `requests/${requestId}`), {
              escalationLevel: req.escalationLevel + 1,
              updatedAt: now.toISOString()
            });
            
            // Add escalation comment
            await this.addComment(requestId, {
              userId: 'system',
              userName: 'System',
              userRole: 'system',
              comment: `Request escalated due to overdue status`,
              timestamp: now.toISOString(),
              isInternal: true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error escalating overdue requests:', error);
      throw error;
    }
  }
}

export default RequestManager; 