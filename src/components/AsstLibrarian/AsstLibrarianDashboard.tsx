import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import { 
  BookOpen, 
  Users, 
  Clock, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  Plus,
  Edit,
  Trash2,
  Book,
  Library,
  MessageSquare,
  BarChart3,
  FileText,
  Calendar,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BookIssue {
  id: string;
  studentId: string;
  studentName: string;
  bookTitle: string;
  bookId: string;
  issueDate: string;
  dueDate: string;
  status: 'issued' | 'returned' | 'overdue';
  returnedDate?: string;
}

interface BookAvailability {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  location: string;
  status: 'available' | 'limited' | 'unavailable';
}

interface FineRecord {
  id: string;
  studentId: string;
  studentName: string;
  bookTitle: string;
  amount: number;
  reason: string;
  status: 'pending' | 'paid' | 'waived';
  dueDate: string;
  paidDate?: string;
}

interface LibraryStatistics {
  totalBooks: number;
  totalStudents: number;
  activeIssues: number;
  overdueBooks: number;
  totalFines: number;
  pendingFines: number;
  popularCategories: string[];
  monthlyIssues: number;
}

const AsstLibrarianDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  console.log('AsstLibrarianDashboard loaded - User:', currentUser?.role, 'Path:', location.pathname);
  const [bookIssues, setBookIssues] = useState<BookIssue[]>([]);
  const [bookAvailability, setBookAvailability] = useState<BookAvailability[]>([]);
  const [fineRecords, setFineRecords] = useState<FineRecord[]>([]);
  const [statistics, setStatistics] = useState<LibraryStatistics>({
    totalBooks: 0,
    totalStudents: 0,
    activeIssues: 0,
    overdueBooks: 0,
    totalFines: 0,
    pendingFines: 0,
    popularCategories: [],
    monthlyIssues: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockBookIssues: BookIssue[] = [
        {
          id: 'ISSUE001',
          studentId: 'ST001',
          studentName: 'John Doe',
          bookTitle: 'Introduction to Computer Science',
          bookId: 'BK001',
          issueDate: '2024-01-10T10:30:00Z',
          dueDate: '2024-02-10T10:30:00Z',
          status: 'issued'
        },
        {
          id: 'ISSUE002',
          studentId: 'ST002',
          studentName: 'Jane Smith',
          bookTitle: 'Advanced Mathematics',
          bookId: 'BK002',
          issueDate: '2024-01-05T14:20:00Z',
          dueDate: '2024-02-05T14:20:00Z',
          status: 'overdue'
        },
        {
          id: 'ISSUE003',
          studentId: 'ST003',
          studentName: 'Mike Johnson',
          bookTitle: 'Physics Fundamentals',
          bookId: 'BK003',
          issueDate: '2024-01-12T09:15:00Z',
          dueDate: '2024-02-12T09:15:00Z',
          status: 'returned',
          returnedDate: '2024-01-25T16:45:00Z'
        }
      ];
      setBookIssues(mockBookIssues);

      const mockBookAvailability: BookAvailability[] = [
        {
          id: 'BK001',
          title: 'Introduction to Computer Science',
          author: 'John Smith',
          isbn: '978-0-123456-78-9',
          category: 'Computer Science',
          totalCopies: 5,
          availableCopies: 3,
          location: 'Shelf A1',
          status: 'available'
        },
        {
          id: 'BK002',
          title: 'Advanced Mathematics',
          author: 'Sarah Wilson',
          isbn: '978-0-987654-32-1',
          category: 'Mathematics',
          totalCopies: 3,
          availableCopies: 0,
          location: 'Shelf B2',
          status: 'unavailable'
        },
        {
          id: 'BK003',
          title: 'Physics Fundamentals',
          author: 'David Brown',
          isbn: '978-0-555555-55-5',
          category: 'Physics',
          totalCopies: 4,
          availableCopies: 1,
          location: 'Shelf C3',
          status: 'limited'
        }
      ];
      setBookAvailability(mockBookAvailability);

      const mockFineRecords: FineRecord[] = [
        {
          id: 'FINE001',
          studentId: 'ST002',
          studentName: 'Jane Smith',
          bookTitle: 'Advanced Mathematics',
          amount: 25.00,
          reason: 'Overdue book return',
          status: 'pending',
          dueDate: '2024-02-05T14:20:00Z'
        },
        {
          id: 'FINE002',
          studentId: 'ST004',
          studentName: 'Sarah Wilson',
          bookTitle: 'Chemistry Basics',
          amount: 15.00,
          reason: 'Late return',
          status: 'paid',
          dueDate: '2024-01-20T10:30:00Z',
          paidDate: '2024-01-22T14:15:00Z'
        }
      ];
      setFineRecords(mockFineRecords);

      // Calculate statistics
      const stats: LibraryStatistics = {
        totalBooks: mockBookAvailability.length,
        totalStudents: 150,
        activeIssues: mockBookIssues.filter(issue => issue.status === 'issued').length,
        overdueBooks: mockBookIssues.filter(issue => issue.status === 'overdue').length,
        totalFines: mockFineRecords.reduce((sum, fine) => sum + fine.amount, 0),
        pendingFines: mockFineRecords.filter(fine => fine.status === 'pending').reduce((sum, fine) => sum + fine.amount, 0),
        popularCategories: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry'],
        monthlyIssues: 45
      };
      setStatistics(stats);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Library Management Dashboard</h1>
        <p className="text-gray-600">Manage book issues, returns, fines, and library operations</p>
        <p className="text-sm text-red-600">User Role: {currentUser?.role}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalBooks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Issues</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.activeIssues}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue Books</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.overdueBooks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Fines</p>
              <p className="text-2xl font-bold text-gray-900">₹{statistics.pendingFines}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Content */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Book Issues</h3>
                <div className="space-y-3">
                  {bookIssues.slice(0, 3).map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm">{issue.studentName}</p>
                        <p className="text-xs text-gray-500">{issue.bookTitle}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issue.status === 'issued' ? 'bg-blue-100 text-blue-800' :
                        issue.status === 'returned' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Book Availability</h3>
                <div className="space-y-3">
                  {bookAvailability.slice(0, 3).map((book) => (
                    <div key={book.id} className="p-3 bg-white rounded border">
                      <p className="font-medium text-sm">{book.title}</p>
                      <p className="text-xs text-gray-500">Available: {book.availableCopies}/{book.totalCopies}</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                        book.status === 'available' ? 'bg-green-100 text-green-800' :
                        book.status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {book.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => window.location.href = '/asst-librarian/issue-return'}
                  className="w-full text-left p-3 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="font-medium text-blue-800">Issue/Return Books</p>
                  </div>
                  <p className="text-sm text-blue-600">Manage book transactions</p>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/asst-librarian/availability'}
                  className="w-full text-left p-3 bg-green-50 rounded border border-green-200 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <Library className="h-5 w-5 text-green-600 mr-2" />
                    <p className="font-medium text-green-800">Book Availability</p>
                  </div>
                  <p className="text-sm text-green-600">Check book status</p>
                </button>
                
                <button
                  onClick={() => window.location.href = '/asst-librarian/fines'}
                  className="w-full text-left p-3 bg-yellow-50 rounded border border-yellow-200 hover:bg-yellow-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="font-medium text-yellow-800">Fine Management</p>
                  </div>
                  <p className="text-sm text-yellow-600">Handle overdue fines</p>
                </button>
                
                <button
                  onClick={() => window.location.href = '/asst-librarian/statistics'}
                  className="w-full text-left p-3 bg-purple-50 rounded border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
                    <p className="font-medium text-purple-800">Library Statistics</p>
                  </div>
                  <p className="text-sm text-purple-600">View detailed reports</p>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/asst-librarian/new-books'}
                  className="w-full text-left p-3 bg-orange-50 rounded border border-orange-200 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <Plus className="h-5 w-5 text-orange-600 mr-2" />
                    <p className="font-medium text-orange-800">Add New Books</p>
                  </div>
                  <p className="text-sm text-orange-600">Update catalog</p>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/asst-librarian/history'}
                  className="w-full text-left p-3 bg-indigo-50 rounded border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                    <p className="font-medium text-indigo-800">Borrowing History</p>
                  </div>
                  <p className="text-sm text-indigo-600">View past transactions</p>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/asst-librarian/help-desk'}
                  className="w-full text-left p-3 bg-pink-50 rounded border border-pink-200 hover:bg-pink-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-5 w-5 text-pink-600 mr-2" />
                    <p className="font-medium text-pink-800">Help Desk</p>
                  </div>
                  <p className="text-sm text-pink-600">Student support</p>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/asst-librarian/communication'}
                  className="w-full text-left p-3 bg-teal-50 rounded border border-teal-200 hover:bg-teal-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <Send className="h-5 w-5 text-teal-600 mr-2" />
                    <p className="font-medium text-teal-800">Communication</p>
                  </div>
                  <p className="text-sm text-teal-600">Send notifications</p>
                </button>

                <button 
                  onClick={() => window.location.href = '/asst-librarian/principal-request'}
                  className="w-full text-left p-3 bg-red-50 rounded border border-red-200 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-red-600 mr-2" />
                    <p className="font-medium text-red-800">Principal Request</p>
                  </div>
                  <p className="text-sm text-red-600">Request timing changes</p>
                </button>

                <button 
                  onClick={() => window.location.href = '/asst-librarian/book-order'}
                  className="w-full text-left p-3 bg-emerald-50 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <Package className="h-5 w-5 text-emerald-600 mr-2" />
                    <p className="font-medium text-emerald-800">Book Orders</p>
                  </div>
                  <p className="text-sm text-emerald-600">Order new books</p>
                </button>

                <button 
                  onClick={() => window.location.href = '/asst-librarian/resource-approval'}
                  className="w-full text-left p-3 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <Book className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="font-medium text-blue-800">Resource Requests</p>
                  </div>
                  <p className="text-sm text-blue-600">Approve student requests</p>
                </button>

                <button 
                  onClick={() => window.location.href = '/asst-librarian/timing-request'}
                  className="w-full text-left p-3 bg-violet-50 rounded border border-violet-200 hover:bg-violet-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-violet-600 mr-2" />
                    <p className="font-medium text-violet-800">Timing Requests</p>
                  </div>
                  <p className="text-sm text-violet-600">Request timing changes</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsstLibrarianDashboard; 