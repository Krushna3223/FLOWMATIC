import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';

// Mock API
const fetchInventory = async () => [
  {
    id: 1,
    itemName: 'Test Tubes',
    lab: 'Chemistry Lab',
    quantity: 150,
    minQuantity: 50,
    status: 'In Stock',
    lastUpdated: '2024-06-01',
  },
  {
    id: 2,
    itemName: 'Microscope Slides',
    lab: 'Biology Lab',
    quantity: 25,
    minQuantity: 30,
    status: 'Low Stock',
    lastUpdated: '2024-05-30',
  },
  {
    id: 3,
    itemName: 'Safety Goggles',
    lab: 'Physics Lab',
    quantity: 0,
    minQuantity: 20,
    status: 'Out of Stock',
    lastUpdated: '2024-05-29',
  },
];

const addInventoryItem = async (data: any) => true;
const updateInventoryQuantity = async (id: number, quantity: number) => true;

const TechnicalLabAssistantInventory: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    itemName: '',
    lab: '',
    quantity: '',
    minQuantity: '',
  });
  const [updateQuantity, setUpdateQuantity] = useState('');

  useEffect(() => {
    fetchInventory().then(setInventory);
  }, []);

  const handleAddItem = async () => {
    if (newItem.itemName && newItem.lab) {
      await addInventoryItem(newItem);
      setDialogOpen(false);
      setNewItem({ itemName: '', lab: '', quantity: '', minQuantity: '' });
      fetchInventory().then(setInventory);
    }
  };

  const handleUpdateQuantity = async () => {
    if (selectedItem && updateQuantity) {
      await updateInventoryQuantity(selectedItem.id, parseInt(updateQuantity));
      setUpdateDialogOpen(false);
      setSelectedItem(null);
      setUpdateQuantity('');
      fetchInventory().then(setInventory);
    }
  };

  const openUpdateDialog = (item: any) => {
    setSelectedItem(item);
    setUpdateQuantity(item.quantity.toString());
    setUpdateDialogOpen(true);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Inventory Management
      </Typography>
      
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>
        Add Inventory Item
      </Button>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Lab</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Min Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.lab}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.minQuantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      color={
                        item.status === 'In Stock' ? 'success' :
                        item.status === 'Low Stock' ? 'warning' : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell>{item.lastUpdated}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openUpdateDialog(item)}
                    >
                      Update Quantity
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Item Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Inventory Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Name"
            fullWidth
            value={newItem.itemName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewItem({ ...newItem, itemName: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Lab"
            fullWidth
            value={newItem.lab}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewItem({ ...newItem, lab: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={newItem.quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewItem({ ...newItem, quantity: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Minimum Quantity"
            type="number"
            fullWidth
            value={newItem.minQuantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewItem({ ...newItem, minQuantity: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained" disabled={!newItem.itemName || !newItem.lab}>
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Quantity Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Quantity</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Item: {selectedItem.itemName} ({selectedItem.lab})
              </Typography>
              <TextField
                label="New Quantity"
                type="number"
                fullWidth
                value={updateQuantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUpdateQuantity(e.target.value)
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateQuantity} variant="contained" disabled={!updateQuantity}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicalLabAssistantInventory; 