import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Chip, Tabs, Tab
} from '@mui/material';

// Mock API
const fetchRecentTransactions = async () => [
  {
    id: 1,
    bookTitle: 'Introduction to Computer Science',
    studentName: 'John Doe',
    studentId: 'STU001',
    action: 'Issued',
    date: '2024-06-01',
    dueDate: '2024-06-15',
  },
  {
    id: 2,
    bookTitle: 'Advanced Mathematics',
    studentName: 'Jane Smith',
    studentId: 'STU002',
    action: 'Returned',
    date: '2024-05-30',
    dueDate: '2024-06-10',
  },
];

const issueBook = async (data: any) => true;
const returnBook = async (data: any) => true;

const AsstLibrarianIssueReturn: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [issueData, setIssueData] = useState({
    bookTitle: '',
    studentName: '',
    studentId: '',
    dueDate: '',
  });
  const [returnData, setReturnData] = useState({
    bookTitle: '',
    studentId: '',
  });

  useEffect(() => {
    fetchRecentTransactions().then(setTransactions);
  }, []);

  const handleIssueSubmit = async () => {
    await issueBook(issueData);
    setIssueOpen(false);
    setIssueData({ bookTitle: '', studentName: '', studentId: '', dueDate: '' });
    fetchRecentTransactions().then(setTransactions);
  };

  const handleReturnSubmit = async () => {
    await returnBook(returnData);
    setReturnOpen(false);
    setReturnData({ bookTitle: '', studentId: '' });
    fetchRecentTransactions().then(setTransactions);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Issue/Return Interface
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={() => setIssueOpen(true)} 
          sx={{ mr: 2 }}
        >
          Issue Book
        </Button>
        <Button 
          variant="contained" 
          onClick={() => setReturnOpen(true)}
        >
          Return Book
        </Button>
      </Box>

      <Paper>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Recent Transactions" />
          <Tab label="Overdue Books" />
        </Tabs>
        
        <Box sx={{ p: 2 }}>
          {tabValue === 0 && (
            <List>
              {transactions.map((transaction) => (
                <ListItem key={transaction.id}>
                  <ListItemText
                    primary={`${transaction.bookTitle} - ${transaction.studentName}`}
                    secondary={`Student ID: ${transaction.studentId} | Due: ${transaction.dueDate}`}
                  />
                  <Chip
                    label={transaction.action}
                    color={transaction.action === 'Issued' ? 'primary' : 'success'}
                  />
                </ListItem>
              ))}
            </List>
          )}
          {tabValue === 1 && (
            <Typography variant="body1" sx={{ p: 2 }}>
              No overdue books found.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Issue Book Dialog */}
      <Dialog open={issueOpen} onClose={() => setIssueOpen(false)}>
        <DialogTitle>Issue Book</DialogTitle>
        <DialogContent>
          <TextField
            label="Book Title"
            fullWidth
            value={issueData.bookTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setIssueData({ ...issueData, bookTitle: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Student Name"
            fullWidth
            value={issueData.studentName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setIssueData({ ...issueData, studentName: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Student ID"
            fullWidth
            value={issueData.studentId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setIssueData({ ...issueData, studentId: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            value={issueData.dueDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setIssueData({ ...issueData, dueDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueOpen(false)}>Cancel</Button>
          <Button onClick={handleIssueSubmit} variant="contained" disabled={!issueData.bookTitle}>
            Issue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return Book Dialog */}
      <Dialog open={returnOpen} onClose={() => setReturnOpen(false)}>
        <DialogTitle>Return Book</DialogTitle>
        <DialogContent>
          <TextField
            label="Book Title"
            fullWidth
            value={returnData.bookTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setReturnData({ ...returnData, bookTitle: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Student ID"
            fullWidth
            value={returnData.studentId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setReturnData({ ...returnData, studentId: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnOpen(false)}>Cancel</Button>
          <Button onClick={handleReturnSubmit} variant="contained" disabled={!returnData.bookTitle}>
            Return
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AsstLibrarianIssueReturn; 