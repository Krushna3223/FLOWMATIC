import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText
} from '@mui/material';

// Mock API
const fetchReports = async () => [
  {
    id: 1,
    title: 'Software Installation Report',
    description: 'Installed new antivirus software on all lab computers',
    date: '2024-06-01',
    type: 'Installation',
    file: null,
  },
  {
    id: 2,
    title: 'System Upgrade Report',
    description: 'Updated operating systems in Computer Lab 101',
    date: '2024-05-30',
    type: 'Upgrade',
    file: null,
  },
];

const submitReport = async (report: any) => true;

const ComputerTechnicianReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    type: 'Installation',
  });

  useEffect(() => {
    fetchReports().then(setReports);
  }, []);

  const handleSubmit = async () => {
    await submitReport(newReport);
    setOpen(false);
    setNewReport({ title: '', description: '', type: 'Installation' });
    fetchReports().then(setReports);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Report Upload (Software Installation, Upgrades)
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Upload New Report
      </Button>
      
      <Paper>
        <List>
          {reports.map((report) => (
            <ListItem key={report.id}>
              <ListItemText
                primary={`${report.title} (${report.type})`}
                secondary={`Date: ${report.date} | ${report.description}`}
              />
              {report.file && (
                <Button href={report.file} target="_blank">
                  View File
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Upload Report</DialogTitle>
        <DialogContent>
          <TextField
            label="Report Title"
            fullWidth
            value={newReport.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewReport({ ...newReport, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newReport.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewReport({ ...newReport, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Report Type"
            fullWidth
            value={newReport.type}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewReport({ ...newReport, type: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => {
              // Handle file upload
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!newReport.title}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComputerTechnicianReports; 