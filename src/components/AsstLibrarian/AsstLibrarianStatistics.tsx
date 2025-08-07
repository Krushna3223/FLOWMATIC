import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';

// Mock API
const fetchStats = async () => ({
  totalBooks: 3200,
  booksIssued: 1200,
  booksAvailable: 2000,
  overdueBooks: 45,
  finesCollected: 3500,
  newBooksThisMonth: 25,
});

const AsstLibrarianStatistics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Library Statistics
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2 
      }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Books</Typography>
            <Typography variant="h4">{stats.totalBooks}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Books Issued</Typography>
            <Typography variant="h4" color="primary.main">{stats.booksIssued}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Books Available</Typography>
            <Typography variant="h4" color="success.main">{stats.booksAvailable}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Overdue Books</Typography>
            <Typography variant="h4" color="warning.main">{stats.overdueBooks}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Fines Collected</Typography>
            <Typography variant="h4" color="info.main">₹{stats.finesCollected}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">New Books This Month</Typography>
            <Typography variant="h4" color="secondary.main">{stats.newBooksThisMonth}</Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AsstLibrarianStatistics;