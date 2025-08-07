import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText
} from '@mui/material';

// Mock API
const fetchMessages = async () => [
  { id: 1, from: 'Principal', message: 'IT infrastructure audit scheduled for next week.', date: '2024-06-01' },
  { id: 2, from: 'Lab Assistant', message: 'New software installation needed in Lab 102.', date: '2024-05-31' },
  { id: 3, from: 'Admin', message: 'Network upgrade project starting next month.', date: '2024-05-30' },
];

const ComputerTechnicianCommunication: React.FC = () => {
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

export default ComputerTechnicianCommunication; 