import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';

// Mock API
const fetchInventory = async () => [
  {
    id: 1,
    item: 'Safety Gloves',
    quantity: 50,
    minQuantity: 10,
    location: 'Shelf A1',
    lastUpdated: '2024-06-01',
    status: 'In Stock',
  },
  {
    id: 2,
    item: 'Cutting Tools',
    quantity: 5,
    minQuantity: 15,
    location: 'Shelf B2',
    lastUpdated: '2024-05-30',
    status: 'Low Stock',
  },
];

const updateInventory = async (id: number, quantity: number) => true;
const addInventoryItem = async (item: any) => true;

const AsstStoreInventory: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    item: '',
    quantity: 0,
    minQuantity: 0,
    location: '',
  });

  useEffect(() => {
    fetchInventory().then(setInventory);
  }, []);

  const handleQuantityUpdate = async (id: number, quantity: number) => {
    await updateInventory(id, quantity);
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleAddItem = async () => {
    await addInventoryItem(newItem);
    setOpen(false);
    setNewItem({ item: '', quantity: 0, minQuantity: 0, location: '' });
    fetchInventory().then(setInventory);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Inventory Management Panel
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Add New Item
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Min Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.item}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.minQuantity}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    color={item.status === 'Low Stock' ? 'warning' : 'success'}
                  />
                </TableCell>
                <TableCell>{item.lastUpdated}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const newQty = prompt('Enter new quantity:', item.quantity.toString());
                      if (newQty) handleQuantityUpdate(item.id, Number(newQty));
                    }}
                  >
                    Update Qty
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Name"
            fullWidth
            value={newItem.item}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewItem({ ...newItem, item: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={newItem.quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewItem({ ...newItem, quantity: Number(e.target.value) })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Minimum Quantity"
            type="number"
            fullWidth
            value={newItem.minQuantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewItem({ ...newItem, minQuantity: Number(e.target.value) })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Location"
            fullWidth
            value={newItem.location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewItem({ ...newItem, location: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained" disabled={!newItem.item}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AsstStoreInventory; 