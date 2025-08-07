import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, Chip
} from '@mui/material';

// Mock API
const fetchMessages = async () => [
  {
    id: 1,
    type: 'alert',
    title: 'Document Processing Alert',
    message: '5 new documents require processing',
    timestamp: '2024-06-01 10:30 AM',
    priority: 'high',
  },
  {
    id: 2,
    type: 'notice',
    title: 'Attendance Update Required',
    message: 'Daily attendance for Computer Science department needs to be updated',
    timestamp: '2024-06-01 09:15 AM',
    priority: 'medium',
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Leave Request Pending',
    message: '3 leave requests are awaiting approval',
    timestamp: '2024-06-01 08:45 AM',
    priority: 'medium',
  },
  {
    id: 4,
    type: 'info',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Sunday from 2-4 AM',
    timestamp: '2024-05-31 05:00 PM',
    priority: 'low',
  },
];

const ClerkCommunication: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetchMessages().then(setMessages);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert': return 'error';
      case 'notice': return 'warning';
      case 'reminder': return 'info';
      case 'info': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Communication & Alerts
      </Typography>
      
      <Paper>
        <List>
          {messages.map((message) => (
            <ListItem key={message.id} divider>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{message.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={message.type}
                        color={getTypeColor(message.type)}
                        size="small"
                      />
                      <Chip
                        label={message.priority}
                        color={getPriorityColor(message.priority)}
                        size="small"
                      />
                    </Box>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {message.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {message.timestamp}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default ClerkCommunication; 