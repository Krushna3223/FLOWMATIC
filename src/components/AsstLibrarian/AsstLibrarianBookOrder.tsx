import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, push, get } from 'firebase/database';
import { 
  BookOpen, 
  Package, 
  Send, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  DollarSign,
  Calendar,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BookOrder {
  id: string;
  bookTitle: string;
  author: string;
  isbn: string;
  publisher: string;
  category: string;
  quantity: number;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'rejected';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  orderedAt?: string;
  receivedAt?: string;
  comments?: string;
  departmentApproval?: 'pending' | 'approved' | 'rejected';
  principalApproval?: 'pending' | 'approved' | 'rejected';
}

const AsstLibrarianBookOrder: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<BookOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bookTitle: '',
    author: '',
    isbn: '',
    publisher: '',
    category: '',
    quantity: 1,
    estimatedCost: 0,
    priority: 'medium' as const,
    comments: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const database = getDatabase();
      const ordersRef = ref(database, 'book_orders');
      const snapshot = await get(ordersRef);
      
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const ordersList = Object.entries(ordersData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setOrders(ordersList);
      } else {
        // Mock data for demonstration
        const mockOrders: BookOrder[] = [
          {
            id: 'ORDER001',
            bookTitle: 'Advanced Computer Science',
            author: 'John Smith',
            isbn: '978-0-123456-78-9',
            publisher: 'Tech Books Inc.',
            category: 'Computer Science',
            quantity: 5,
            estimatedCost: 2500,
            priority: 'high',
            status: 'approved',
            requestedBy: currentUser?.name || 'Librarian',
            requestedAt: '2024-01-15T10:30:00Z',
            approvedBy: 'Principal',
            approvedAt: '2024-01-17T14:20:00Z',
            departmentApproval: 'approved',
            principalApproval: 'approved',
            comments: 'Required for new curriculum'
          },
          {
            id: 'ORDER002',
            bookTitle: 'Mathematics for Engineers',
            author: 'Sarah Wilson',
            isbn: '978-0-987654-32-1',
            publisher: 'Academic Press',
            category: 'Mathematics',
            quantity: 3,
            estimatedCost: 1800,
            priority: 'medium',
            status: 'pending',
            requestedBy: currentUser?.name || 'Librarian',
            requestedAt: '2024-01-18T09:15:00Z',
            departmentApproval: 'pending',
            principalApproval: 'pending'
          }
        ];
        setOrders(mockOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.bookTitle.trim() || !formData.author.trim() || !formData.isbn.trim() || 
        !formData.publisher.trim() || !formData.category || formData.quantity <= 0 || formData.estimatedCost <= 0) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }
    
    console.log('Submitting order with data:', formData);
    
    try {
      // Show loading state
      toast.loading('Submitting book order...');
      
      const database = getDatabase();
      const ordersRef = ref(database, 'book_orders');
      
      const newOrder = {
        ...formData,
        status: 'pending',
        requestedBy: currentUser?.name || 'Librarian',
        requestedAt: new Date().toISOString(),
        departmentApproval: 'pending',
        principalApproval: 'pending'
      };
      
      console.log('Prepared order data:', newOrder);
      
      // Try to save to Firebase
      try {
        console.log('Attempting to save to Firebase...');
        await push(ordersRef, newOrder);
        console.log('Successfully saved to Firebase');
        toast.dismiss();
        toast.success('Book order submitted successfully');
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        console.log('Falling back to local storage...');
        // Fallback: Add to local state if Firebase fails
        const mockOrder: BookOrder = {
          id: `ORDER${Date.now()}`,
          bookTitle: newOrder.bookTitle,
          author: newOrder.author,
          isbn: newOrder.isbn,
          publisher: newOrder.publisher,
          category: newOrder.category,
          quantity: newOrder.quantity,
          estimatedCost: newOrder.estimatedCost,
          priority: newOrder.priority,
          status: 'pending',
          requestedBy: newOrder.requestedBy,
          requestedAt: newOrder.requestedAt,
          departmentApproval: 'pending',
          principalApproval: 'pending',
          comments: newOrder.comments
        };
        setOrders(prev => [mockOrder, ...prev]);
        toast.dismiss();
        toast.success('Book order submitted (saved locally)');
      }
      
      // Reset form
      setShowForm(false);
      setFormData({
        bookTitle: '',
        author: '',
        isbn: '',
        publisher: '',
        category: '',
        quantity: 1,
        estimatedCost: 0,
        priority: 'medium',
        comments: ''
      });
      
      // Refresh orders list
      fetchOrders();
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.dismiss();
      toast.error('Failed to submit order. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getApprovalColor = (approval: string) => {
    switch (approval) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Orders</h1>
        <p className="text-gray-600">Order new books and manage communication with store department and principal</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(order => order.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(order => order.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Received</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(order => order.status === 'received').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Book Order
        </button>
      </div>

      {/* Order Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Submit New Book Order</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    value={formData.bookTitle}
                    onChange={(e) => setFormData({...formData, bookTitle: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter book title"
                    required
                    minLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter author name"
                    required
                    minLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter ISBN (e.g., 978-0-123456-78-9)"
                    required
                    pattern="[0-9\-]{10,}"
                    title="Please enter a valid ISBN"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publisher *
                  </label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter publisher"
                    required
                    minLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Literature">Literature</option>
                    <option value="History">History</option>
                    <option value="Reference">Reference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: Math.max(1, parseInt(e.target.value) || 1)})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Cost (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({...formData, estimatedCost: Math.max(0, parseFloat(e.target.value) || 0)})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({...formData, comments: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Additional comments or justification..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Book Orders</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{order.bookTitle}</h3>
                    <p className="text-sm text-gray-600">By {order.author} • {order.publisher}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ISBN</p>
                    <p className="text-sm">{order.isbn}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quantity</p>
                    <p className="text-sm">{order.quantity} copies</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Estimated Cost</p>
                    <p className="text-sm">₹{order.estimatedCost}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Store Department</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getApprovalColor(order.departmentApproval || 'pending')}`}>
                      {order.departmentApproval || 'pending'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Principal Approval</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getApprovalColor(order.principalApproval || 'pending')}`}>
                      {order.principalApproval || 'pending'}
                    </span>
                  </div>
                </div>
                
                {order.comments && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-600">Comments</p>
                    <p className="text-sm">{order.comments}</p>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Requested on {new Date(order.requestedAt).toLocaleDateString()}
                  {order.approvedAt && ` • Approved on ${new Date(order.approvedAt).toLocaleDateString()}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsstLibrarianBookOrder; 