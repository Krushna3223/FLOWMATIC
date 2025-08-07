import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, Chip
} from '@mui/material';

// Mock API
const fetchActivityLog = async () => [
  {
    id: 1,
    action: 'Item Issued',
    item: 'Safety Gloves',
    quantity: 20,
    user: 'John Doe',
    department: 'Workshop',
    date: '2024-06-01 10:30 AM',
    type: 'Issue',
  },
  {
    id: 2,
    action: 'Stock Updated',
    item: 'Cutting Tools',
    quantity: 15,
    user: 'Store Keeper',
    department: 'Store',
    date: '2024-06-01 09:15 AM',
    type: 'Update',
  },
  {
    id: 3,
    action: 'Item Returned',
    item: 'Lab Equipment',
    quantity: 5,
    user: 'Jane Smith',
    department: 'Chemistry Lab',
    date: '2024-05-31 04:45 PM',
    type: 'Return',
  },
];

const AsstStoreActivity: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchActivityLog().then(setActivities);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Issue': return 'success';
      case 'Return': return 'default';
      case 'Update': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Store Activity Log
      </Typography>
      
      <Paper>
        <List>
          {activities.map((activity) => (
            <ListItem key={activity.id}>
              <ListItemText
                primary={`${activity.action}: ${activity.item} (x${activity.quantity})`}
                secondary={`User: ${activity.user} | Department: ${activity.department} | Date: ${activity.date}`}
              />
              <Chip
                label={activity.type}
                color={getTypeColor(activity.type) as any}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default AsstStoreActivity; 