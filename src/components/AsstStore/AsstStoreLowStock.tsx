import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, Chip, Button
} from '@mui/material';

// Mock API
const fetchLowStockAlerts = async () => [
  {
    id: 1,
    item: 'Cutting Tools',
    currentQuantity: 5,
    minQuantity: 15,
    lastUpdated: '2024-06-01',
    priority: 'High',
  },
  {
    id: 2,
    item: 'Safety Gloves',
    currentQuantity: 8,
    minQuantity: 10,
    lastUpdated: '2024-05-30',
    priority: 'Medium',
  },
  {
    id: 3,
    item: 'Lab Chemicals',
    currentQuantity: 2,
    minQuantity: 5,
    lastUpdated: '2024-05-29',
    priority: 'Critical',
  },
];

const AsstStoreLowStock: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchLowStockAlerts().then(setAlerts);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Low Stock Alerts
      </Typography>
      
      <Paper>
        <List>
          {alerts.map((alert) => (
            <ListItem key={alert.id}>
              <ListItemText
                primary={alert.item}
                secondary={`Current: ${alert.currentQuantity} | Minimum: ${alert.minQuantity} | Last Updated: ${alert.lastUpdated}`}
              />
              <Box>
                <Chip
                  label={alert.priority}
                  color={getPriorityColor(alert.priority) as any}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    // Handle restock request
                    alert('Restock request sent for ' + alert.item);
                  }}
                >
                  Request Restock
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default AsstStoreLowStock; 