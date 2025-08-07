import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, CheckCircle, AlertTriangle, Settings, Zap, X } from 'lucide-react';

interface PreventiveSchedule {
  id: string;
  title: string;
  description: string;
  equipment: string;
  location: string;
  scheduleType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  frequency: number;
  lastPerformed: string;
  nextDue: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  estimatedDuration: number;
  checklist: string[];
  notes: string;
}

// Mock API
const fetchPreventiveSchedules = async (): Promise<PreventiveSchedule[]> => [
  {
    id: '1',
    title: 'Generator Weekly Check',
    description: 'Weekly inspection and testing of backup generator system',
    equipment: 'Backup Generator 500KVA',
    location: 'Generator Room',
    scheduleType: 'weekly',
    frequency: 7,
    lastPerformed: '2024-05-28T08:00:00Z',
    nextDue: '2024-06-04T08:00:00Z',
    status: 'scheduled',
    priority: 'high',
    assignedTo: 'John Electrician',
    estimatedDuration: 60,
    checklist: [
      'Check oil levels',
      'Test fuel system',
      'Inspect battery connections',
      'Run load test for 15 minutes',
      'Check coolant levels'
    ],
    notes: 'Generator is running well. No issues found in last inspection.'
  },
  {
    id: '2',
    title: 'Electrical Panel Monthly Inspection',
    description: 'Monthly inspection of main electrical panels',
    equipment: 'Main Electrical Panels',
    location: 'All Buildings',
    scheduleType: 'monthly',
    frequency: 30,
    lastPerformed: '2024-05-15T09:00:00Z',
    nextDue: '2024-06-15T09:00:00Z',
    status: 'scheduled',
    priority: 'medium',
    assignedTo: 'John Electrician',
    estimatedDuration: 120,
    checklist: [
      'Check for loose connections',
      'Inspect for signs of overheating',
      'Test circuit breakers',
      'Clean panel surfaces',
      'Update maintenance log'
    ],
    notes: 'All panels in good condition. Minor cleaning required.'
  },
  {
    id: '3',
    title: 'Emergency Lighting Quarterly Test',
    description: 'Quarterly testing of emergency lighting systems',
    equipment: 'Emergency Lights',
    location: 'Campus Wide',
    scheduleType: 'quarterly',
    frequency: 90,
    lastPerformed: '2024-03-01T10:00:00Z',
    nextDue: '2024-06-01T10:00:00Z',
    status: 'overdue',
    priority: 'critical',
    assignedTo: 'John Electrician',
    estimatedDuration: 180,
    checklist: [
      'Test all emergency lights',
      'Check battery backup systems',
      'Verify exit signs illumination',
      'Test automatic activation',
      'Replace faulty units'
    ],
    notes: 'Overdue by 5 days. Need to schedule immediately.'
  },
  {
    id: '4',
    title: 'Transformer Annual Maintenance',
    description: 'Annual comprehensive maintenance of power transformers',
    equipment: 'Power Transformers',
    location: 'Electrical Substation',
    scheduleType: 'yearly',
    frequency: 365,
    lastPerformed: '2023-06-01T08:00:00Z',
    nextDue: '2024-06-01T08:00:00Z',
    status: 'completed',
    priority: 'high',
    assignedTo: 'John Electrician',
    estimatedDuration: 480,
    checklist: [
      'Oil analysis and replacement',
      'Insulation testing',
      'Thermal imaging scan',
      'Tap changer inspection',
      'Cooling system maintenance'
    ],
    notes: 'Completed successfully. All systems operating within normal parameters.'
  }
];

const submitPreventiveSchedule = async (schedule: Omit<PreventiveSchedule, 'id'>): Promise<boolean> => {
  console.log('Submitting preventive schedule:', schedule);
  return true;
};

const ElectricianPreventiveSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<PreventiveSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PreventiveSchedule | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    equipment: '',
    location: '',
    scheduleType: 'weekly' as const,
    frequency: 7,
    nextDue: '',
    priority: 'medium' as const,
    assignedTo: 'John Electrician',
    estimatedDuration: 60,
    checklist: '',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPreventiveSchedules();
        setSchedules(data);
      } catch (error) {
        console.error('Error loading preventive schedules:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!newSchedule.title || !newSchedule.description || !newSchedule.equipment) {
      return;
    }

    try {
      await submitPreventiveSchedule({
        ...newSchedule,
        lastPerformed: new Date().toISOString(),
        checklist: newSchedule.checklist ? newSchedule.checklist.split('\n').filter(item => item.trim()) : [],
        status: 'scheduled'
      });
      const updatedSchedules = await fetchPreventiveSchedules();
      setSchedules(updatedSchedules);
      setShowModal(false);
      setNewSchedule({
        title: '',
        description: '',
        equipment: '',
        location: '',
        scheduleType: 'weekly',
        frequency: 7,
        nextDue: '',
        priority: 'medium',
        assignedTo: 'John Electrician',
        estimatedDuration: 60,
        checklist: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting preventive schedule:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScheduleTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-purple-100 text-purple-800';
      case 'weekly':
        return 'bg-blue-100 text-blue-800';
      case 'monthly':
        return 'bg-green-100 text-green-800';
      case 'quarterly':
        return 'bg-orange-100 text-orange-800';
      case 'yearly':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (nextDue: string) => {
    return new Date(nextDue) < new Date();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Preventive Maintenance Schedule</h1>
        <p className="text-gray-600">Manage scheduled maintenance tasks and inspections</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Scheduled Tasks</h2>
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-medium text-gray-800">{schedule.title}</h3>
                      {isOverdue(schedule.nextDue) && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{schedule.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Settings className="w-4 h-4" />
                        {schedule.equipment}
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {schedule.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {schedule.estimatedDuration} min
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Next Due:</strong> {new Date(schedule.nextDue).toLocaleDateString()}
                      {isOverdue(schedule.nextDue) && (
                        <span className="text-red-600 ml-2">(Overdue)</span>
                      )}
                    </div>
                    {schedule.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                        <strong>Notes:</strong> {schedule.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                      {schedule.status.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(schedule.priority)}`}>
                      {schedule.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getScheduleTypeColor(schedule.scheduleType)}`}>
                      {schedule.scheduleType}
                    </span>
                    <button
                      onClick={() => setSelectedSchedule(schedule)}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">New Preventive Schedule</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the maintenance task"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment
                  </label>
                  <input
                    type="text"
                    value={newSchedule.equipment}
                    onChange={(e) => setNewSchedule({ ...newSchedule, equipment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter equipment name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newSchedule.location}
                    onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Type
                  </label>
                  <select
                    value={newSchedule.scheduleType}
                    onChange={(e) => setNewSchedule({ ...newSchedule, scheduleType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newSchedule.priority}
                    onChange={(e) => setNewSchedule({ ...newSchedule, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newSchedule.nextDue}
                    onChange={(e) => setNewSchedule({ ...newSchedule, nextDue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newSchedule.estimatedDuration}
                    onChange={(e) => setNewSchedule({ ...newSchedule, estimatedDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Checklist (one item per line)
                </label>
                <textarea
                  value={newSchedule.checklist}
                  onChange={(e) => setNewSchedule({ ...newSchedule, checklist: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter checklist items..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newSchedule.notes}
                  onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newSchedule.title || !newSchedule.description || !newSchedule.equipment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Details Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Schedule Details</h3>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-800">{selectedSchedule.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{selectedSchedule.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Equipment:</span>
                  <p className="text-gray-600">{selectedSchedule.equipment}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-gray-600">{selectedSchedule.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Next Due:</span>
                  <p className="text-gray-600">{new Date(selectedSchedule.nextDue).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <p className="text-gray-600">{selectedSchedule.estimatedDuration} minutes</p>
                </div>
              </div>

              {selectedSchedule.checklist.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Checklist:</span>
                  <ul className="text-gray-600 text-sm mt-1 space-y-1">
                    {selectedSchedule.checklist.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedSchedule.notes && (
                <div>
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="text-gray-600 text-sm">{selectedSchedule.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricianPreventiveSchedule; 