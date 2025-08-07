import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

// Mock API
const fetchHelpDeskTasks = async () => [
  { id: 1, task: 'Assist with book search for student', status: 'Pending', date: '2024-06-01' },
  { id: 2, task: 'Guide new member registration', status: 'Completed', date: '2024-05-30' },
  { id: 3, task: 'Help with e-resource access', status: 'Pending', date: '2024-05-29' },
];
const addHelpDeskTask = async (task: string) => true;
const updateTaskStatus = async (id: number, status: string) => true;

const AsstLibrarianHelpDesk: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchHelpDeskTasks().then(setTasks);
  }, []);

  const handleAddTask = async () => {
    if (newTask.trim()) {
      await addHelpDeskTask(newTask);
      setDialogOpen(false);
      setNewTask('');
      fetchHelpDeskTasks().then(setTasks);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    await updateTaskStatus(id, status);
    fetchHelpDeskTasks().then(setTasks);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Help Desk Tasks
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>
        Add Task
      </Button>
      <Paper>
        <List>
          {tasks.map((task) => (
            <ListItem key={task.id} secondaryAction={
              task.status === 'Pending' ? (
                <Button size="small" variant="outlined" onClick={() => handleStatusChange(task.id, 'Completed')}>
                  Mark Completed
                </Button>
              ) : (
                <Typography color="success.main">Completed</Typography>
              )
            }>
              <ListItemText
                primary={task.task}
                secondary={`Status: ${task.status} | Date: ${task.date}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add Help Desk Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Task Description"
            fullWidth
            value={newTask}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained" disabled={!newTask.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AsstLibrarianHelpDesk;