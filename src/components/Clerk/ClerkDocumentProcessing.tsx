import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

// Mock API
const fetchDocuments = async () => [
  {
    id: 1,
    title: 'Student Transfer Certificate',
    type: 'transfer',
    status: 'pending',
    submittedBy: 'John Doe',
    submittedAt: '2024-06-01',
    priority: 'medium',
    notes: 'Transfer from ABC College',
  },
  {
    id: 2,
    title: 'Fee Receipt Verification',
    type: 'fee_receipt',
    status: 'processing',
    submittedBy: 'Jane Smith',
    submittedAt: '2024-05-30',
    priority: 'high',
    notes: 'Payment verification needed',
  },
  {
    id: 3,
    title: 'Character Certificate',
    type: 'certificate',
    status: 'approved',
    submittedBy: 'Mike Johnson',
    submittedAt: '2024-05-29',
    priority: 'low',
    notes: 'For job application',
  },
];

const addDocument = async (data: any) => true;
const updateDocumentStatus = async (id: number, status: string) => true;

const ClerkDocumentProcessing: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: '',
    submittedBy: '',
    priority: '',
    notes: '',
  });

  useEffect(() => {
    fetchDocuments().then(setDocuments);
  }, []);

  const handleAddDocument = async () => {
    if (newDocument.title && newDocument.type) {
      await addDocument(newDocument);
      setDialogOpen(false);
      setNewDocument({ title: '', type: '', submittedBy: '', priority: '', notes: '' });
      fetchDocuments().then(setDocuments);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateDocumentStatus(id, status);
    fetchDocuments().then(setDocuments);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'processing': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'default';
      default: return 'success';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Document Processing
      </Typography>
      
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>
        Add Document
      </Button>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Submitted Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>
                    <Chip label={doc.type.replace('_', ' ')} size="small" />
                  </TableCell>
                  <TableCell>{doc.submittedBy}</TableCell>
                  <TableCell>
                    <Chip
                      label={doc.status}
                      color={getStatusColor(doc.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.priority}
                      color={getPriorityColor(doc.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{doc.submittedAt}</TableCell>
                  <TableCell>
                    {doc.status === 'pending' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusUpdate(doc.id, 'processing')}
                        sx={{ mr: 1 }}
                      >
                        Start Processing
                      </Button>
                    )}
                    {doc.status === 'processing' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusUpdate(doc.id, 'approved')}
                      >
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Document Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Document</DialogTitle>
        <DialogContent>
          <TextField
            label="Document Title"
            fullWidth
            value={newDocument.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewDocument({ ...newDocument, title: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={newDocument.type}
              onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
            >
              <MenuItem value="application">Application</MenuItem>
              <MenuItem value="certificate">Certificate</MenuItem>
              <MenuItem value="fee_receipt">Fee Receipt</MenuItem>
              <MenuItem value="transfer">Transfer</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Submitted By"
            fullWidth
            value={newDocument.submittedBy}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewDocument({ ...newDocument, submittedBy: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={newDocument.priority}
              onChange={(e) => setNewDocument({ ...newDocument, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={3}
            value={newDocument.notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewDocument({ ...newDocument, notes: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddDocument} variant="contained" disabled={!newDocument.title || !newDocument.type}>
            Add Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClerkDocumentProcessing; 