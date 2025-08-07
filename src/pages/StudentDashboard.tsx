import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ref, get } from 'firebase/database';
import { database } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  CalendarDays,
  Eye,
  CheckCircle,
  X,
  FileText,
  Award,
  MoreVertical,
  Settings,
  HelpCircle
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  emoji: string;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  highlights: string[];
  createdAt: number;
  updatedAt: number;
}

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMoreMenu]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsRef = ref(database, 'events');
      const snapshot = await get(eventsRef);
      
      if (snapshot.exists()) {
        const eventsList: Event[] = [];
        snapshot.forEach((eventSnapshot) => {
          eventsList.push({
            id: eventSnapshot.key!,
            ...eventSnapshot.val()
          });
        });
        
        // Sort events by date (upcoming first)
        eventsList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(eventsList);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sports':
        return 'bg-orange-100 text-orange-800';
      case 'Academic':
        return 'bg-blue-100 text-blue-800';
      case 'Cultural':
        return 'bg-purple-100 text-purple-800';
      case 'Technical':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isRegistrationOpen = (event: Event) => {
    const deadline = new Date(event.registrationDeadline);
    const now = new Date();
    return deadline > now && event.currentParticipants < event.maxParticipants;
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreMenu(!showMoreMenu);
              }}
              className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
              <span className="text-sm font-medium">More Options</span>
            </button>
            
            {/* Dropdown Menu */}
            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/student/achievements';
                      setShowMoreMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Award className="h-4 w-4 mr-3 text-blue-600" />
                    View Achievements
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/requests';
                      setShowMoreMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-3 text-green-600" />
                    Request Management
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/student/fee-waiver';
                      setShowMoreMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-3 text-purple-600" />
                    Fee Waiver Request
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add help/support functionality
                      setShowMoreMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <HelpCircle className="h-4 w-4 mr-3 text-orange-600" />
                    Help & Support
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/student/documents'}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Document Requests</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/student/achievements'}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Award className="h-5 w-5 text-green-600" />
            <span className="font-medium">My Achievements</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/student/fee-waiver'}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Fee Waiver</span>
          </button>
        </div>
      </div>

      {/* Events Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Institute Events</h2>
          <p className="text-sm text-gray-600 mt-1">
            Stay updated with all the latest events and activities
          </p>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No events available at the moment</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{event.emoji}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                            {event.category}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                          {isRegistrationOpen(event) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Registration Open
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium">Date:</span>
                        <span className="ml-2">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="font-medium">Time:</span>
                        <span className="ml-2">{event.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="font-medium">Location:</span>
                        <span className="ml-2">{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="font-medium">Participants:</span>
                        <span className="ml-2">{event.currentParticipants}/{event.maxParticipants}</span>
                      </div>
                    </div>

                    {event.highlights.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Event Highlights</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {event.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              {highlight}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span className="font-medium">Organizer:</span>
                        <span className="ml-2">{event.organizer}</span>
                      </div>
                      <button
                        onClick={() => handleViewEvent(event)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedEvent.emoji}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selectedEvent.category)}`}>
                      {selectedEvent.category}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                      {selectedEvent.status}
                    </span>
                    {isRegistrationOpen(selectedEvent) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Registration Open
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-600">{selectedEvent.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">{new Date(selectedEvent.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">Time:</span>
                    <span className="ml-2">{selectedEvent.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span className="font-medium">Organizer:</span>
                    <span className="ml-2">{selectedEvent.organizer}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <span className="font-medium">Registration Deadline:</span>
                    <span className="ml-2">{new Date(selectedEvent.registrationDeadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="font-medium">Participants:</span>
                    <span className="ml-2">{selectedEvent.currentParticipants}/{selectedEvent.maxParticipants}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Registration Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      isRegistrationOpen(selectedEvent) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isRegistrationOpen(selectedEvent) ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedEvent.highlights.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Event Highlights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedEvent.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isRegistrationOpen(selectedEvent) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Registration Information</h4>
                  <p className="text-sm text-blue-700">
                    Registration is currently open for this event. Please contact the organizer or visit the event location to register.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard; 