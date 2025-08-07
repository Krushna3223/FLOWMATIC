import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
  List, ListItem, ListItemText, Chip, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

// Mock API
const fetchReports = async () => [
  {
    id: 1,
    title: 'Monthly Attendance Report',
    type: 'attendance',
    period: 'May 2024',
    status: 'completed',
    generatedAt: '2024-06-01',
    generatedBy: 'Clerk',
    downloadUrl: '#',
  },
  {
    id: 2,
    title: 'Document Processing Summary',
    type: 'documents',
    period: 'May 2024',
    status: 'in_progress',
    generatedAt: '2024-06-01',
    generatedBy: 'Clerk',
    downloadUrl: null,
  },
  {
    id: 3,
    title: 'Leave Requests Analysis',
    type: 'leave',
    period: 'May 2024',
    status: 'pending',
    generatedAt: null,
    generatedBy: 'Clerk',
    downloadUrl: null,
  },
];

const generateReport = async (data: any) => true;
const downloadReport = async (id: number) => true;

const ClerkReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    type: '',
    period: '',
  });

  useEffect(() => {
    fetchReports().then(setReports);
  }, []);

  const handleGenerateReport = async () => {
    if (newReport.title && newReport.type) {
      await generateReport(newReport);
      setDialogOpen(false);
      setNewReport({ title: '', type: '', period: '' });
      fetchReports().then(setReports);
    }
  };

  const handleDownload = async (id: number) => {
    await downloadReport(id);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'attendance': return 'primary';
      case 'documents': return 'secondary';
      case 'leave': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Reports
      </Typography>
      
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>
        Generate New Report
      </Button>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {reports.map((report) => (
          <Paper key={report.id} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{report.title}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={report.type}
                  color={getTypeColor(report.type)}
                  size="small"
                />
                <Chip
                  label={report.status}
                  color={getStatusColor(report.status)}
                  size="small"
                />
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Period: {report.period} | Generated: {report.generatedAt || 'Pending'} | By: {report.generatedBy}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {report.status === 'completed' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleDownload(report.id)}
                >
                  Download
                </Button>
              )}
              {report.status === 'pending' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {/* Handle generate */}}
                >
                  Generate
                </Button>
              )}
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Generate Report Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate New Report</DialogTitle>
        <DialogContent>
          <TextField
            label="Report Title"
            fullWidth
            value={newReport.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewReport({ ...newReport, title: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={newReport.type}
              onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
            >
              <MenuItem value="attendance">Attendance Report</MenuItem>
              <MenuItem value="documents">Document Processing Report</MenuItem>
              <MenuItem value="leave">Leave Requests Report</MenuItem>
              <MenuItem value="general">General Report</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Period"
            fullWidth
            value={newReport.period}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewReport({ ...newReport, period: e.target.value })
            }
            placeholder="e.g., May 2024"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleGenerateReport} variant="contained" disabled={!newReport.title || !newReport.type}>
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClerkReports; 