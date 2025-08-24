import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Calendar, 
  MapPin, 
  Users, 
  ExternalLink, 
  Download,
  Share2,
  Filter,
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { nftService, NFTAsset } from '../services/nft-service';
import { dynaQRService } from '../services/algorand';

interface UserNFT {
  assetId: number;
  name: string;
  unitName: string;
  url: string;
  creator: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  ticketTier: string;
  attendeeName: string;
  mintedAt: string;
  transactionId: string;
}

const NFTGallery: React.FC = () => {
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Check wallet connection on component mount
  useEffect(() => {
    const account = dynaQRService.getConnectedAccount();
    if (account) {
      setWalletConnected(true);
      setConnectedAccount(account);
      loadUserNFTs(account.address);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserNFTs = async (userAddress: string) => {
    try {
      setLoading(true);
      
      // Get user's NFTs from the service
      const nftResult = await nftService.getUserNFTs(userAddress);
      
      if (nftResult.success && nftResult.data) {
        // Transform NFT data to include event information
        const transformedNFTs: UserNFT[] = (nftResult.data as NFTAsset[]).map(nft => {
          // Extract event information from NFT metadata
          const eventInfo = extractEventInfoFromNFT(nft);
          
          return {
            assetId: nft.assetId,
            name: nft.name,
            unitName: nft.unitName,
            url: nft.url,
            creator: nft.creator,
            eventName: eventInfo.eventName,
            eventDate: eventInfo.eventDate,
            eventLocation: eventInfo.eventLocation,
            ticketTier: eventInfo.ticketTier,
            attendeeName: eventInfo.attendeeName,
            mintedAt: eventInfo.mintedAt,
            transactionId: eventInfo.transactionId
          };
        });
        
        setUserNFTs(transformedNFTs);
      } else {
        // For demo purposes, create some sample NFTs
        const sampleNFTs = createSampleNFTs(userAddress);
        setUserNFTs(sampleNFTs);
      }
    } catch (error) {
      console.error('Error loading NFTs:', error);
      toast.error('Failed to load NFT collection');
    } finally {
      setLoading(false);
    }
  };

  const extractEventInfoFromNFT = (nft: NFTAsset) => {
    // In a real implementation, this would parse the NFT metadata
    // For demo purposes, return sample data
    return {
      eventName: nft.name.split(' - ')[0] || 'Unknown Event',
      eventDate: new Date().toISOString(),
      eventLocation: 'Event Location',
      ticketTier: nft.name.includes('VIP') ? 'VIP' : nft.name.includes('Premium') ? 'Premium' : 'General',
      attendeeName: 'Demo User',
      mintedAt: new Date().toISOString(),
      transactionId: `MINT_${nft.assetId}_${Date.now()}`
    };
  };

  const createSampleNFTs = (userAddress: string): UserNFT[] => {
    return [
      {
        assetId: 12345,
        name: 'Algorand Developer Summit 2025 - VIP Ticket',
        unitName: 'ALGOSUM',
        url: 'https://via.placeholder.com/400x400/6366f1/ffffff?text=VIP+Ticket',
        creator: userAddress,
        eventName: 'Algorand Developer Summit 2025',
        eventDate: '2025-09-15',
        eventLocation: 'Boston Convention Center, MA',
        ticketTier: 'VIP',
        attendeeName: 'Demo User',
        mintedAt: '2025-01-15T10:30:00Z',
        transactionId: 'MINT_12345_1705312200000'
      },
      {
        assetId: 12346,
        name: 'DeFi Workshop Series - General Ticket',
        unitName: 'DEFIWS',
        url: 'https://via.placeholder.com/400x400/10b981/ffffff?text=General+Ticket',
        creator: userAddress,
        eventName: 'DeFi Workshop Series',
        eventDate: '2025-08-28',
        eventLocation: 'TechHub San Francisco, CA',
        ticketTier: 'General',
        attendeeName: 'Demo User',
        mintedAt: '2025-01-10T14:15:00Z',
        transactionId: 'MINT_12346_1704891300000'
      },
      {
        assetId: 12347,
        name: 'Blockchain Meetup Boston - Premium Ticket',
        unitName: 'BOSMEET',
        url: 'https://via.placeholder.com/400x400/f59e0b/ffffff?text=Premium+Ticket',
        creator: userAddress,
        eventName: 'Blockchain Meetup Boston',
        eventDate: '2025-08-20',
        eventLocation: 'MIT Media Lab, Cambridge, MA',
        ticketTier: 'Premium',
        attendeeName: 'Demo User',
        mintedAt: '2025-01-05T16:45:00Z',
        transactionId: 'MINT_12347_1704471900000'
      }
    ];
  };

  const connectWallet = async () => {
    try {
      const account = await dynaQRService.connectWallet('pera');
      if (account) {
        setWalletConnected(true);
        setConnectedAccount(account);
        toast.success('🔗 Wallet connected successfully!');
        loadUserNFTs(account.address);
      }
    } catch (error) {
      toast.error('❌ Failed to connect wallet');
    }
  };

  const filteredNFTs = userNFTs.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.ticketTier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || nft.ticketTier.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getTicketTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'premium':
        return 'bg-yellow-100 text-yellow-800';
      case 'general':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTicketTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'vip':
        return '👑';
      case 'premium':
        return '⭐';
      case 'general':
        return '🎫';
      default:
        return '🎫';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your NFT collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎨 NFT Gallery</h1>
              <p className="text-gray-600 mt-1">Your collection of event attendance NFTs on Algorand</p>
            </div>
            {!walletConnected && (
              <button
                onClick={connectWallet}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Gift size={20} />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!walletConnected ? (
          <div className="text-center py-12">
            <Gift className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
            <p className="text-gray-500 mb-6">
              Connect your Algorand wallet to view your NFT collection from attended events.
            </p>
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Gift size={20} className="mr-2" />
              Connect Wallet & View NFTs
            </button>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total NFTs</p>
                    <p className="text-3xl font-bold text-gray-900">{userNFTs.length}</p>
                  </div>
                  <Gift className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Events Attended</p>
                    <p className="text-3xl font-bold text-green-600">
                      {new Set(userNFTs.map(nft => nft.eventName)).size}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">VIP Tickets</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {userNFTs.filter(nft => nft.ticketTier.toLowerCase() === 'vip').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {userNFTs.reduce((total, nft) => {
                        const baseValue = nft.ticketTier.toLowerCase() === 'vip' ? 25 : 
                                        nft.ticketTier.toLowerCase() === 'premium' ? 15 : 10;
                        return total + baseValue;
                      }, 0)} ALGO
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
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
                      placeholder="Search NFTs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Tiers</option>
                      <option value="vip">VIP</option>
                      <option value="premium">Premium</option>
                      <option value="general">General</option>
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

            {/* NFTs Display */}
            {filteredNFTs.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Attend events to start collecting NFTs!'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <button
                    onClick={() => window.location.href = '/events'}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Calendar size={16} className="mr-2" />
                    Browse Events
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNFTs.map((nft) => (
                  <div key={nft.assetId} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={nft.url} 
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{nft.eventName}</h3>
                          <p className="text-sm text-gray-600">{nft.name}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTicketTierColor(nft.ticketTier)}`}>
                          {getTicketTierIcon(nft.ticketTier)} {nft.ticketTier}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={14} className="mr-2" />
                          <span>{new Date(nft.eventDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin size={14} className="mr-2" />
                          <span className="truncate">{nft.eventLocation}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          <Eye size={16} className="mr-1" />
                          View
                        </button>
                        <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                          <Share2 size={16} />
                        </button>
                        <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NFT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Tier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredNFTs.map((nft) => (
                        <tr key={nft.assetId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                src={nft.url} 
                                alt={nft.name}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{nft.name}</div>
                                <div className="text-sm text-gray-500">ID: {nft.assetId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{nft.eventName}</div>
                            <div className="text-sm text-gray-500">{nft.eventLocation}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTicketTierColor(nft.ticketTier)}`}>
                              {getTicketTierIcon(nft.ticketTier)} {nft.ticketTier}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(nft.eventDate).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">{new Date(nft.mintedAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">View</button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <Share2 size={16} />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <Download size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NFTGallery;
