import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';

// Mock API
const fetchStats = async () => ({
  totalItems: 150,
  lowStockItems: 8,
  pendingRequests: 12,
  itemsIssuedToday: 25,
  itemsReturnedToday: 15,
  totalDepartments: 8,
});

const AsstStoreStatistics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Store Statistics
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2 
      }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Items</Typography>
            <Typography variant="h4">{stats.totalItems}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Low Stock Items</Typography>
            <Typography variant="h4" color="warning.main">{stats.lowStockItems}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Pending Requests</Typography>
            <Typography variant="h4" color="info.main">{stats.pendingRequests}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Items Issued Today</Typography>
            <Typography variant="h4" color="success.main">{stats.itemsIssuedToday}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Items Returned Today</Typography>
            <Typography variant="h4" color="primary.main">{stats.itemsReturnedToday}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Departments</Typography>
            <Typography variant="h4">{stats.totalDepartments}</Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AsstStoreStatistics; 