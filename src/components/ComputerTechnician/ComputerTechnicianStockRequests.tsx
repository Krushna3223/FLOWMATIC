import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Chip
} from '@mui/material';

// Mock API
const fetchStockRequests = async () => [
  {
    id: 1,
    item: 'RAM Modules',
    quantity: 4,
    status: 'Pending',
    date: '2024-06-01',
    priority: 'High',
  },
  {
    id: 2,
    item: 'Network Cables',
    quantity: 10,
    status: 'Approved',
    date: '2024-05-30',
    priority: 'Medium',
  },
];

const submitStockRequest = async (request: any) => true;

const ComputerTechnicianStockRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    item: '',
    quantity: 1,
    priority: 'Medium',
  });

  useEffect(() => {
    fetchStockRequests().then(setRequests);
  }, []);

  const handleSubmit = async () => {
    await submitStockRequest(newRequest);
    setOpen(false);
    setNewRequest({ item: '', quantity: 1, priority: 'Medium' });
    fetchStockRequests().then(setRequests);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Request Tool/Part from Store
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        New Stock Request
      </Button>
      
      <Paper>
        <List>
          {requests.map((request) => (
            <ListItem key={request.id}>
              <ListItemText
                primary={`${request.item} (x${request.quantity})`}
                secondary={`Date: ${request.date} | Priority: ${request.priority}`}
              />
              <Chip
                label={request.status}
                color={request.status === 'Approved' ? 'success' : 'warning'}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>New Stock Request</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Name"
            fullWidth
            value={newRequest.item}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRequest({ ...newRequest, item: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={newRequest.quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRequest({ ...newRequest, quantity: Number(e.target.value) })
            }
            sx={{ mb: 2 }}
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Priority"
            fullWidth
            value={newRequest.priority}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRequest({ ...newRequest, priority: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!newRequest.item}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComputerTechnicianStockRequests; 