import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Plus,
  Calendar,
  DollarSign,
  User,
  FileText,
  X
} from 'lucide-react';

// Mock API
const fetchStudents = async () => [
  {
    id: 1,
    studentId: 'STU001',
    name: 'John Doe',
    course: 'Computer Science',
    semester: '3rd Year',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    totalBooksBorrowed: 3,
    booksOverdue: 1,
    totalFines: 50,
    books: [
      {
        id: 1,
        title: 'Introduction to Computer Science',
        author: 'John Smith',
        isbn: '978-1234567890',
        issueDate: '2024-05-15',
        dueDate: '2024-06-15',
        returnDate: null,
        status: 'Borrowed',
        fine: 0,
        location: 'Shelf A1'
      },
      {
        id: 2,
        title: 'Advanced Mathematics',
        author: 'Jane Doe',
        isbn: '978-0987654321',
        issueDate: '2024-04-20',
        dueDate: '2024-05-20',
        returnDate: null,
        status: 'Overdue',
        fine: 50,
        location: 'Shelf B2'
      },
      {
        id: 3,
        title: 'Physics Fundamentals',
        author: 'Mike Johnson',
        isbn: '978-1122334455',
        issueDate: '2024-03-15',
        dueDate: '2024-04-15',
        returnDate: '2024-04-10',
        status: 'Returned',
        fine: 0,
        location: 'Shelf C3'
      }
    ]
  },
  {
    id: 2,
    studentId: 'STU002',
    name: 'Jane Smith',
    course: 'Electrical Engineering',
    semester: '2nd Year',
    email: 'jane.smith@example.com',
    phone: '+91 9876543211',
    totalBooksBorrowed: 2,
    booksOverdue: 0,
    totalFines: 0,
    books: [
      {
        id: 4,
        title: 'Electrical Circuits',
        author: 'Robert Brown',
        isbn: '978-1122334456',
        issueDate: '2024-06-01',
        dueDate: '2024-07-01',
        returnDate: null,
        status: 'Borrowed',
        fine: 0,
        location: 'Shelf D4'
      },
      {
        id: 5,
        title: 'Digital Electronics',
        author: 'Sarah Wilson',
        isbn: '978-1122334457',
        issueDate: '2024-05-10',
        dueDate: '2024-06-10',
        returnDate: '2024-06-05',
        status: 'Returned',
        fine: 0,
        location: 'Shelf E5'
      }
    ]
  },
  {
    id: 3,
    studentId: 'STU003',
    name: 'Mike Johnson',
    course: 'Mechanical Engineering',
    semester: '4th Year',
    email: 'mike.johnson@example.com',
    phone: '+91 9876543212',
    totalBooksBorrowed: 1,
    booksOverdue: 1,
    totalFines: 100,
    books: [
      {
        id: 6,
        title: 'Thermodynamics',
        author: 'David Lee',
        isbn: '978-1122334458',
        issueDate: '2024-04-01',
        dueDate: '2024-05-01',
        returnDate: null,
        status: 'Overdue',
        fine: 100,
        location: 'Shelf F6'
      }
    ]
  }
];

const searchBooks = async (query: string) => [
  {
    id: 1,
    title: 'Introduction to Computer Science',
    author: 'John Smith',
    isbn: '978-1234567890',
    status: 'Available',
    location: 'Shelf A1',
    copies: 3,
    availableCopies: 2
  },
  {
    id: 2,
    title: 'Advanced Mathematics',
    author: 'Jane Doe',
    isbn: '978-0987654321',
    status: 'Available',
    location: 'Shelf B2',
    copies: 2,
    availableCopies: 1
  },
  {
    id: 3,
    title: 'Physics Fundamentals',
    author: 'Mike Johnson',
    isbn: '978-1122334455',
    status: 'Available',
    location: 'Shelf C3',
    copies: 1,
    availableCopies: 1
  }
];

const issueBook = async (data: any) => true;
const returnBook = async (data: any) => true;

const AsstLibrarianStudentManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [newIssue, setNewIssue] = useState({
    bookTitle: '',
    bookId: '',
    studentId: '',
    dueDate: ''
  });
  const [newReturn, setNewReturn] = useState({
    bookTitle: '',
    bookId: '',
    studentId: ''
  });

  useEffect(() => {
    fetchStudents().then(setStudents);
  }, []);

  const handleIssueBook = async () => {
    if (newIssue.bookId && newIssue.studentId && newIssue.dueDate) {
      await issueBook(newIssue);
      setShowIssueModal(false);
      setNewIssue({ bookTitle: '', bookId: '', studentId: '', dueDate: '' });
      fetchStudents().then(setStudents);
    }
  };

  const handleReturnBook = async () => {
    if (newReturn.bookId && newReturn.studentId) {
      await returnBook(newReturn);
      setShowReturnModal(false);
      setNewReturn({ bookTitle: '', bookId: '', studentId: '' });
      fetchStudents().then(setStudents);
    }
  };

  const handleBookSearch = async () => {
    if (bookSearchQuery.trim()) {
      const results = await searchBooks(bookSearchQuery);
      setBooks(results);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Returned':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'Borrowed':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'Overdue':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Returned':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Borrowed':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'Overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const calculateFine = (dueDate: string, returnDate: string | null) => {
    if (!returnDate) return 0;
    const due = new Date(dueDate);
    const returned = new Date(returnDate);
    const diffTime = returned.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * 10 : 0; // ₹10 per day
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'overdue' && student.booksOverdue > 0) ||
                         (statusFilter === 'active' && student.booksOverdue === 0);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-2">
            Manage student information, book borrowing, returns, and fines
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBookSearch(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Search Books
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Issue Book
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Students</option>
            <option value="overdue">With Overdue Books</option>
            <option value="active">Active Borrowers</option>
          </select>
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {filteredStudents.length} of {students.length} students
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <User className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.studentId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {selectedStudent?.id === student.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{student.totalBooksBorrowed}</div>
                  <div className="text-xs text-gray-500">Books Borrowed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{student.booksOverdue}</div>
                  <div className="text-xs text-gray-500">Overdue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">₹{student.totalFines}</div>
                  <div className="text-xs text-gray-500">Total Fines</div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Course:</span>
                  <span className="font-medium">{student.course}</span>
                </div>
                <div className="flex justify-between">
                  <span>Semester:</span>
                  <span className="font-medium">{student.semester}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-medium">{student.email}</span>
                </div>
              </div>

              {/* Student's Books */}
              {selectedStudent?.id === student.id && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Borrowed Books</h4>
                  <div className="space-y-3">
                    {student.books.map((book: any) => (
                      <div key={book.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {getStatusIcon(book.status)}
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(book.status)}`}>
                              {book.status}
                            </span>
                          </div>
                          {book.status === 'Borrowed' && (
                            <button
                              onClick={() => {
                                setNewReturn({ bookTitle: book.title, bookId: book.id.toString(), studentId: student.studentId });
                                setShowReturnModal(true);
                              }}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Return
                            </button>
                          )}
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{book.title}</div>
                          <div className="text-gray-500">by {book.author}</div>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div>
                              <span className="text-gray-500">Issue Date:</span>
                              <div className="font-medium">{book.issueDate}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Due Date:</span>
                              <div className="font-medium">{book.dueDate}</div>
                            </div>
                            {book.returnDate && (
                              <div>
                                <span className="text-gray-500">Return Date:</span>
                                <div className="font-medium">{book.returnDate}</div>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500">Fine:</span>
                              <div className="font-medium">₹{book.fine}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Book</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    value={newIssue.studentId}
                    onChange={(e) => setNewIssue({ ...newIssue, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., STU001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                  <input
                    type="text"
                    value={newIssue.bookTitle}
                    onChange={(e) => setNewIssue({ ...newIssue, bookTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newIssue.dueDate}
                    onChange={(e) => setNewIssue({ ...newIssue, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIssueBook}
                  disabled={!newIssue.studentId || !newIssue.bookTitle || !newIssue.dueDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Issue Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Book Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Return Book</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    value={newReturn.studentId}
                    onChange={(e) => setNewReturn({ ...newReturn, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., STU001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                  <input
                    type="text"
                    value={newReturn.bookTitle}
                    onChange={(e) => setNewReturn({ ...newReturn, bookTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturnBook}
                  disabled={!newReturn.studentId || !newReturn.bookTitle}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Return Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Search Modal */}
      {showBookSearch && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Search Books</h3>
                <button
                  onClick={() => setShowBookSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by title, author, or ISBN..."
                      value={bookSearchQuery}
                      onChange={(e) => setBookSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleBookSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
                {books.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Available Books</h4>
                    <div className="space-y-3">
                      {books.map((book) => (
                        <div key={book.id} className="bg-white rounded-lg p-3 border">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{book.title}</div>
                              <div className="text-sm text-gray-500">by {book.author}</div>
                              <div className="text-xs text-gray-400">ISBN: {book.isbn}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-green-600">{book.status}</div>
                              <div className="text-xs text-gray-500">{book.availableCopies} of {book.copies} available</div>
                              <div className="text-xs text-gray-500">Location: {book.location}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsstLibrarianStudentManagement; 