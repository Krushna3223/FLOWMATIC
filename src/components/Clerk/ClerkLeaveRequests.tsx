import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

// Mock API
const fetchLeaveRequests = async () => [
  {
    id: 1,
    studentName: 'John Doe',
    studentId: 'STU001',
    leaveType: 'medical',
    startDate: '2024-06-05',
    endDate: '2024-06-07',
    reason: 'Health checkup',
    status: 'pending',
    submittedAt: '2024-06-01',
  },
  {
    id: 2,
    studentName: 'Jane Smith',
    studentId: 'STU002',
    leaveType: 'personal',
    startDate: '2024-06-10',
    endDate: '2024-06-12',
    reason: 'Family function',
    status: 'approved',
    submittedAt: '2024-05-30',
  },
  {
    id: 3,
    studentName: 'Mike Johnson',
    studentId: 'STU003',
    leaveType: 'emergency',
    startDate: '2024-06-03',
    endDate: '2024-06-03',
    reason: 'Urgent family matter',
    status: 'rejected',
    submittedAt: '2024-05-29',
  },
];

const addLeaveRequest = async (data: any) => true;
const updateLeaveStatus = async (id: number, status: string) => true;

const ClerkLeaveRequests: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    studentName: '',
    studentId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaveRequests().then(setLeaveRequests);
  }, []);

  const handleAddRequest = async () => {
    if (newRequest.studentName && newRequest.leaveType) {
      await addLeaveRequest(newRequest);
      setDialogOpen(false);
      setNewRequest({ studentName: '', studentId: '', leaveType: '', startDate: '', endDate: '', reason: '' });
      fetchLeaveRequests().then(setLeaveRequests);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateLeaveStatus(id, status);
    fetchLeaveRequests().then(setLeaveRequests);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'error';
      case 'medical': return 'warning';
      case 'personal': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Leave Requests
      </Typography>
      
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>
        Add Leave Request
      </Button>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.studentName}</TableCell>
                  <TableCell>{request.studentId}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.leaveType}
                      color={getLeaveTypeColor(request.leaveType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{request.startDate}</TableCell>
                  <TableCell>{request.endDate}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <Box>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleStatusUpdate(request.id, 'approved')}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Leave Request Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Leave Request</DialogTitle>
        <DialogContent>
          <TextField
            label="Student Name"
            fullWidth
            value={newRequest.studentName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRequest({ ...newRequest, studentName: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Student ID"
            fullWidth
            value={newRequest.studentId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRequest({ ...newRequest, studentId: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Leave Type</InputLabel>
            <Select
              value={newRequest.leaveType}
              onChange={(e) => setNewRequest({ ...newRequest, leaveType: e.target.value })}
            >
              <MenuItem value="medical">Medical</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            value={newRequest.startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRequest({ ...newRequest, startDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="End Date"
            type="date"
            fullWidth
            value={newRequest.endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRequest({ ...newRequest, endDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Reason"
            fullWidth
            multiline
            rows={3}
            value={newRequest.reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRequest({ ...newRequest, reason: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddRequest} variant="contained" disabled={!newRequest.studentName || !newRequest.leaveType}>
            Add Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClerkLeaveRequests; 