import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Lab Equipment Setup', to: '/technical-lab-assistant/equipment-setup' },
  { label: 'Safety Protocols', to: '/technical-lab-assistant/safety-protocols' },
  { label: 'Equipment Maintenance', to: '/technical-lab-assistant/equipment-maintenance' },
  { label: 'Inventory Management', to: '/technical-lab-assistant/inventory' },
  { label: 'Student Assistance', to: '/technical-lab-assistant/student-assistance' },
  { label: 'Lab Reports', to: '/technical-lab-assistant/reports' },
  { label: 'Statistics', to: '/technical-lab-assistant/statistics' },
  { label: 'Communication', to: '/technical-lab-assistant/communication' },
];

const TechnicalLabAssistantDashboard: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Technical Lab Assistant Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome! Manage lab equipment, safety protocols, and student assistance from here.
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2, 
        mt: 2 
      }}>
        {quickLinks.map((link) => (
          <Box key={link.label} sx={{ 
            flex: '1 1 300px',
            minWidth: '250px'
          }}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{link.label}</Typography>
              <Button
                component={Link}
                to={link.to}
                variant="contained"
                sx={{ mt: 1 }}
                fullWidth
              >
                Go
              </Button>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TechnicalLabAssistantDashboard; 