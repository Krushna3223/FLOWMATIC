import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText
} from '@mui/material';

// Mock API
const fetchMessages = async () => [
  { id: 1, from: 'Principal', message: 'Monthly stock audit scheduled for next week.', date: '2024-06-01' },
  { id: 2, from: 'Workshop Instructor', message: 'Urgent request for safety equipment.', date: '2024-05-31' },
  { id: 3, from: 'Lab Assistant', message: 'New chemicals received, please update inventory.', date: '2024-05-30' },
];

const AsstStoreCommunication: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetchMessages().then(setMessages);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Communication & Alerts
      </Typography>
      <Paper>
        <List>
          {messages.map((msg) => (
            <ListItem key={msg.id}>
              <ListItemText
                primary={`${msg.from}: ${msg.message}`}
                secondary={msg.date}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default AsstStoreCommunication; 