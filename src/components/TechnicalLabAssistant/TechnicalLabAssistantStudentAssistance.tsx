import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Chip, Tabs, Tab
} from '@mui/material';

// Mock API
const fetchStudentAssistance = async () => [
  {
    id: 1,
    studentName: 'John Doe',
    studentId: 'STU001',
    lab: 'Chemistry Lab',
    assistanceType: 'Equipment Setup',
    request: 'Help with setting up titration apparatus',
    status: 'Pending',
    date: '2024-06-01',
    priority: 'Medium',
  },
  {
    id: 2,
    studentName: 'Jane Smith',
    studentId: 'STU002',
    lab: 'Biology Lab',
    assistanceType: 'Safety Guidance',
    request: 'Need guidance on proper microscope handling',
    status: 'In Progress',
    date: '2024-05-30',
    priority: 'High',
  },
  {
    id: 3,
    studentName: 'Mike Johnson',
    studentId: 'STU003',
    lab: 'Physics Lab',
    assistanceType: 'Troubleshooting',
    request: 'Oscilloscope not displaying correctly',
    status: 'Completed',
    date: '2024-05-29',
    priority: 'Low',
  },
];

const addAssistanceRequest = async (data: any) => true;
const updateAssistanceStatus = async (id: number, status: string) => true;

const TechnicalLabAssistantStudentAssistance: React.FC = () => {
  const [assistance, setAssistance] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    studentName: '',
    studentId: '',
    lab: '',
    assistanceType: '',
    request: '',
    priority: '',
  });

  useEffect(() => {
    fetchStudentAssistance().then(setAssistance);
  }, []);

  const handleAddRequest = async () => {
    if (newRequest.studentName && newRequest.request) {
      await addAssistanceRequest(newRequest);
      setDialogOpen(false);
      setNewRequest({ studentName: '', studentId: '', lab: '', assistanceType: '', request: '', priority: '' });
      fetchStudentAssistance().then(setAssistance);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateAssistanceStatus(id, status);
    fetchStudentAssistance().then(setAssistance);
  };

  const filteredAssistance = assistance.filter(item => {
    if (tabValue === 0) return item.status === 'Pending';
    if (tabValue === 1) return item.status === 'In Progress';
    if (tabValue === 2) return item.status === 'Completed';
    return true;
  });

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Student Assistance
      </Typography>
      
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>
        Add Assistance Request
      </Button>

      <Paper>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Pending" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
        
        <Box sx={{ p: 2 }}>
          <List>
            {filteredAssistance.map((item) => (
              <ListItem key={item.id} sx={{ border: 1, borderColor: 'divider', mb: 1, borderRadius: 1 }}>
                <ListItemText
                  primary={`${item.studentName} (${item.studentId}) - ${item.assistanceType}`}
                  secondary={
                    <Box>
                      <Typography variant="body2">Lab: {item.lab}</Typography>
                      <Typography variant="body2">Request: {item.request}</Typography>
                      <Typography variant="body2">Date: {item.date}</Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <Chip
                    label={item.priority}
                    color={
                      item.priority === 'High' ? 'error' :
                      item.priority === 'Medium' ? 'warning' : 'success'
                    }
                    size="small"
                  />
                  <Chip
                    label={item.status}
                    color={
                      item.status === 'Completed' ? 'success' :
                      item.status === 'In Progress' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                  {item.status === 'Pending' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusUpdate(item.id, 'In Progress')}
                    >
                      Start
                    </Button>
                  )}
                  {item.status === 'In Progress' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusUpdate(item.id, 'Completed')}
                    >
                      Complete
                    </Button>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>

      {/* Add Request Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Assistance Request</DialogTitle>
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
          <TextField
            label="Lab"
            fullWidth
            value={newRequest.lab}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRequest({ ...newRequest, lab: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Assistance Type"
            fullWidth
            value={newRequest.assistanceType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRequest({ ...newRequest, assistanceType: e.target.value })
            }
            sx={{ mb: 2 }}
          >
            <option value="Equipment Setup">Equipment Setup</option>
            <option value="Safety Guidance">Safety Guidance</option>
            <option value="Troubleshooting">Troubleshooting</option>
            <option value="Training">Training</option>
          </TextField>
          <TextField
            label="Request Description"
            fullWidth
            multiline
            rows={3}
            value={newRequest.request}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRequest({ ...newRequest, request: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Priority"
            fullWidth
            value={newRequest.priority}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRequest({ ...newRequest, priority: e.target.value })
            }
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddRequest} variant="contained" disabled={!newRequest.studentName || !newRequest.request}>
            Add Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicalLabAssistantStudentAssistance; 