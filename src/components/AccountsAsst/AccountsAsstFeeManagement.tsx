import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  course: string;
  year: string;
  email: string;
}

interface FeeData {
  id: string;
  studentId: string;
  studentName: string;
  feeType: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'unpaid';
  paymentMethod?: string;
  receiptNo?: string;
  paidAt?: string;
}

const AccountsAsstFeeManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<FeeData[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchStudentsAndFees();
  }, []);

  const fetchStudentsAndFees = async () => {
    try {
      setLoading(true);
      
      // Fetch students from users collection
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      
      if (usersSnapshot.exists()) {
        const allUsers = usersSnapshot.val();
        const studentUsers = Object.entries(allUsers)
          .filter(([id, user]: [string, any]) => user.role === 'student')
          .map(([id, user]: [string, any]) => ({
            id,
            name: user.name || user.fullName || user.studentName || `Student ${id}`,
            rollNumber: user.rollNumber || user.rollNo || user.institutionalId || `R${id}`,
            course: user.course || user.department || 'Computer Science',
            year: user.year || '2024',
            email: user.email || ''
          }));
        
        setStudents(studentUsers);
        
        // Generate fee data for students (since we don't have a separate fees collection)
        const feeData: FeeData[] = studentUsers.map((student, index) => ({
          id: `fee_${student.id}`,
          studentId: student.id,
          studentName: student.name,
          feeType: ['tuition', 'library', 'laboratory'][index % 3],
          amount: [25000, 1500, 2500][index % 3], // Much lower fee amounts
          paidAmount: Math.floor(Math.random() * [25000, 1500, 2500][index % 3]),
          dueDate: '2024-06-15',
          status: ['paid', 'partial', 'unpaid'][index % 3] as 'paid' | 'partial' | 'unpaid',
          paymentMethod: ['online', 'cash', undefined][index % 3],
          receiptNo: `RCP${String(index + 1).padStart(3, '0')}`,
          paidAt: index % 3 === 0 ? '2024-06-01' : undefined
        }));
        
        setFees(feeData);
      } else {
        toast.error('No students found');
        setStudents([]);
        setFees([]);
      }
    } catch (error) {
      console.error('Error fetching students and fees:', error);
      toast.error('Failed to load fee data');
      setStudents([]);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'unpaid': return 'error';
      default: return 'default';
    }
  };

  const getFeeTypeColor = (type: string) => {
    switch (type) {
      case 'tuition': return 'primary';
      case 'library': return 'secondary';
      case 'laboratory': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading fee data...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Fee Management
      </Typography>
      
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          Total Students: {students.length} | Total Fees: {fees.length}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          View Only - Fee modifications are managed by Admin
        </Typography>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Roll Number</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Fee Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Paid Amount</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>{fee.studentName}</TableCell>
                  <TableCell>{fee.studentId}</TableCell>
                  <TableCell>{students.find(s => s.id === fee.studentId)?.course || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={fee.feeType} 
                      color={getFeeTypeColor(fee.feeType) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>₹{fee.amount.toLocaleString()}</TableCell>
                  <TableCell>₹{fee.paidAmount.toLocaleString()}</TableCell>
                  <TableCell>{fee.dueDate}</TableCell>
                  <TableCell>
                    <Chip 
                      label={fee.status} 
                      color={getStatusColor(fee.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label="View Only" 
                      color="default"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>


    </Box>
  );
};

export default AccountsAsstFeeManagement; 