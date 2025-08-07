import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';

// Mock API
const fetchEquipmentMaintenance = async () => [
  {
    id: 1,
    equipmentName: 'Microscope',
    lab: 'Biology Lab',
    maintenanceType: 'Preventive',
    scheduledDate: '2024-06-05',
    status: 'Scheduled',
    technician: 'John Tech',
    notes: 'Regular cleaning and calibration',
  },
  {
    id: 2,
    equipmentName: 'Centrifuge',
    lab: 'Chemistry Lab',
    maintenanceType: 'Repair',
    scheduledDate: '2024-06-01',
    status: 'In Progress',
    technician: 'John Tech',
    notes: 'Motor replacement needed',
  },
  {
    id: 3,
    equipmentName: 'pH Meter',
    lab: 'Chemistry Lab',
    maintenanceType: 'Calibration',
    scheduledDate: '2024-05-30',
    status: 'Completed',
    technician: 'John Tech',
    notes: 'Calibration completed successfully',
  },
];

const addMaintenance = async (data: any) => true;
const updateMaintenanceStatus = async (id: number, status: string) => true;

const TechnicalLabAssistantEquipmentMaintenance: React.FC = () => {
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    equipmentName: '',
    lab: '',
    maintenanceType: '',
    scheduledDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchEquipmentMaintenance().then(setMaintenance);
  }, []);

  const handleAddMaintenance = async () => {
    if (newMaintenance.equipmentName && newMaintenance.lab) {
      await addMaintenance(newMaintenance);
      setDialogOpen(false);
      setNewMaintenance({ equipmentName: '', lab: '', maintenanceType: '', scheduledDate: '', notes: '' });
      fetchEquipmentMaintenance().then(setMaintenance);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateMaintenanceStatus(id, status);
    fetchEquipmentMaintenance().then(setMaintenance);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Equipment Maintenance
      </Typography>
      
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>
        Schedule Maintenance
      </Button>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Lab</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Scheduled Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maintenance.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.equipmentName}</TableCell>
                  <TableCell>{item.lab}</TableCell>
                  <TableCell>{item.maintenanceType}</TableCell>
                  <TableCell>{item.scheduledDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      color={
                        item.status === 'Completed' ? 'success' :
                        item.status === 'In Progress' ? 'warning' :
                        item.status === 'Scheduled' ? 'info' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>{item.notes}</TableCell>
                  <TableCell>
                    {item.status === 'Scheduled' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusUpdate(item.id, 'In Progress')}
                        sx={{ mr: 1 }}
                      >
                        Start
                      </Button>
                    )}
                    {item.status === 'In Progress' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusUpdate(item.id, 'Completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Maintenance Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Equipment Maintenance</DialogTitle>
        <DialogContent>
          <TextField
            label="Equipment Name"
            fullWidth
            value={newMaintenance.equipmentName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewMaintenance({ ...newMaintenance, equipmentName: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Lab"
            fullWidth
            value={newMaintenance.lab}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewMaintenance({ ...newMaintenance, lab: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Maintenance Type"
            fullWidth
            value={newMaintenance.maintenanceType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewMaintenance({ ...newMaintenance, maintenanceType: e.target.value })
            }
            sx={{ mb: 2 }}
          >
            <option value="Preventive">Preventive</option>
            <option value="Repair">Repair</option>
            <option value="Calibration">Calibration</option>
            <option value="Inspection">Inspection</option>
          </TextField>
          <TextField
            label="Scheduled Date"
            type="date"
            fullWidth
            value={newMaintenance.scheduledDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewMaintenance({ ...newMaintenance, scheduledDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={3}
            value={newMaintenance.notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewMaintenance({ ...newMaintenance, notes: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMaintenance} variant="contained" disabled={!newMaintenance.equipmentName || !newMaintenance.lab}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicalLabAssistantEquipmentMaintenance; 