import React, { useEffect, useState } from 'react';
import {
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Droplets,
  Wrench,
  Package
} from 'lucide-react';

// Mock data
const mockStats = {
  totalComplaints: 156,
  resolvedComplaints: 142,
  pendingComplaints: 14,
  avgResolutionTime: '2.3 days',
  maintenanceTasks: 89,
  completedTasks: 76,
  waterSupplyIssues: 23,
  drainageIssues: 34,
  stockRequests: 45,
  approvedRequests: 38,
  emergencyCalls: 12,
  avgResponseTime: '15 minutes'
};

const mockTrends = [
  { month: 'Jan', complaints: 45, maintenance: 32, waterIssues: 8, drainageIssues: 12 },
  { month: 'Feb', complaints: 52, maintenance: 28, waterIssues: 10, drainageIssues: 15 },
  { month: 'Mar', complaints: 48, maintenance: 35, waterIssues: 7, drainageIssues: 11 },
  { month: 'Apr', complaints: 61, maintenance: 42, waterIssues: 12, drainageIssues: 18 },
  { month: 'May', complaints: 56, maintenance: 38, waterIssues: 9, drainageIssues: 14 },
  { month: 'Jun', complaints: 49, maintenance: 41, waterIssues: 11, drainageIssues: 16 }
];

const PlumberStatistics: React.FC = () => {
  const [stats, setStats] = useState(mockStats);
  const [trends, setTrends] = useState(mockTrends);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistics & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive overview of plumbing operations and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Complaints */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalComplaints}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Resolved Complaints */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolvedComplaints}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                91% resolution rate
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResolutionTime}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingDown className="w-4 h-4 mr-1" />
                -0.5 days from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Maintenance Tasks */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.maintenanceTasks}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                {stats.completedTasks} completed
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Wrench className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Types */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Issue Types</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Droplets className="w-5 h-5 text-blue-500 mr-3" />
                <span className="text-gray-700">Water Supply Issues</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-900">{stats.waterSupplyIssues}</span>
                <span className="text-sm text-gray-500">(15%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-orange-500 mr-3" />
                <span className="text-gray-700">Drainage Issues</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-900">{stats.drainageIssues}</span>
                <span className="text-sm text-gray-500">(22%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wrench className="w-5 h-5 text-purple-500 mr-3" />
                <span className="text-gray-700">General Maintenance</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-900">{stats.maintenanceTasks}</span>
                <span className="text-sm text-gray-500">(57%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-gray-700">Emergency Calls</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-900">{stats.emergencyCalls}</span>
                <span className="text-sm text-gray-500">(8%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Requests */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Stock Requests</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">Total Requests</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{stats.stockRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                <span className="text-gray-700">Approved</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{stats.approvedRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-500 mr-3" />
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {stats.stockRequests - stats.approvedRequests}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approval Rate</span>
                <span className="text-sm font-semibold text-green-600">
                  {Math.round((stats.approvedRequests / stats.stockRequests) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.avgResponseTime}</div>
              <div className="text-sm text-gray-600">Average Response Time</div>
              <div className="text-xs text-green-600 mt-1">-2 minutes from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Resolution Rate</div>
              <div className="text-xs text-green-600 mt-1">+3% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round((stats.completedTasks / stats.maintenanceTasks) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Task Completion Rate</div>
              <div className="text-xs text-green-600 mt-1">+5% from last month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Monthly Trends</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Month</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Complaints</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Maintenance</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Water Issues</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Drainage Issues</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((trend, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{trend.month}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{trend.complaints}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{trend.maintenance}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{trend.waterIssues}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{trend.drainageIssues}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlumberStatistics; 