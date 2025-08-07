import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, Chip, Button
} from '@mui/material';

// Mock API
const fetchApprovalQueue = async () => [
  {
    id: 1,
    item: 'Safety Equipment',
    quantity: 10,
    requestedBy: 'Workshop Instructor',
    department: 'Workshop',
    date: '2024-06-01',
    status: 'Pending',
    priority: 'High',
  },
  {
    id: 2,
    item: 'Lab Chemicals',
    quantity: 5,
    requestedBy: 'Lab Assistant',
    department: 'Chemistry Lab',
    date: '2024-05-30',
    status: 'Approved',
    priority: 'Medium',
  },
  {
    id: 3,
    item: 'Computer Parts',
    quantity: 3,
    requestedBy: 'Computer Technician',
    department: 'IT Department',
    date: '2024-05-29',
    status: 'Rejected',
    priority: 'Low',
  },
];

const updateRequestStatus = async (id: number, status: string) => true;

const AsstStoreApprovals: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchApprovalQueue().then(setRequests);
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateRequestStatus(id, status);
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Material/Tool Request Approval Queue
      </Typography>
      
      <Paper>
        <List>
          {requests.map((request) => (
            <ListItem key={request.id}>
              <ListItemText
                primary={`${request.item} (x${request.quantity})`}
                secondary={`Requested by: ${request.requestedBy} | Department: ${request.department} | Date: ${request.date}`}
              />
              <Box>
                <Chip
                  label={request.status}
                  color={getStatusColor(request.status) as any}
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={request.priority}
                  color={request.priority === 'High' ? 'error' : 'default'}
                  sx={{ mr: 1 }}
                />
                {request.status === 'Pending' && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleStatusUpdate(request.id, 'Approved')}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleStatusUpdate(request.id, 'Rejected')}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default AsstStoreApprovals; 