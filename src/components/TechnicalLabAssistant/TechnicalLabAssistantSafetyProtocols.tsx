import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Chip, Checkbox, FormControlLabel
} from '@mui/material';

// Mock API
const fetchSafetyProtocols = async () => [
  {
    id: 1,
    protocolName: 'Chemical Handling',
    lab: 'Chemistry Lab',
    status: 'Active',
    lastUpdated: '2024-06-01',
    description: 'Proper handling of chemicals and safety equipment',
    checklist: [
      'Wear safety goggles',
      'Use fume hood',
      'Check chemical labels',
      'Have emergency shower access',
    ],
  },
  {
    id: 2,
    protocolName: 'Electrical Safety',
    lab: 'Physics Lab',
    status: 'Active',
    lastUpdated: '2024-05-30',
    description: 'Electrical equipment safety guidelines',
    checklist: [
      'Check for exposed wires',
      'Use grounded outlets',
      'Turn off power before maintenance',
      'Keep water away from electrical equipment',
    ],
  },
  {
    id: 3,
    protocolName: 'Biological Safety',
    lab: 'Biology Lab',
    status: 'Under Review',
    lastUpdated: '2024-05-29',
    description: 'Biological specimen handling protocols',
    checklist: [
      'Wear lab coats',
      'Use gloves',
      'Dispose of waste properly',
      'Sanitize work area',
    ],
  },
];

const addSafetyProtocol = async (data: any) => true;
const updateProtocolStatus = async (id: number, status: string) => true;

const TechnicalLabAssistantSafetyProtocols: React.FC = () => {
  const [protocols, setProtocols] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null);
  const [newProtocol, setNewProtocol] = useState({
    protocolName: '',
    lab: '',
    description: '',
    checklist: [''],
  });

  useEffect(() => {
    fetchSafetyProtocols().then(setProtocols);
  }, []);

  const handleAddProtocol = async () => {
    if (newProtocol.protocolName && newProtocol.lab) {
      await addSafetyProtocol(newProtocol);
      setDialogOpen(false);
      setNewProtocol({ protocolName: '', lab: '', description: '', checklist: [''] });
      fetchSafetyProtocols().then(setProtocols);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateProtocolStatus(id, status);
    fetchSafetyProtocols().then(setProtocols);
  };

  const addChecklistItem = () => {
    setNewProtocol({ ...newProtocol, checklist: [...newProtocol.checklist, ''] });
  };

  const updateChecklistItem = (index: number, value: string) => {
    const updatedChecklist = [...newProtocol.checklist];
    updatedChecklist[index] = value;
    setNewProtocol({ ...newProtocol, checklist: updatedChecklist });
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Safety Protocols
      </Typography>
      
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>
        Add Safety Protocol
      </Button>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {protocols.map((protocol) => (
          <Paper key={protocol.id} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{protocol.protocolName}</Typography>
              <Chip
                label={protocol.status}
                color={protocol.status === 'Active' ? 'success' : 'warning'}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Lab: {protocol.lab} | Last Updated: {protocol.lastUpdated}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {protocol.description}
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Safety Checklist:
            </Typography>
            <List dense>
              {protocol.checklist.map((item: string, index: number) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <FormControlLabel
                    control={<Checkbox />}
                    label={item}
                    sx={{ width: '100%' }}
                  />
                </ListItem>
              ))}
            </List>
            {protocol.status !== 'Active' && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleStatusUpdate(protocol.id, 'Active')}
                sx={{ mt: 1 }}
              >
                Activate Protocol
              </Button>
            )}
          </Paper>
        ))}
      </Box>

      {/* Add Protocol Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Safety Protocol</DialogTitle>
        <DialogContent>
          <TextField
            label="Protocol Name"
            fullWidth
            value={newProtocol.protocolName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProtocol({ ...newProtocol, protocolName: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Lab"
            fullWidth
            value={newProtocol.lab}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProtocol({ ...newProtocol, lab: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newProtocol.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProtocol({ ...newProtocol, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Safety Checklist:
          </Typography>
          {newProtocol.checklist.map((item: string, index: number) => (
            <TextField
              key={index}
              label={`Checklist Item ${index + 1}`}
              fullWidth
              value={item}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateChecklistItem(index, e.target.value)
              }
              sx={{ mb: 1 }}
            />
          ))}
          <Button onClick={addChecklistItem} variant="outlined" sx={{ mt: 1 }}>
            Add Checklist Item
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddProtocol} variant="contained" disabled={!newProtocol.protocolName || !newProtocol.lab}>
            Add Protocol
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicalLabAssistantSafetyProtocols; 