import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, Checkbox, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

// Mock API
const fetchLabSetup = async () => [
  {
    id: 1,
    lab: 'Computer Lab 101',
    task: 'Check all computers are working',
    status: 'Completed',
    date: '2024-06-01',
  },
  {
    id: 2,
    lab: 'Computer Lab 102',
    task: 'Install new software updates',
    status: 'Pending',
    date: '2024-06-01',
  },
  {
    id: 3,
    lab: 'Computer Lab 103',
    task: 'Test network connectivity',
    status: 'In Progress',
    date: '2024-06-01',
  },
];

const updateTaskStatus = async (id: number, status: string) => true;
const addTask = async (task: any) => true;

const ComputerTechnicianLabSetup: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    lab: '',
    task: '',
  });

  useEffect(() => {
    fetchLabSetup().then(setTasks);
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    await updateTaskStatus(id, status);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const handleSubmit = async () => {
    await addTask(newTask);
    setOpen(false);
    setNewTask({ lab: '', task: '' });
    fetchLabSetup().then(setTasks);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Lab Setup Checklist
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Add New Task
      </Button>
      
      <Paper>
        <List>
          {tasks.map((task) => (
            <ListItem key={task.id}>
              <Checkbox
                checked={task.status === 'Completed'}
                onChange={() => handleStatusChange(task.id, task.status === 'Completed' ? 'Pending' : 'Completed')}
              />
              <ListItemText
                primary={`${task.lab} - ${task.task}`}
                secondary={`Date: ${task.date} | Status: ${task.status}`}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleStatusChange(task.id, 'In Progress')}
                disabled={task.status === 'In Progress'}
              >
                Mark In Progress
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Lab Setup Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Lab Name"
            fullWidth
            value={newTask.lab}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewTask({ ...newTask, lab: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Task Description"
            fullWidth
            multiline
            rows={3}
            value={newTask.task}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewTask({ ...newTask, task: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!newTask.lab || !newTask.task}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComputerTechnicianLabSetup; 