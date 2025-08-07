import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

// Mock API
const addNewBook = async (book: any) => true;
const fetchRecentBooks = async () => [
  { id: 1, title: 'Modern Chemistry', author: 'A. B. Chemist', isbn: '978-1111111111', date: '2024-06-01' },
  { id: 2, title: 'World History', author: 'C. D. Historian', isbn: '978-2222222222', date: '2024-05-30' },
];

const AsstLibrarianNewBooks: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '' });
  const [recentBooks, setRecentBooks] = useState<any[]>([]);

  const handleAddBook = async () => {
    if (newBook.title && newBook.author && newBook.isbn) {
      await addNewBook(newBook);
      setDialogOpen(false);
      setNewBook({ title: '', author: '', isbn: '' });
      fetchRecentBooks().then(setRecentBooks);
    }
  };

  React.useEffect(() => {
    fetchRecentBooks().then(setRecentBooks);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        New Book Entry
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>
        Add New Book
      </Button>
      <Paper>
        <List>
          {recentBooks.map((book) => (
            <ListItem key={book.id}>
              <ListItemText
                primary={`${book.title} by ${book.author}`}
                secondary={`ISBN: ${book.isbn} | Added: ${book.date}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add New Book</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            value={newBook.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({ ...newBook, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Author"
            fullWidth
            value={newBook.author}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({ ...newBook, author: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="ISBN"
            fullWidth
            value={newBook.isbn}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({ ...newBook, isbn: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddBook} variant="contained" disabled={!newBook.title || !newBook.author || !newBook.isbn}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AsstLibrarianNewBooks;