import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Chip
} from '@mui/material';

// Mock API
const fetchIssues = async () => [
  {
    id: 1,
    item: 'Safety Gloves',
    quantity: 20,
    department: 'Workshop',
    issuedTo: 'John Doe',
    date: '2024-06-01',
    status: 'Issued',
  },
  {
    id: 2,
    item: 'Cutting Tools',
    quantity: 5,
    department: 'Lab',
    issuedTo: 'Jane Smith',
    date: '2024-05-30',
    status: 'Pending Return',
  },
];

const updateIssueStatus = async (id: number, status: string) => true;
const addIssue = async (issue: any) => true;

const AsstStoreIssueTracker: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    item: '',
    quantity: 1,
    department: '',
    issuedTo: '',
  });

  useEffect(() => {
    fetchIssues().then(setIssues);
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    await updateIssueStatus(id, status);
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  const handleSubmit = async () => {
    await addIssue(newIssue);
    setOpen(false);
    setNewIssue({ item: '', quantity: 1, department: '', issuedTo: '' });
    fetchIssues().then(setIssues);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Issue Tracker
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Issue New Item
      </Button>
      
      <Paper>
        <List>
          {issues.map((issue) => (
            <ListItem key={issue.id}>
              <ListItemText
                primary={`${issue.item} (x${issue.quantity})`}
                secondary={`Department: ${issue.department} | Issued to: ${issue.issuedTo} | Date: ${issue.date}`}
              />
              <Box>
                <Chip
                  label={issue.status}
                  color={issue.status === 'Issued' ? 'success' : 'warning'}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleStatusChange(issue.id, 'Returned')}
                  disabled={issue.status === 'Returned'}
                >
                  Mark Returned
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Issue New Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Name"
            fullWidth
            value={newIssue.item}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewIssue({ ...newIssue, item: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={newIssue.quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewIssue({ ...newIssue, quantity: Number(e.target.value) })
            }
            sx={{ mb: 2 }}
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Department"
            fullWidth
            value={newIssue.department}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewIssue({ ...newIssue, department: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Issued To"
            fullWidth
            value={newIssue.issuedTo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewIssue({ ...newIssue, issuedTo: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!newIssue.item}>
            Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AsstStoreIssueTracker; 