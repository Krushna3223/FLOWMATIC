import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

// Mock API
const fetchMessages = async () => [
  { id: 1, from: 'Lab Supervisor', message: 'Lab will be closed for maintenance on Friday.', date: '2024-06-01' },
  { id: 2, from: 'Principal', message: 'Submit monthly report by 5th.', date: '2024-05-31' },
  { id: 3, from: 'Student', message: 'Request for new equipment: Digital Balance.', date: '2024-05-30' },
];

const TechnicalLabAssistantCommunication: React.FC = () => {
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

export default TechnicalLabAssistantCommunication;