import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';

// Mock API
const fetchStats = async () => ({
  totalAssets: 45,
  workingAssets: 42,
  brokenAssets: 3,
  complaintsResolved: 15,
  complaintsPending: 2,
  networkIssues: 5,
});

const ComputerTechnicianStatistics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        IT Statistics
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2 
      }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Assets</Typography>
            <Typography variant="h4">{stats.totalAssets}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Working Assets</Typography>
            <Typography variant="h4" color="success.main">{stats.workingAssets}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Broken Assets</Typography>
            <Typography variant="h4" color="error.main">{stats.brokenAssets}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Complaints Resolved</Typography>
            <Typography variant="h4" color="success.main">{stats.complaintsResolved}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Complaints Pending</Typography>
            <Typography variant="h4" color="warning.main">{stats.complaintsPending}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Network Issues</Typography>
            <Typography variant="h4" color="info.main">{stats.networkIssues}</Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ComputerTechnicianStatistics; 