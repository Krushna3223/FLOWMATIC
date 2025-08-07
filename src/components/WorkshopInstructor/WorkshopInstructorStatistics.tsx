import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Package,
  DollarSign,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Statistics {
  equipment: {
    total: number;
    functional: number;
    maintenance: number;
    outOfOrder: number;
    utilization: number;
  };
  safety: {
    incidents: number;
    notices: number;
    acknowledgments: number;
    compliance: number;
  };
  requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalCost: number;
  };
  trends: {
    equipmentUtilization: number[];
    safetyIncidents: number[];
    requestVolume: number[];
    costs: number[];
  };
}

const WorkshopInstructorStatistics: React.FC = () => {
  const { currentUser } = useAuth();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const fetchStatistics = async () => {
    try {
      // Mock data
      const mockStats: Statistics = {
        equipment: {
          total: 25,
          functional: 22,
          maintenance: 2,
          outOfOrder: 1,
          utilization: 88
        },
        safety: {
          incidents: 1,
          notices: 4,
          acknowledgments: 3,
          compliance: 95
        },
        requests: {
          total: 15,
          pending: 3,
          approved: 10,
          rejected: 2,
          totalCost: 45000
        },
        trends: {
          equipmentUtilization: [85, 88, 92, 88, 90, 88],
          safetyIncidents: [0, 1, 0, 0, 1, 0],
          requestVolume: [5, 8, 12, 10, 15, 12],
          costs: [12000, 18000, 25000, 20000, 45000, 35000]
        }
      };
      setStatistics(mockStats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <TrendingUp className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) {
      return 'text-green-600';
    } else if (current < previous) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">No statistics available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Workshop Statistics</h1>
        <p className="text-gray-600">Comprehensive overview of workshop performance and metrics</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Statistics Overview</h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Equipment Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Equipment Status</h3>
            <Wrench className="h-6 w-6 text-blue-600" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Equipment</span>
              <span className="font-semibold">{statistics.equipment.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Functional</span>
              <span className="font-semibold text-green-600">{statistics.equipment.functional}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Under Maintenance</span>
              <span className="font-semibold text-yellow-600">{statistics.equipment.maintenance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Out of Order</span>
              <span className="font-semibold text-red-600">{statistics.equipment.outOfOrder}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Utilization Rate</span>
                <span className="font-semibold text-blue-600">{statistics.equipment.utilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${statistics.equipment.utilization}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Safety Metrics</h3>
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Safety Incidents</span>
              <span className="font-semibold text-red-600">{statistics.safety.incidents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Notices</span>
              <span className="font-semibold text-yellow-600">{statistics.safety.notices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Acknowledged</span>
              <span className="font-semibold text-green-600">{statistics.safety.acknowledgments}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Compliance Rate</span>
                <span className="font-semibold text-green-600">{statistics.safety.compliance}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${statistics.safety.compliance}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Request Summary</h3>
            <Package className="h-6 w-6 text-purple-600" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Requests</span>
              <span className="font-semibold">{statistics.requests.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{statistics.requests.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved</span>
              <span className="font-semibold text-green-600">{statistics.requests.approved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rejected</span>
              <span className="font-semibold text-red-600">{statistics.requests.rejected}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Cost</span>
                <span className="font-semibold text-purple-600">₹{statistics.requests.totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trends and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Equipment Utilization Trend</h3>
          <div className="space-y-3">
            {statistics.trends.equipmentUtilization.map((value, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Week {index + 1}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{value}%</span>
                  {index > 0 && getTrendIcon(value, statistics.trends.equipmentUtilization[index - 1])}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Request Volume Trend</h3>
          <div className="space-y-3">
            {statistics.trends.requestVolume.map((value, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Week {index + 1}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{value}</span>
                  {index > 0 && getTrendIcon(value, statistics.trends.requestVolume[index - 1])}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{statistics.equipment.utilization}%</p>
                <p className="text-sm text-gray-600">Equipment Utilization</p>
              </div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{statistics.safety.compliance}%</p>
                <p className="text-sm text-gray-600">Safety Compliance</p>
              </div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-lg">
                <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round((statistics.requests.approved / statistics.requests.total) * 100)}%
                </p>
                <p className="text-sm text-gray-600">Request Approval Rate</p>
              </div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-yellow-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">₹{(statistics.requests.totalCost / 1000).toFixed(1)}K</p>
                <p className="text-sm text-gray-600">Total Investment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopInstructorStatistics; 