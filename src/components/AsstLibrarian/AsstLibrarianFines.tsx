import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

// Mock API
const fetchFines = async () => [
  {
    id: 1,
    studentName: 'John Doe',
    studentId: 'STU001',
    bookTitle: 'Physics Fundamentals',
    fineAmount: 50,
    reason: 'Late Return',
    status: 'Pending',
    dueDate: '2024-05-05',
  },
  {
    id: 2,
    studentName: 'Jane Smith',
    studentId: 'STU002',
    bookTitle: 'Advanced Mathematics',
    fineAmount: 100,
    reason: 'Damaged Book',
    status: 'Paid',
    dueDate: '2024-05-10',
  },
  {
    id: 3,
    studentName: 'Mike Johnson',
    studentId: 'STU003',
    bookTitle: 'Computer Science Basics',
    fineAmount: 75,
    reason: 'Late Return',
    status: 'Pending',
    dueDate: '2024-05-15',
  },
];

const updateFineStatus = async (id: number, status: string) => true;

const AsstLibrarianFines: React.FC = () => {
  const [fines, setFines] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchFines().then(setFines);
  }, []);

  const handleStatusUpdate = async () => {
    if (selectedFine && newStatus) {
      await updateFineStatus(selectedFine.id, newStatus);
      setDialogOpen(false);
      setSelectedFine(null);
      setNewStatus('');
      fetchFines().then(setFines);
    }
  };

  const openStatusDialog = (fine: any) => {
    setSelectedFine(fine);
    setNewStatus(fine.status);
    setDialogOpen(true);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Fine Management
      </Typography>
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Book Title</TableCell>
                <TableCell>Fine Amount</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fines.map((fine) => (
                <TableRow key={fine.id}>
                  <TableCell>{fine.studentName}</TableCell>
                  <TableCell>{fine.studentId}</TableCell>
                  <TableCell>{fine.bookTitle}</TableCell>
                  <TableCell>₹{fine.fineAmount}</TableCell>
                  <TableCell>{fine.reason}</TableCell>
                  <TableCell>
                    <Chip
                      label={fine.status}
                      color={fine.status === 'Paid' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>{fine.dueDate}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openStatusDialog(fine)}
                    >
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Status Update Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Update Fine Status</DialogTitle>
        <DialogContent>
          {selectedFine && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Student: {selectedFine.studentName} ({selectedFine.studentId})
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Book: {selectedFine.bookTitle}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Fine Amount: ₹{selectedFine.fineAmount}
              </Typography>
              <TextField
                select
                label="Status"
                fullWidth
                value={newStatus}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewStatus(e.target.value)
                }
                sx={{ mb: 2 }}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Waived">Waived</option>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AsstLibrarianFines; 