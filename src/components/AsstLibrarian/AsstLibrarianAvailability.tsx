import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';

// Mock API
const searchBooks = async (query: string) => [
  {
    id: 1,
    title: 'Introduction to Computer Science',
    author: 'John Smith',
    isbn: '978-1234567890',
    status: 'Available',
    location: 'Shelf A1',
    copies: 3,
  },
  {
    id: 2,
    title: 'Advanced Mathematics',
    author: 'Jane Doe',
    isbn: '978-0987654321',
    status: 'Borrowed',
    location: 'Shelf B2',
    copies: 2,
  },
  {
    id: 3,
    title: 'Physics Fundamentals',
    author: 'Mike Johnson',
    isbn: '978-1122334455',
    status: 'Available',
    location: 'Shelf C3',
    copies: 1,
  },
];

const AsstLibrarianAvailability: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchBooks(searchQuery);
      setBooks(results);
      setSearched(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Book Availability Checker
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Search by Title, Author, or ISBN"
          fullWidth
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          onKeyPress={handleKeyPress}
        />
        <Button 
          variant="contained" 
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
        >
          Search
        </Button>
      </Box>

      {searched && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>ISBN</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Copies</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.isbn}</TableCell>
                    <TableCell>
                      <Chip
                        label={book.status}
                        color={book.status === 'Available' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{book.location}</TableCell>
                    <TableCell>{book.copies}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {searched && books.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No books found matching your search criteria.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AsstLibrarianAvailability; 