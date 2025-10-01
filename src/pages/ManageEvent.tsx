import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Calendar,
  Copy,
  Link2,
  MapPin,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import WalletConnection from '../components/WalletConnection';
import { dynaQRService, DynamicQREvent } from '../services/algorand';
import { WalletAccount } from '../services/wallet-service';

type EventAnalytics = Awaited<ReturnType<typeof dynaQRService.getEventAnalytics>>;

const ManageEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<DynamicQREvent | null>(null);
  const [analytics, setAnalytics] = useState<EventAnalytics>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletConnected, setWalletConnected] = useState(dynaQRService.isWalletConnected());
  const [account, setAccount] = useState<WalletAccount | null>(dynaQRService.getConnectedAccount());
  const [currentUrlInput, setCurrentUrlInput] = useState('');
  const [updatingUrl, setUpdatingUrl] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const organizerAddress = useMemo(() => event?.owner, [event]);
  const isOwner = useMemo(() => {
    if (!organizerAddress || !account) return false;
    return organizerAddress === account.address;
  }, [organizerAddress, account]);

  const maxDailyScans = useMemo(() => {
    if (!analytics?.dailyScans?.length) return 1;
    return Math.max(...analytics.dailyScans, 1);
  }, [analytics]);

  const loadEventDetails = useCallback(
    async (withSpinner = false) => {
      if (!eventId) return;
      withSpinner ? setRefreshing(true) : setLoading(true);

      try {
        const eventResult = await dynaQRService.getEvent(eventId);
        if (eventResult.success && eventResult.data) {
          const eventData = eventResult.data as DynamicQREvent;
          setEvent(eventData);
          setCurrentUrlInput(eventData.currentUrl);
        } else {
          setEvent(null);
          toast.error(eventResult.error || 'Event not found');
        }

        const analyticsResult = await dynaQRService.getEventAnalytics(eventId);
        setAnalytics(analyticsResult);
      } catch (error) {
        console.error('Failed to load event details:', error);
        toast.error('Failed to load event details');
      } finally {
        withSpinner ? setRefreshing(false) : setLoading(false);
      }
    },
    [eventId]
  );

  useEffect(() => {
    loadEventDetails();
  }, [loadEventDetails]);

  const handleWalletConnect = (connectedAccount: WalletAccount) => {
    setWalletConnected(true);
    setAccount(connectedAccount);
    loadEventDetails(true);
  };

  const handleWalletDisconnect = () => {
    setWalletConnected(false);
    setAccount(null);
  };

  const handleRefresh = () => {
    loadEventDetails(true);
  };

  const handleUrlUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !currentUrlInput.trim()) {
      toast.error('Enter a valid destination URL');
      return;
    }

    setUpdatingUrl(true);
    try {
      const result = await dynaQRService.updateEventUrl(eventId, currentUrlInput.trim());
      if (result.success) {
        toast.success('Destination updated on Algorand');
        await loadEventDetails(true);
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (error) {
      console.error('URL update failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update URL');
    } finally {
      setUpdatingUrl(false);
    }
  };

  const handleDeactivate = async () => {
    if (!eventId) return;
    setDeactivating(true);
    try {
      const result = await dynaQRService.deactivateEvent(eventId);
      if (result.success) {
        toast.success('Event deactivated');
        await loadEventDetails(true);
      } else {
        throw new Error(result.error || 'Deactivation failed');
      }
    } catch (error) {
      console.error('Event deactivation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate event');
    } finally {
      setDeactivating(false);
    }
  };

  const handleCopyResolver = async () => {
    const resolverUrl = event?.resolverUrl;
    if (!resolverUrl) return;

    try {
      if (!navigator.clipboard) {
        toast.error('Clipboard unavailable');
        return;
      }
      await navigator.clipboard.writeText(resolverUrl);
      toast.success('Resolver URL copied');
    } catch (error) {
      console.error('Failed to copy resolver URL:', error);
      toast.error('Unable to copy resolver URL');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading event management...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event not found</h2>
          <p className="text-gray-600 mb-4">The requested event could not be located.</p>
          <RouterLink
            to="/events"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to events
          </RouterLink>
        </div>
      </div>
    );
  }

  const ticketTiers = event.metadata?.ticketTiers || [];
  const tags = event.metadata?.tags || [];
  const organizer = event.metadata?.organizer;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Manage Event</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {event.active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-500 font-mono">{event.eventId}</span>
            </div>
            <p className="text-gray-600 max-w-2xl">{event.description || 'No description available.'}</p>
          </div>

          <div className="flex items-center space-x-3">
            <RouterLink
              to="/events"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              Back to events
            </RouterLink>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Refreshing
                </>
              ) : (
                <>
                  <RefreshCcw size={16} className="mr-2" />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Blockchain status</h2>
                  <p className="text-sm text-gray-600">Owner: {organizerAddress}</p>
                </div>
                <div className="w-full sm:w-auto">
                  <WalletConnection
                    onConnect={handleWalletConnect}
                    onDisconnect={handleWalletDisconnect}
                    showBalance
                  />
                </div>
              </div>

              {!walletConnected && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                  Connect an Algorand wallet to manage this event.
                </div>
              )}

              {walletConnected && !isOwner && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 mt-0.5" />
                  <span>
                    Connected wallet does not match the event owner. Switch to {organizerAddress} to make changes.
                  </span>
                </div>
              )}

              {walletConnected && isOwner && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 mt-0.5" />
                  <span>Organizer wallet connected. You can update event settings.</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Dynamic redirect</h2>
                  <p className="text-sm text-gray-600">Update the destination your QR code resolves to.</p>
                </div>
                <button
                  onClick={handleCopyResolver}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <Copy size={16} className="mr-2" />
                  Copy resolver URL
                </button>
              </div>

              <div className="mb-6">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">Resolver URL</div>
                <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-md text-sm break-all">
                  {event.resolverUrl}
                </div>
              </div>

              <form onSubmit={handleUrlUpdate} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Current destination URL</span>
                  <input
                    type="url"
                    value={currentUrlInput}
                    onChange={(e) => setCurrentUrlInput(e.target.value)}
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://your-event-destination.com"
                    required
                    disabled={!isOwner}
                  />
                </label>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <Link2 size={16} />
                    <span>Last updated: {event.metadata?.lastUpdatedAt ? new Date(event.metadata.lastUpdatedAt).toLocaleString() : '—'}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={!isOwner || updatingUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {updatingUrl ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Update destination'
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Event details</h2>
                <div className="text-sm text-gray-500 flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Created {new Date(event.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{organizer?.organization || 'Algorand Network'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-gray-400" />
                  <span>
                    {event.registeredCount} registered • max {event.maxCapacity || '∞'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity size={16} className="text-gray-400" />
                  <span>{event.scanCount} scans</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Access type</span>
                  <span className="capitalize">{event.accessType}</span>
                </div>
              </div>

              {tags.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-2">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {ticketTiers.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-3">Ticket tiers</span>
                  <div className="space-y-3">
                    {ticketTiers.map((tier) => (
                      <div key={tier.id || tier.name} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <div className="font-semibold text-gray-900">{tier.name}</div>
                            {tier.description && <div className="text-sm text-gray-600">{tier.description}</div>}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {tier.price > 0 ? `${tier.price} ${tier.currency}` : 'Free'}
                            </div>
                            {typeof tier.quantity === 'number' && (
                              <div className="text-xs text-gray-500">{tier.quantity} available</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isOwner && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Event controls</h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    Deactivate the event to stop new scans and registrations.
                  </div>
                  <button
                    onClick={handleDeactivate}
                    disabled={!event.active || deactivating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deactivating ? 'Deactivating...' : 'Deactivate event'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 size={18} className="mr-2" />
                Performance
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total scans</span>
                  <span className="font-semibold text-gray-900">{analytics?.totalScans ?? event.scanCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Registrations</span>
                  <span className="font-semibold text-gray-900">{analytics?.totalRegistrations ?? event.registeredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg. scans/day</span>
                  <span className="font-semibold text-gray-900">
                    {analytics ? analytics.averageScansPerDay.toFixed(1) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Last scanned</span>
                  <div className="font-medium text-gray-900">
                    {analytics?.lastScanned ? new Date(analytics.lastScanned).toLocaleString() : 'No scans recorded'}
                  </div>
                </div>
              </div>

              {analytics?.dailyScans && (
                <div className="mt-4">
                  <div className="text-xs font-medium text-gray-500 uppercase mb-2">Last 7 days</div>
                  <div className="space-y-2">
                    {analytics.dailyScans.map((value, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <span className="w-16">Day {index + 1}</span>
                        <div className="flex-1 mx-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(4, (value / maxDailyScans) * 100))}%`
                            }}
                          />
                        </div>
                        <span className="w-10 text-right text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Organizer</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <div>
                  <span className="text-gray-500 block">Name</span>
                  <span>{organizer?.name || 'Unspecified'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Email</span>
                  <span>{organizer?.email || 'Unspecified'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Organization</span>
                  <span>{organizer?.organization || 'Unspecified'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEvent;
