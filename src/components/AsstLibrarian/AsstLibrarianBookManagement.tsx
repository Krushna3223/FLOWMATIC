import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, set, get, remove, update } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  available: number;
  location: string;
  status: 'available' | 'low_stock' | 'out_of_stock';
  addedAt: string;
  lastUpdated: string;
}

interface BookIssue {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  issueDate: string;
  dueDate: string;
  status: 'issued' | 'returned' | 'overdue';
  fine?: number;
}

const AsstLibrarianBookManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [bookIssues, setBookIssues] = useState<BookIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showIssueBook, setShowIssueBook] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('books');

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: 1,
    location: ''
  });

  const [issueForm, setIssueForm] = useState({
    bookId: '',
    studentId: '',
    studentName: '',
    dueDate: ''
  });

  const categories = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Engineering',
    'Literature',
    'History',
    'Philosophy',
    'Economics',
    'Psychology',
    'Other'
  ];

  useEffect(() => {
    fetchBooks();
    fetchBookIssues();
  }, []);

  const fetchBooks = async () => {
    try {
      const db = getDatabase();
      const booksRef = ref(db, 'books');
      const snapshot = await get(booksRef);
      
      if (snapshot.exists()) {
        const booksData = snapshot.val();
        const booksArray = Object.keys(booksData).map(key => ({
          id: key,
          ...booksData[key]
        }));
        setBooks(booksArray);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
    }
  };

  const fetchBookIssues = async () => {
    try {
      const db = getDatabase();
      const issuesRef = ref(db, 'bookIssues');
      const snapshot = await get(issuesRef);
      
      if (snapshot.exists()) {
        const issuesData = snapshot.val();
        const issuesArray = Object.keys(issuesData).map(key => ({
          id: key,
          ...issuesData[key]
        }));
        setBookIssues(issuesArray);
      } else {
        setBookIssues([]);
      }
    } catch (error) {
      console.error('Error fetching book issues:', error);
      toast.error('Failed to fetch book issues');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookForm.title || !bookForm.author || !bookForm.isbn) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const db = getDatabase();
      const booksRef = ref(db, 'books');
      const newBookRef = push(booksRef);
      
      const bookData = {
        ...bookForm,
        available: bookForm.quantity,
        status: bookForm.quantity > 0 ? 'available' : 'out_of_stock',
        addedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      await set(newBookRef, bookData);
      toast.success('Book added successfully');
      setShowAddBook(false);
      setBookForm({
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: 1,
        location: ''
      });
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Failed to add book');
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueForm.bookId || !issueForm.studentId || !issueForm.studentName || !issueForm.dueDate) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const db = getDatabase();
      const issuesRef = ref(db, 'bookIssues');
      const newIssueRef = push(issuesRef);
      
      const selectedBook = books.find(book => book.id === issueForm.bookId);
      if (!selectedBook || selectedBook.available <= 0) {
        toast.error('Book is not available');
        return;
      }

      const issueData = {
        bookId: issueForm.bookId,
        bookTitle: selectedBook.title,
        studentId: issueForm.studentId,
        studentName: issueForm.studentName,
        issueDate: new Date().toISOString(),
        dueDate: new Date(issueForm.dueDate).toISOString(),
        status: 'issued'
      };

      await set(newIssueRef, issueData);

      // Update book availability
      const bookRef = ref(db, `books/${issueForm.bookId}`);
      await update(bookRef, {
        available: selectedBook.available - 1,
        lastUpdated: new Date().toISOString()
      });

      toast.success('Book issued successfully');
      setShowIssueBook(false);
      setIssueForm({
        bookId: '',
        studentId: '',
        studentName: '',
        dueDate: ''
      });
      fetchBooks();
      fetchBookIssues();
    } catch (error) {
      console.error('Error issuing book:', error);
      toast.error('Failed to issue book');
    }
  };

  const handleReturnBook = async (issueId: string) => {
    try {
      const db = getDatabase();
      const issue = bookIssues.find(i => i.id === issueId);
      if (!issue) return;

      // Update issue status
      const issueRef = ref(db, `bookIssues/${issueId}`);
      await update(issueRef, {
        status: 'returned',
        returnedAt: new Date().toISOString()
      });

      // Update book availability
      const bookRef = ref(db, `books/${issue.bookId}`);
      const book = books.find(b => b.id === issue.bookId);
      if (book) {
        await update(bookRef, {
          available: book.available + 1,
          lastUpdated: new Date().toISOString()
        });
      }

      toast.success('Book returned successfully');
      fetchBooks();
      fetchBookIssues();
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error('Failed to return book');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const db = getDatabase();
        const bookRef = ref(db, `books/${bookId}`);
        await remove(bookRef);
        toast.success('Book deleted successfully');
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error('Failed to delete book');
      }
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'returned': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Management</h1>
              <p className="text-gray-600">Manage library books, inventory, and book issues</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowIssueBook(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Issue Book
              </button>
              <button
                onClick={() => setShowAddBook(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Book
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
            {[
              { id: 'books', name: 'Books', icon: BookOpen },
              { id: 'issues', name: 'Book Issues', icon: Users },
              { id: 'overdue', name: 'Overdue', icon: AlertTriangle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? "bg-white shadow-md text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Books Tab */}
          {activeTab === 'books' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <div key={book.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{book.title}</h3>
                      <p className="text-gray-600 mb-1">By {book.author}</p>
                      <p className="text-sm text-gray-500 mb-2">ISBN: {book.isbn}</p>
                      <p className="text-sm text-gray-500 mb-2">Category: {book.category}</p>
                      <p className="text-sm text-gray-500 mb-2">Location: {book.location}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="text-gray-600">Total: {book.quantity}</p>
                      <p className="text-gray-600">Available: {book.available}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                      {book.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Book Issues Tab */}
          {activeTab === 'issues' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{issue.bookTitle}</div>
                          <div className="text-sm text-gray-500">ID: {issue.bookId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{issue.studentName}</div>
                          <div className="text-sm text-gray-500">ID: {issue.studentId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(issue.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(issue.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {issue.status === 'issued' && (
                          <button
                            onClick={() => handleReturnBook(issue.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Overdue Tab */}
          {activeTab === 'overdue' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Overdue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookIssues
                    .filter(issue => issue.status === 'issued' && new Date(issue.dueDate) < new Date())
                    .map((issue) => {
                      const dueDate = new Date(issue.dueDate);
                      const today = new Date();
                      const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                      const fine = daysOverdue * 5; // $5 per day
                      
                      return (
                        <tr key={issue.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{issue.bookTitle}</div>
                              <div className="text-sm text-gray-500">ID: {issue.bookId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{issue.studentName}</div>
                              <div className="text-sm text-gray-500">ID: {issue.studentId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dueDate.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            {daysOverdue} days
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            ${fine}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleReturnBook(issue.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Return
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Book</h3>
              <button
                onClick={() => setShowAddBook(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                <input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ISBN *</label>
                <input
                  type="text"
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={bookForm.category}
                  onChange={(e) => setBookForm({...bookForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={bookForm.quantity}
                  onChange={(e) => setBookForm({...bookForm, quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={bookForm.location}
                  onChange={(e) => setBookForm({...bookForm, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Add Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBook(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {showIssueBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Issue Book</h3>
              <button
                onClick={() => setShowIssueBook(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Book *</label>
                <select
                  value={issueForm.bookId}
                  onChange={(e) => setIssueForm({...issueForm, bookId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Book</option>
                  {books.filter(book => book.available > 0).map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} - {book.author} (Available: {book.available})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student ID *</label>
                <input
                  type="text"
                  value={issueForm.studentId}
                  onChange={(e) => setIssueForm({...issueForm, studentId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
                <input
                  type="text"
                  value={issueForm.studentName}
                  onChange={(e) => setIssueForm({...issueForm, studentName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                <input
                  type="date"
                  value={issueForm.dueDate}
                  onChange={(e) => setIssueForm({...issueForm, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Issue Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowIssueBook(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsstLibrarianBookManagement; 