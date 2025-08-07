import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText } from '@mui/material';

// Mock API
const fetchReports = async () => [
  { id: 1, title: 'Microscope Calibration Report', date: '2024-06-01', summary: 'All microscopes calibrated and tested.' },
  { id: 2, title: 'Chemical Inventory Audit', date: '2024-05-30', summary: 'All chemicals accounted for. Low stock on sodium chloride.' },
  { id: 3, title: 'Lab Safety Inspection', date: '2024-05-29', summary: 'No major safety violations found.' },
];
const addReport = async (data: any) => true;

const TechnicalLabAssistantReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({ title: '', summary: '' });

  useEffect(() => {
    fetchReports().then(setReports);
  }, []);

  const handleAddReport = async () => {
    if (newReport.title && newReport.summary) {
      await addReport(newReport);
      setDialogOpen(false);
      setNewReport({ title: '', summary: '' });
      fetchReports().then(setReports);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Lab Reports
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>
        Add Report
      </Button>
      <Paper>
        <List>
          {reports.map((report) => (
            <ListItem key={report.id}>
              <ListItemText
                primary={report.title}
                secondary={<>
                  <Typography variant="body2">Date: {report.date}</Typography>
                  <Typography variant="body2">{report.summary}</Typography>
                </>}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add Lab Report</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            value={newReport.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReport({ ...newReport, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Summary"
            fullWidth
            multiline
            rows={4}
            value={newReport.summary}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReport({ ...newReport, summary: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddReport} variant="contained" disabled={!newReport.title || !newReport.summary}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicalLabAssistantReports;