import React from 'react';
import {
  Box, Typography, Paper
} from '@mui/material';

const ClerkStatistics: React.FC = () => {
  const stats = [
    {
      title: 'Total Students',
      value: '1,250',
      change: '+5%',
      changeType: 'positive',
    },
    {
      title: 'Documents Processed',
      value: '45',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Pending Requests',
      value: '8',
      change: '-3',
      changeType: 'negative',
    },
    {
      title: 'Attendance Rate',
      value: '94%',
      change: '+2%',
      changeType: 'positive',
    },
    {
      title: 'Leave Requests',
      value: '23',
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'Reports Generated',
      value: '15',
      change: '+3',
      changeType: 'positive',
    },
  ];

  const recentActivity = [
    {
      action: 'Document processed',
      details: 'Transfer certificate for John Doe',
      time: '2 hours ago',
    },
    {
      action: 'Attendance updated',
      details: 'Daily attendance for Computer Science',
      time: '4 hours ago',
    },
    {
      action: 'Leave request approved',
      details: 'Medical leave for Jane Smith',
      time: '6 hours ago',
    },
    {
      action: 'Report generated',
      details: 'Monthly attendance report',
      time: '1 day ago',
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Statistics & Overview
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4 
      }}>
        {stats.map((stat, index) => (
          <Box key={index} sx={{ 
            flex: '1 1 300px',
            minWidth: '250px'
          }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom>
                {stat.value}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {stat.title}
              </Typography>
              <Typography
                variant="body2"
                color={stat.changeType === 'positive' ? 'success.main' : 'error.main'}
              >
                {stat.change} from last month
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3 
      }}>
        <Box sx={{ flex: '1 1 500px', minWidth: '400px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentActivity.map((activity, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {activity.action}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.details}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 500px', minWidth: '400px' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                • Process pending documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Update attendance records
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Review leave requests
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Generate monthly reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Send notices to students
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ClerkStatistics; 