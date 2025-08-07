import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Download, Upload, Eye } from 'lucide-react';
import { Student } from '../../types';
import { toast } from 'react-hot-toast';
import { get, ref, update } from 'firebase/database';
import { database } from '../../firebase/config';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Fetch real student data from Firebase
  useEffect(() => {
    setLoading(true);
    get(ref(database, 'users')).then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        setStudents([]);
        setLoading(false);
        return;
      }
      const studentList: Student[] = [];
      Object.entries(data).forEach(([uid, user]: [string, any]) => {
        if (user.role === 'student') {
          studentList.push({
            id: uid,
            name: user.name || '',
            rollNumber: user.rollNo || '',
            email: user.email || '',
            phone: user.phone || '',
            course: user.course || '',
            year: user.year || '',
            department: user.department || '',
            feeStatus: user.feeStatus || 'unknown',
            totalFees: '', // Will be populated from fees node
            dueAmount: '', // Will be populated from fees node
            profilePhoto: user.profilePhoto || '',
            createdAt: user.createdAt || '',
          });
        }
      });
      setStudents(studentList);
      setLoading(false);
    }).catch(() => {
      setStudents([]);
      setLoading(false);
      toast.error('Failed to fetch students');
    });
  }, []);

  // Fetch fee data for students
  useEffect(() => {
    if (students.length > 0) {
      get(ref(database, 'fees')).then(snapshot => {
        const feeData = snapshot.val();
        if (feeData) {
          setStudents(prevStudents => 
            prevStudents.map(student => {
              const studentFees = feeData[student.rollNumber];
              if (studentFees) {
                const total = studentFees.total || 0;
                const paid = studentFees.paid || 0;
                const due = total - paid;
                return {
                  ...student,
                  totalFees: total.toString(),
                  dueAmount: due.toString(),
                };
              }
              return student;
            })
          );
        }
      }).catch(error => {
        console.error('Error fetching fee data:', error);
      });
    }
  }, [students.length]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getStatusColor(status: string) {
    if (status === 'paid') return 'bg-green-100 text-green-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'unknown') return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  }

  // Edit modal save handler
  const handleEditSave = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      // Always update user data in Firebase (even if fields are empty)
      const userUpdateData: any = {
        name: editForm.name || '',
        rollNo: editForm.rollNumber || '',
        course: editForm.course || 'B-Tech',
        year: editForm.year || '',
        department: editForm.department || '',
        phone: editForm.phone || '',
        email: editForm.email || '',
        feeStatus: editForm.feeStatus || 'unknown',
        profilePhoto: editForm.profilePhoto || '',
      };

      await update(ref(database, `users/${selectedStudent.id}`), userUpdateData);

      // Always update fee data in the fees node using roll number (even if empty)
      if (editForm.rollNumber) {
        const feeData: any = {};
        if (editForm.totalFees !== undefined && editForm.totalFees !== '') {
          feeData.total = editForm.totalFees;
        }
        if (editForm.dueAmount !== undefined && editForm.dueAmount !== '') {
          const total = parseFloat(editForm.totalFees) || 0;
          const due = parseFloat(editForm.dueAmount) || 0;
          feeData.paid = Math.max(0, total - due);
        }
        
        // Update fee data even if it's empty (to clear existing data)
        await update(ref(database, `fees/${editForm.rollNumber}`), feeData);
      }

      toast.success('Student updated successfully!');
      
      // Refresh students
      get(ref(database, 'users')).then(snapshot => {
        const data = snapshot.val();
        const studentList: Student[] = [];
        Object.entries(data).forEach(([uid, user]: [string, any]) => {
          if (user.role === 'student') {
            studentList.push({
              id: uid,
              name: user.name || '',
              rollNumber: user.rollNo || '',
              email: user.email || '',
              phone: user.phone || '',
              course: user.course || '',
              year: user.year || '',
              department: user.department || '',
              feeStatus: user.feeStatus || 'unknown',
              totalFees: '', // Will be populated from fees node
              dueAmount: '', // Will be populated from fees node
              profilePhoto: user.profilePhoto || '',
              createdAt: user.createdAt || '',
            });
          }
        });
        setStudents(studentList);
      });
      
      setIsEditModalOpen(false);
      setSelectedStudent(null);
      setEditForm(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update student');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Student List</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by name, roll no, or email"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          />
          {/* Add, Import, Export buttons can be implemented here if needed */}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course & Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fee Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8">No students found.</td></tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.rollNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{student.course}</div>
                      <div className="text-sm text-gray-500">{student.year}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{student.email}</div>
                      <div className="text-sm text-gray-500">{student.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.feeStatus)}`}>
                      {student.feeStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Actions: View, Edit, Delete, etc. */}
                    <button 
                      className="text-blue-600 hover:underline mr-4" 
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsViewModalOpen(true);
                      }}
                      title="View Student Details"
                    >
                      <Eye className="inline h-4 w-4" />
                    </button>
                    <button 
                      className="text-yellow-600 hover:underline mr-4" 
                      onClick={() => { 
                        setIsEditModalOpen(true); 
                        setSelectedStudent(student); 
                        setEditForm({
                          ...student,
                          course: student.course || 'B-Tech'
                        }); 
                      }}
                      title="Edit Student"
                    >
                      <Edit className="inline h-4 w-4" />
                    </button>
                    <button 
                      className="text-red-600 hover:underline" 
                      onClick={() => {
                        setStudentToDelete(student);
                        setIsDeleteModalOpen(true);
                      }}
                      title="Delete Student"
                    >
                      <Trash2 className="inline h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Add/Edit/View modals can be implemented here if needed */}
      {/* Edit Modal */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-center">Edit Student</h2>
            <form
              onSubmit={e => { e.preventDefault(); handleEditSave(); }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Profile Photo Upload */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-2">Profile Photo</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300 overflow-hidden">
                    {editForm?.profilePhoto ? (
                      <img 
                        src={editForm.profilePhoto} 
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-lg">
                        {editForm?.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setEditForm({ 
                              ...editForm, 
                              profilePhoto: event.target?.result as string 
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload a profile photo (JPG, PNG, GIF)</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editForm?.name || ''}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Roll Number</label>
                <input
                  type="text"
                  value={editForm?.rollNumber || ''}
                  onChange={e => setEditForm({ ...editForm, rollNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Total Fees</label>
                <input
                  type="number"
                  value={editForm?.totalFees || ''}
                  onChange={e => setEditForm({ ...editForm, totalFees: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Due Amount</label>
                <input
                  type="number"
                  value={editForm?.dueAmount || ''}
                  onChange={e => setEditForm({ ...editForm, dueAmount: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Course</label>
                <input
                  type="text"
                  value={editForm?.course || 'B-Tech'}
                  onChange={e => setEditForm({ ...editForm, course: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Year</label>
                <select
                  value={editForm?.year || ''}
                  onChange={e => setEditForm({ ...editForm, year: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Department</label>
                <select
                  value={editForm?.department || ''}
                  onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="">Select Department</option>
                  <option value="AI and DS">AI and DS</option>
                  <option value="Electronics and Communication">Electronics and Communication</option>
                  <option value="ECE">ECE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electronics Engineering (VLSI)">Electronics Engineering (VLSI)</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="CSE">CSE</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={editForm?.phone || ''}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editForm?.email || ''}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Fee Status</label>
                <select
                  value={editForm?.feeStatus || 'unknown'}
                  onChange={e => setEditForm({ ...editForm, feeStatus: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="md:col-span-2 flex space-x-3 pt-2 justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-1 px-4 rounded-md hover:bg-blue-700 focus:outline-none text-sm"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setSelectedStudent(null); setEditForm(null); }}
                  className="bg-gray-300 text-gray-700 py-1 px-4 rounded-md hover:bg-gray-400 focus:outline-none text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Modal */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  {/* Profile Photo */}
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white border-opacity-30 overflow-hidden">
                    {selectedStudent.profilePhoto ? (
                      <img 
                        src={selectedStudent.profilePhoto} 
                        alt={selectedStudent.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initial if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={`text-2xl font-bold text-white ${selectedStudent.profilePhoto ? 'hidden' : ''}`}>
                      {selectedStudent.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                    <p className="text-blue-100">Roll No: {selectedStudent.rollNumber}</p>
                    <p className="text-blue-100">{selectedStudent.course} • Year {selectedStudent.year}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsViewModalOpen(false); setSelectedStudent(null); }}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Fee Status Badge */}
              <div className="mb-6">
                <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(selectedStudent.feeStatus)}`}>
                  Fee Status: {selectedStudent.feeStatus}
                </span>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-sm text-gray-900 font-medium">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Roll Number</label>
                      <p className="text-sm text-gray-900 font-medium">{selectedStudent.rollNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email Address</label>
                      <p className="text-sm text-gray-900">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                      <p className="text-sm text-gray-900">{selectedStudent.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Academic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Course</label>
                      <p className="text-sm text-gray-900 font-medium">{selectedStudent.course || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Year</label>
                      <p className="text-sm text-gray-900 font-medium">{selectedStudent.year || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Department</label>
                      <p className="text-sm text-gray-900">{selectedStudent.department || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Fee Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Fee Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Total Fees</label>
                      <p className="text-lg font-bold text-gray-900">₹{selectedStudent.totalFees || '0'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Due Amount</label>
                      <p className="text-lg font-bold text-red-600">₹{selectedStudent.dueAmount || '0'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Paid Amount</label>
                      <p className="text-lg font-bold text-green-600">
                        ₹{(() => {
                           const total = parseFloat(selectedStudent.totalFees || '0');
                           const due = parseFloat(selectedStudent.dueAmount || '0');
                           return total - due;
                         })()}
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Quick Actions */}
                 <div className="bg-gray-50 rounded-lg p-4">
                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                     <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                     Quick Actions
                   </h3>
                   <div className="space-y-2">
                     <button
                       onClick={() => {
                         setIsViewModalOpen(false);
                         setIsEditModalOpen(true);
                         setEditForm({
                           ...selectedStudent,
                           course: selectedStudent.course || 'B-Tech'
                         });
                       }}
                       className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                     >
                       Edit Student
                     </button>
                     <button
                       onClick={() => {
                         // Add fee payment functionality
                         toast.success('Fee payment feature coming soon!');
                       }}
                       className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                     >
                       Record Payment
                     </button>
                     <button
                       onClick={() => {
                         // Add certificate request functionality
                         toast.success('Certificate request feature coming soon!');
                       }}
                       className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                     >
                       Request Certificate
                     </button>
                   </div>
                 </div>
               </div>
             </div>

             {/* Footer */}
             <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t">
               <div className="flex justify-between items-center">
                 <p className="text-sm text-gray-600">
                   Student ID: {selectedStudent.id}
                 </p>
                 <button
                   onClick={() => { setIsViewModalOpen(false); setSelectedStudent(null); }}
                   className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400 focus:outline-none transition-colors"
                 >
                   Close
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
       {/* Delete Confirmation Modal */}
       {isDeleteModalOpen && studentToDelete && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg p-6 max-w-md w-full">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
             <p className="text-sm text-gray-700 mb-4">
               Are you sure you want to delete <strong>{studentToDelete.name}</strong>? This action cannot be undone.
             </p>
             <div className="flex justify-end space-x-3">
               <button
                 onClick={() => {
                   setIsDeleteModalOpen(false);
                   setStudentToDelete(null);
                 }}
                 className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none text-sm"
               >
                 Cancel
               </button>
               <button
                 onClick={async () => {
                   setIsDeleteModalOpen(false);
                   setStudentToDelete(null);
                   try {
                     await update(ref(database, `users/${studentToDelete.id}`), { role: 'deleted' });
                     toast.success('Student deleted successfully!');
                     // Refresh students
                     get(ref(database, 'users')).then(snapshot => {
                       const data = snapshot.val();
                       const studentList: Student[] = [];
                       Object.entries(data).forEach(([uid, user]: [string, any]) => {
                         if (user.role === 'student') {
                           studentList.push({
                             id: uid,
                             name: user.name || '',
                             rollNumber: user.rollNo || '',
                             email: user.email || '',
                             phone: user.phone || '',
                             course: user.course || '',
                             year: user.year || '',
                             department: user.department || '',
                             feeStatus: user.feeStatus || 'unknown',
                             totalFees: '', // Will be populated from fees node
                             dueAmount: '', // Will be populated from fees node
                             profilePhoto: user.profilePhoto || '',
                             createdAt: user.createdAt || '',
                           });
                         }
                       });
                       setStudents(studentList);
                     });
                   } catch (error) {
                     console.error('Delete error:', error);
                     toast.error('Failed to delete student');
                   }
                 }}
                 className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none text-sm"
               >
                 Delete
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

 export default StudentManagement; 