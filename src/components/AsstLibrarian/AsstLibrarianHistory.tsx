import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';

// Mock API
const fetchBorrowingHistory = async (studentId: string) => [
  {
    id: 1,
    bookTitle: 'Introduction to Computer Science',
    studentName: 'John Doe',
    studentId: 'STU001',
    issueDate: '2024-05-15',
    returnDate: '2024-05-30',
    status: 'Returned',
    fine: 0,
  },
  {
    id: 2,
    bookTitle: 'Advanced Mathematics',
    studentName: 'John Doe',
    studentId: 'STU001',
    issueDate: '2024-06-01',
    returnDate: '2024-06-15',
    status: 'Borrowed',
    fine: 0,
  },
  {
    id: 3,
    bookTitle: 'Physics Fundamentals',
    studentName: 'John Doe',
    studentId: 'STU001',
    issueDate: '2024-04-20',
    returnDate: '2024-05-05',
    status: 'Returned',
    fine: 50,
  },
];

const AsstLibrarianHistory: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (studentId.trim()) {
      const results = await fetchBorrowingHistory(studentId);
      setHistory(results);
      setSearched(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Borrowing History Viewer (Limited Access)
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Student ID"
          fullWidth
          value={studentId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStudentId(e.target.value)
          }
          onKeyPress={handleKeyPress}
        />
        <Button 
          variant="contained" 
          onClick={handleSearch}
          disabled={!studentId.trim()}
        >
          Search
        </Button>
      </Box>

      {searched && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Book Title</TableCell>
                  <TableCell>Issue Date</TableCell>
                  <TableCell>Return Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Fine</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.bookTitle}</TableCell>
                    <TableCell>{record.issueDate}</TableCell>
                    <TableCell>{record.returnDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={record.status === 'Returned' ? 'success' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>
                      {record.fine > 0 ? (
                        <Chip label={`₹${record.fine}`} color="error" />
                      ) : (
                        <Chip label="No Fine" color="success" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {searched && history.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No borrowing history found for this student ID.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AsstLibrarianHistory; 