import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
  List, ListItem, ListItemText, Chip, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

// Mock API
const fetchNotices = async () => [
  {
    id: 1,
    title: 'Holiday Notice - Independence Day',
    type: 'notice',
    content: 'College will be closed on 15th August for Independence Day celebrations.',
    targetAudience: 'all',
    status: 'published',
    publishedAt: '2024-06-01',
    publishedBy: 'Admin',
  },
  {
    id: 2,
    title: 'Exam Schedule Update',
    type: 'circular',
    content: 'Mid-semester examinations will be held from 20th to 25th June.',
    targetAudience: 'students',
    status: 'published',
    publishedAt: '2024-05-30',
    publishedBy: 'Admin',
  },
  {
    id: 3,
    title: 'Staff Meeting Reminder',
    type: 'announcement',
    content: 'Monthly staff meeting scheduled for Friday at 3 PM.',
    targetAudience: 'staff',
    status: 'draft',
    publishedAt: null,
    publishedBy: 'Admin',
  },
];

const addNotice = async (data: any) => true;
const updateNoticeStatus = async (id: number, status: string) => true;

const ClerkNotices: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    type: '',
    content: '',
    targetAudience: '',
  });

  useEffect(() => {
    fetchNotices().then(setNotices);
  }, []);

  const handleAddNotice = async () => {
    if (newNotice.title && newNotice.content) {
      await addNotice(newNotice);
      setDialogOpen(false);
      setNewNotice({ title: '', type: '', content: '', targetAudience: '' });
      fetchNotices().then(setNotices);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateNoticeStatus(id, status);
    fetchNotices().then(setNotices);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'notice': return 'primary';
      case 'circular': return 'secondary';
      case 'announcement': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Notices & Circulars
      </Typography>
      
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>
        Add Notice
      </Button>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {notices.map((notice) => (
          <Paper key={notice.id} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{notice.title}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={notice.type}
                  color={getTypeColor(notice.type)}
                  size="small"
                />
                <Chip
                  label={notice.status}
                  color={getStatusColor(notice.status)}
                  size="small"
                />
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Target: {notice.targetAudience} | Published: {notice.publishedAt || 'Draft'} | By: {notice.publishedBy}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {notice.content}
            </Typography>
            {notice.status === 'draft' && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleStatusUpdate(notice.id, 'published')}
              >
                Publish
              </Button>
            )}
          </Paper>
        ))}
      </Box>

      {/* Add Notice Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Notice</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            value={newNotice.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewNotice({ ...newNotice, title: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={newNotice.type}
              onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value })}
            >
              <MenuItem value="notice">Notice</MenuItem>
              <MenuItem value="circular">Circular</MenuItem>
              <MenuItem value="announcement">Announcement</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Target Audience</InputLabel>
            <Select
              value={newNotice.targetAudience}
              onChange={(e) => setNewNotice({ ...newNotice, targetAudience: e.target.value })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="students">Students</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="faculty">Faculty</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={newNotice.content}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewNotice({ ...newNotice, content: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNotice} variant="contained" disabled={!newNotice.title || !newNotice.content}>
            Add Notice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClerkNotices; 