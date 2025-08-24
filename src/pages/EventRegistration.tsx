import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Tag, 
  Wallet,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
  QrCode,
  Ticket,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';
import { dynaQRService, DynamicQREvent } from '../../services/algorand';
import { nftService, NFTCreationParams } from '../../services/nft-service';

interface EventRegistrationData {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  ticketTier: string;
  paymentAmount: number;
  paymentMethod: 'algo' | 'free';
}

interface TicketTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'ALGO' | 'USD';
  quantity: number;
  available: number;
  benefits: string[];
}

const EventRegistration: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<DynamicQREvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<any>(null);
  
  const [formData, setFormData] = useState<EventRegistrationData>({
    eventId: eventId || '',
    attendeeName: '',
    attendeeEmail: '',
    attendeePhone: '',
    ticketTier: 'general',
    paymentAmount: 0,
    paymentMethod: 'free'
  });

  const [ticketTiers] = useState<TicketTier[]>([
    {
      id: 'general',
      name: 'General Admission',
      description: 'Standard access to the event',
      price: 10,
      currency: 'ALGO',
      quantity: 100,
      available: 85
    },
    {
      id: 'vip',
      name: 'VIP Access',
      description: 'Premium experience with exclusive benefits',
      price: 25,
      currency: 'ALGO',
      quantity: 50,
      available: 23
    },
    {
      id: 'premium',
      name: 'Premium Package',
      description: 'Ultimate experience with all perks included',
      price: 50,
      currency: 'ALGO',
      quantity: 25,
      available: 12
    }
  ]);

  // Load event data on component mount
  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  // Check wallet connection on component mount
  useEffect(() => {
    const account = dynaQRService.getConnectedAccount();
    if (account) {
      setWalletConnected(true);
      setConnectedAccount(account);
    }
  }, []);

  const loadEventData = async () => {
    try {
      setLoading(true);
      if (eventId) {
        const result = await dynaQRService.getEvent(eventId);
        if (result.success && result.data) {
          setEvent(result.data);
          // Set default ticket tier and payment amount
          const defaultTier = ticketTiers[0];
          setFormData(prev => ({
            ...prev,
            ticketTier: defaultTier.id,
            paymentAmount: defaultTier.price,
            paymentMethod: defaultTier.price > 0 ? 'algo' : 'free'
          }));
        } else {
          toast.error('Event not found or not accessible');
          navigate('/events');
        }
      }
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      const account = await dynaQRService.connectWallet('pera');
      if (account) {
        setWalletConnected(true);
        setConnectedAccount(account);
        toast.success('🔗 Wallet connected successfully!');
      }
    } catch (error) {
      toast.error('❌ Failed to connect wallet');
    }
  };

  const handleTicketTierChange = (tierId: string) => {
    const selectedTier = ticketTiers.find(tier => tier.id === tierId);
    if (selectedTier) {
      setFormData(prev => ({
        ...prev,
        ticketTier: tierId,
        paymentAmount: selectedTier.price,
        paymentMethod: selectedTier.price > 0 ? 'algo' : 'free'
      }));
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.attendeeName || !formData.attendeeEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.paymentMethod === 'algo' && formData.paymentAmount > 0) {
      // Check if user has sufficient ALGO balance
      const balance = await dynaQRService.getAccountBalance(connectedAccount.address);
      const requiredBalance = formData.paymentAmount * 1000000; // Convert to microALGOs
      
      if (balance < requiredBalance) {
        toast.error(`Insufficient ALGO balance. Required: ${formData.paymentAmount} ALGO, Available: ${balance / 1000000} ALGO`);
        return;
      }
    }

    setRegistering(true);
    
    try {
      // Register for event on blockchain
      const registrationResult = await dynaQRService.registerForEvent({
        eventId: formData.eventId,
        attendeeAddress: connectedAccount.address,
        ticketTier: formData.ticketTier,
        paymentAmount: formData.paymentAmount * 1000000, // Convert to microALGOs
        attendeeName: formData.attendeeName,
        attendeeEmail: formData.attendeeEmail
      });

      if (registrationResult.success) {
        toast.success('🎉 Registration successful! You will receive an NFT when you attend the event.');
        setRegistrationComplete(true);
      } else {
        throw new Error(registrationResult.error || 'Registration failed');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(`❌ Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRegistering(false);
    }
  };

  const handleAttendanceConfirmation = async () => {
    if (!event || !walletConnected) return;

    try {
      setRegistering(true);
      
      // Confirm attendance on blockchain
      const attendanceResult = await dynaQRService.confirmAttendance(event.eventId);
      
      if (attendanceResult.success) {
        // Create and mint NFT
        const nftParams: NFTCreationParams = {
          eventName: event.eventName,
          eventId: event.eventId,
          attendeeName: formData.attendeeName,
          attendeeAddress: connectedAccount.address,
          eventDate: event.createdAt,
          eventLocation: 'Event Location', // You can add this to event data
          ticketTier: formData.ticketTier,
          description: `Proof of attendance for ${event.eventName}`
        };

        const nftResult = await nftService.createNFTAsset(nftParams);
        
        if (nftResult.success && nftResult.assetId) {
          // Mint NFT to attendee
          const mintResult = await nftService.mintNFTToAttendee(nftResult.assetId, connectedAccount.address);
          
          if (mintResult.success) {
            toast.success('🎉 Attendance confirmed! Your NFT has been minted and sent to your wallet.');
            // You can redirect to NFT gallery or show NFT details
          } else {
            toast.error('NFT minting failed, but attendance was confirmed');
          }
        } else {
          toast.error('NFT creation failed, but attendance was confirmed');
        }
      } else {
        throw new Error(attendanceResult.error || 'Attendance confirmation failed');
      }
      
    } catch (error) {
      console.error('Attendance confirmation error:', error);
      toast.error(`❌ Attendance confirmation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or is not accessible.</p>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md border p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🎉 Registration Complete!</h1>
            <p className="text-lg text-gray-600 mb-8">
              You have successfully registered for <strong>{event.eventName}</strong>. 
              Your registration details have been recorded on the Algorand blockchain.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-green-800 mb-4">📋 Registration Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-green-600">Event Name</p>
                  <p className="font-semibold text-green-800">{event.eventName}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Ticket Tier</p>
                  <p className="font-semibold text-green-800 capitalize">{formData.ticketTier}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Attendee Name</p>
                  <p className="font-semibold text-green-800">{formData.attendeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Payment Amount</p>
                  <p className="font-semibold text-green-800">
                    {formData.paymentAmount > 0 ? `${formData.paymentAmount} ALGO` : 'Free'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">🎫 Next Steps</h2>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                  <div>
                    <p className="font-semibold text-blue-800">Attend the Event</p>
                    <p className="text-sm text-blue-600">Show up at the event location on the scheduled date</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                  <div>
                    <p className="font-semibold text-blue-800">Confirm Attendance</p>
                    <p className="text-sm text-blue-600">Scan the QR code or confirm attendance through the app</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                  <div>
                    <p className="font-semibold text-blue-800">Receive NFT</p>
                    <p className="text-sm text-blue-600">Get your exclusive event NFT as proof of attendance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAttendanceConfirmation}
                disabled={registering}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {registering ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} className="mr-2" />
                    Confirm Attendance & Get NFT
                  </>
                )}
              </button>
              
              <button
                onClick={() => navigate('/events')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse More Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-md border p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.eventName}</h1>
              <p className="text-gray-600 mb-6">{event.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Event Location</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">
                    {event.scanCount} registered
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600 capitalize">{event.accessType}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Event Status</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">Active</div>
                <p className="text-sm text-blue-600">Registration Open</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Register for Event</h2>
            
            {!walletConnected && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔐 Connect Wallet Required</h3>
                    <p className="text-yellow-700">
                      Connect your Algorand wallet to register for this event and receive your NFT.
                    </p>
                  </div>
                  <button
                    onClick={connectWallet}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Wallet size={20} className="mr-2" />
                    Connect Wallet
                  </button>
                </div>
              </div>
            )}

            {walletConnected && connectedAccount && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-green-800 font-semibold">✅ Wallet Connected</span>
                    <p className="text-sm text-green-600">{connectedAccount.address}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    Ready to Register
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleRegistration} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.attendeeName}
                  onChange={(e) => handleInputChange('attendeeName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                  required
                  disabled={!walletConnected}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.attendeeEmail}
                  onChange={(e) => handleInputChange('attendeeEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email address"
                  required
                  disabled={!walletConnected}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.attendeePhone}
                  onChange={(e) => handleInputChange('attendeePhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number"
                  disabled={!walletConnected}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Tier *
                </label>
                <div className="space-y-3">
                  {ticketTiers.map((tier) => (
                    <label
                      key={tier.id}
                      className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.ticketTier === tier.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="ticketTier"
                        value={tier.id}
                        checked={formData.ticketTier === tier.id}
                        onChange={() => handleTicketTierChange(tier.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        disabled={!walletConnected}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-gray-900">{tier.name}</div>
                            <div className="text-sm text-gray-600">{tier.description}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              Available: {tier.available} / {tier.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {tier.price > 0 ? `${tier.price} ALGO` : 'Free'}
                            </div>
                            {tier.available < 10 && (
                              <div className="text-sm text-red-600">Limited availability</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={registering || !walletConnected}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {registering ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Registration...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} className="mr-2" />
                    {formData.paymentAmount > 0 
                      ? `Register & Pay ${formData.paymentAmount} ALGO`
                      : 'Register for Free'
                    }
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info & Benefits */}
          <div className="space-y-6">
            {/* Event Benefits */}
            <div className="bg-white rounded-lg shadow-md border p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🎁 What You'll Get</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Ticket className="h-6 w-6 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Event Access</div>
                    <div className="text-sm text-gray-600">Full access to the event and all activities</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Gift className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Exclusive NFT</div>
                    <div className="text-sm text-gray-600">Unique NFT as proof of attendance</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <QrCode className="h-6 w-6 text-purple-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Digital Badge</div>
                    <div className="text-sm text-gray-600">Verifiable blockchain credential</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-md border p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">💳 Payment Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected Tier:</span>
                  <span className="font-semibold capitalize">{formData.ticketTier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold">
                    {formData.paymentAmount > 0 ? `${formData.paymentAmount} ALGO` : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network Fee:</span>
                  <span className="font-semibold">~0.001 ALGO</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-blue-600">
                    {formData.paymentAmount > 0 ? `${formData.paymentAmount + 0.001} ALGO` : 'Free'}
                  </span>
                </div>
              </div>
            </div>

            {/* Blockchain Benefits */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200 p-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">⛓️ Blockchain Benefits</h3>
              <div className="space-y-3 text-sm text-blue-700">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Immutable registration record</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Verifiable attendance proof</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Unique digital collectible</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Transferable credentials</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;
