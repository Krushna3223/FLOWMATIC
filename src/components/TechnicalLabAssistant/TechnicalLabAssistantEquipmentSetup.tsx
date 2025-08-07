import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';

// Mock API
const fetchEquipmentSetup = async () => [
  {
    id: 1,
    equipmentName: 'Microscope',
    lab: 'Biology Lab',
    setupStatus: 'Completed',
    setupDate: '2024-06-01',
    technician: 'John Tech',
    notes: 'All microscopes calibrated and ready',
  },
  {
    id: 2,
    equipmentName: 'Bunsen Burner',
    lab: 'Chemistry Lab',
    setupStatus: 'In Progress',
    setupDate: '2024-06-01',
    technician: 'John Tech',
    notes: 'Gas lines need checking',
  },
  {
    id: 3,
    equipmentName: 'Computer Workstations',
    lab: 'Computer Lab',
    setupStatus: 'Pending',
    setupDate: '2024-06-02',
    technician: 'John Tech',
    notes: 'Software installation pending',
  },
];

const addEquipmentSetup = async (data: any) => true;
const updateSetupStatus = async (id: number, status: string) => true;

const TechnicalLabAssistantEquipmentSetup: React.FC = () => {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSetup, setNewSetup] = useState({
    equipmentName: '',
    lab: '',
    setupDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchEquipmentSetup().then(setEquipment);
  }, []);

  const handleAddSetup = async () => {
    if (newSetup.equipmentName && newSetup.lab) {
      await addEquipmentSetup(newSetup);
      setDialogOpen(false);
      setNewSetup({ equipmentName: '', lab: '', setupDate: '', notes: '' });
      fetchEquipmentSetup().then(setEquipment);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateSetupStatus(id, status);
    fetchEquipmentSetup().then(setEquipment);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Lab Equipment Setup
      </Typography>
      
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>
        Add Equipment Setup
      </Button>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Lab</TableCell>
                <TableCell>Setup Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.equipmentName}</TableCell>
                  <TableCell>{item.lab}</TableCell>
                  <TableCell>{item.setupDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.setupStatus}
                      color={
                        item.setupStatus === 'Completed' ? 'success' :
                        item.setupStatus === 'In Progress' ? 'warning' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>{item.notes}</TableCell>
                  <TableCell>
                    {item.setupStatus !== 'Completed' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusUpdate(item.id, 'Completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Setup Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Equipment Setup</DialogTitle>
        <DialogContent>
          <TextField
            label="Equipment Name"
            fullWidth
            value={newSetup.equipmentName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewSetup({ ...newSetup, equipmentName: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Lab"
            fullWidth
            value={newSetup.lab}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewSetup({ ...newSetup, lab: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Setup Date"
            type="date"
            fullWidth
            value={newSetup.setupDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewSetup({ ...newSetup, setupDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={3}
            value={newSetup.notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewSetup({ ...newSetup, notes: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSetup} variant="contained" disabled={!newSetup.equipmentName || !newSetup.lab}>
            Add Setup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicalLabAssistantEquipmentSetup; 