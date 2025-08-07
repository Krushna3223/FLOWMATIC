import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText
} from '@mui/material';

// Mock API
const fetchReports = async () => [
  {
    id: 1,
    title: 'Monthly Stock Report - May 2024',
    type: 'Monthly',
    date: '2024-06-01',
    file: null,
  },
  {
    id: 2,
    title: 'Weekly Stock Report - Week 22',
    type: 'Weekly',
    date: '2024-05-30',
    file: null,
  },
];

const submitReport = async (report: any) => true;

const AsstStoreReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    type: 'Weekly',
  });

  useEffect(() => {
    fetchReports().then(setReports);
  }, []);

  const handleSubmit = async () => {
    await submitReport(newReport);
    setOpen(false);
    setNewReport({ title: '', type: 'Weekly' });
    fetchReports().then(setReports);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Daily/Monthly Stock Report Upload
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Upload New Report
      </Button>
      
      <Paper>
        <List>
          {reports.map((report) => (
            <ListItem key={report.id}>
              <ListItemText
                primary={report.title}
                secondary={`Type: ${report.type} | Date: ${report.date}`}
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
        <DialogTitle>Upload Stock Report</DialogTitle>
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
            accept=".pdf,.xlsx,.docx"
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

export default AsstStoreReports; 