import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Settings, 
  Ticket, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Download,
  Share2,
  Filter,
  Search,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  category: string;
  status: 'draft' | 'published' | 'active' | 'ended' | 'cancelled';
  attendees: {
    registered: number;
    checkedIn: number;
    capacity: number;
  };
  tickets: {
    sold: number;
    revenue: number;
    types: number;
  };
  qrCodes: {
    generated: number;
    scanned: number;
  };
  createdAt: string;
  updatedAt: string;
  image?: string;
}

const Events: React.FC = () => {
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Algorand Developer Summit 2025',
      description: 'Annual gathering of Algorand developers and blockchain enthusiasts',
      date: '2025-09-15',
      endDate: '2025-09-17',
      location: 'Boston Convention Center, MA',
      category: 'Conference',
      status: 'published',
      attendees: { registered: 450, checkedIn: 0, capacity: 500 },
      tickets: { sold: 450, revenue: 22500, types: 3 },
      qrCodes: { generated: 450, scanned: 0 },
      createdAt: '2025-01-10',
      updatedAt: '2025-01-15',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
    },
    {
      id: '2',
      title: 'DeFi Workshop Series',
      description: 'Hands-on workshops covering DeFi protocols and development',
      date: '2025-08-28',
      endDate: '2025-08-30',
      location: 'TechHub San Francisco, CA',
      category: 'Workshop',
      status: 'active',
      attendees: { registered: 120, checkedIn: 85, capacity: 150 },
      tickets: { sold: 120, revenue: 3600, types: 2 },
      qrCodes: { generated: 120, scanned: 85 },
      createdAt: '2025-01-05',
      updatedAt: '2025-01-20',
      image: 'https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?w=400'
    },
    {
      id: '3',
      title: 'Blockchain Meetup Boston',
      description: 'Monthly meetup for blockchain enthusiasts and developers',
      date: '2025-08-20',
      location: 'MIT Media Lab, Cambridge, MA',
      category: 'Meetup',
      status: 'ended',
      attendees: { registered: 85, checkedIn: 78, capacity: 100 },
      tickets: { sold: 85, revenue: 850, types: 1 },
      qrCodes: { generated: 85, scanned: 78 },
      createdAt: '2025-01-01',
      updatedAt: '2025-01-21',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400'
    },
    {
      id: '4',
      title: 'Smart Contract Hackathon',
      description: '48-hour hackathon building on Algorand blockchain',
      date: '2025-08-10',
      endDate: '2025-08-12',
      location: 'Innovation District, Austin, TX',
      category: 'Hackathon',
      status: 'ended',
      attendees: { registered: 200, checkedIn: 185, capacity: 200 },
      tickets: { sold: 200, revenue: 8000, types: 2 },
      qrCodes: { generated: 200, scanned: 185 },
      createdAt: '2024-12-15',
      updatedAt: '2025-01-12',
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400'
    },
    {
      id: '5',
      title: 'NFT Art Gallery Opening',
      description: 'Exclusive preview of NFT artworks on Algorand',
      date: '2025-09-30',
      location: 'Digital Arts Museum, Los Angeles, CA',
      category: 'Exhibition',
      status: 'draft',
      attendees: { registered: 0, checkedIn: 0, capacity: 300 },
      tickets: { sold: 0, revenue: 0, types: 3 },
      qrCodes: { generated: 0, scanned: 0 },
      createdAt: '2025-01-22',
      updatedAt: '2025-01-22',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getStatusConfig = (status: Event['status']) => {
    switch (status) {
      case 'draft':
        return { icon: Edit, color: 'gray', bg: 'bg-gray-100', text: 'text-gray-800' };
      case 'published':
        return { icon: Clock, color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'active':
        return { icon: CheckCircle, color: 'green', bg: 'bg-green-100', text: 'text-green-800' };
      case 'ended':
        return { icon: CheckCircle, color: 'purple', bg: 'bg-purple-100', text: 'text-purple-800' };
      case 'cancelled':
        return { icon: XCircle, color: 'red', bg: 'bg-red-100', text: 'text-red-800' };
      default:
        return { icon: AlertCircle, color: 'gray', bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statsData = {
    total: events.length,
    active: events.filter(e => e.status === 'active').length,
    published: events.filter(e => e.status === 'published').length,
    draft: events.filter(e => e.status === 'draft').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
              <p className="text-gray-600 mt-1">Manage your blockchain-powered events and track performance</p>
            </div>
            <Link
              to="/create-event"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Calendar size={20} />
              <span>Create Event</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{statsData.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-3xl font-bold text-green-600">{statsData.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-blue-600">{statsData.published}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-3xl font-bold text-gray-600">{statsData.draft}</p>
              </div>
              <Edit className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="active">Active</option>
                  <option value="ended">Ended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="w-4 h-4 flex flex-col space-y-1">
                  <div className="h-0.5 bg-current rounded"></div>
                  <div className="h-0.5 bg-current rounded"></div>
                  <div className="h-0.5 bg-current rounded"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Events Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const statusConfig = getStatusConfig(event.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={event.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  {event.image && (
                    <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                      </div>
                      <div className="ml-3">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={14} className="mr-2" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        {event.endDate && (
                          <span> - {new Date(event.endDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={14} className="mr-2" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon size={12} className="mr-1" />
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {event.category}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{event.attendees.registered}</div>
                        <div className="text-xs text-gray-500">Registered</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{event.tickets.sold}</div>
                        <div className="text-xs text-gray-500">Tickets</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">${event.tickets.revenue}</div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Manage
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => {
                    const statusConfig = getStatusConfig(event.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {event.image && (
                              <img 
                                src={event.image} 
                                alt={event.title}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              <div className="text-sm text-gray-500">{event.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(event.date).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{event.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon size={12} className="mr-1" />
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{event.attendees.registered} / {event.attendees.capacity}</div>
                          <div className="text-sm text-gray-500">{event.attendees.checkedIn} checked in</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${event.tickets.revenue}</div>
                          <div className="text-sm text-gray-500">{event.tickets.sold} tickets</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">Manage</button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Eye size={16} />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first event'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                to="/create-event"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar size={16} className="mr-2" />
                Create Your First Event
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
