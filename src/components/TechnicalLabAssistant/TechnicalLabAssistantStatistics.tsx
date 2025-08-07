import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';

// Mock API
const fetchStats = async () => ({
  totalEquipment: 120,
  equipmentWorking: 110,
  equipmentUnderMaintenance: 7,
  equipmentOutOfOrder: 3,
  reportsFiled: 25,
  assistanceRequests: 12,
});

const TechnicalLabAssistantStatistics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Lab Statistics
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2 
      }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Equipment</Typography>
            <Typography variant="h4">{stats.totalEquipment}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Working</Typography>
            <Typography variant="h4" color="success.main">{stats.equipmentWorking}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Under Maintenance</Typography>
            <Typography variant="h4" color="warning.main">{stats.equipmentUnderMaintenance}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Out of Order</Typography>
            <Typography variant="h4" color="error.main">{stats.equipmentOutOfOrder}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Reports Filed</Typography>
            <Typography variant="h4" color="info.main">{stats.reportsFiled}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Assistance Requests</Typography>
            <Typography variant="h4" color="secondary.main">{stats.assistanceRequests}</Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default TechnicalLabAssistantStatistics;