import React from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { dynaQRResolver } from '../services/resolver';

function Resolver() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [resolving, setResolving] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const resolveAndRedirect = async () => {
      // Get event ID from URL parameters
      let eventId = searchParams.get('event');
      
      // Fallback: parse from the full URL if searchParams is empty
      if (!eventId && location.search) {
        const urlParams = new URLSearchParams(location.search);
        eventId = urlParams.get('event');
      }

      console.log('Resolver - Location:', location);
      console.log('Resolver - Search params:', location.search);
      console.log('Resolver - Event ID:', eventId);

      if (!eventId) {
        console.error('No event ID found in URL');
        setError('No event ID provided in URL');
        setResolving(false);
        return;
      }

      try {
        console.log(`Resolving event: ${eventId}`);
        const result = await dynaQRResolver.resolveEvent(eventId);
        console.log('Resolve result:', result);
        
        if (result.success && result.redirectUrl) {
          // Track the scan and redirect
          console.log(`Redirecting to: ${result.redirectUrl}`);
          
          // Add a small delay to show the loading screen
          setTimeout(() => {
            window.location.href = result.redirectUrl!;
          }, 1500);
        } else {
          setError(result.error || 'Event not found or inactive');
          setResolving(false);
        }
      } catch (err) {
        console.error('Resolver error:', err);
        setError('Resolver service unavailable');
        setResolving(false);
      }
    };

    resolveAndRedirect();
  }, [searchParams, location]);

  if (resolving) {
    const eventId = searchParams.get('event') || new URLSearchParams(location.search).get('event');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">🔗 Resolving Dynamic QR</h2>
            <p className="text-gray-600 mb-4">
              Looking up destination for event: 
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded ml-1">
                {eventId || 'Loading...'}
              </span>
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>• Querying Algorand blockchain...</p>
              <p>• Retrieving current destination...</p>
              <p>• Preparing redirect...</p>
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>DynaQR:</strong> Static QR codes, dynamic destinations powered by blockchain
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const eventId = searchParams.get('event') || new URLSearchParams(location.search).get('event');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Resolution Failed</h2>
            <p className="text-gray-600 mb-4">Unable to resolve the QR code destination.</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                <strong>Error:</strong> {error}
              </p>
              {eventId && (
                <p className="text-sm text-red-600 mt-2">
                  <strong>Event ID:</strong> <span className="font-mono">{eventId}</span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Try Again
              </button>
              
              <a
                href="/"
                className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                🏠 Go to Dashboard
              </a>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>Common issues:</p>
              <ul className="mt-2 space-y-1">
                <li>• Event may have expired</li>
                <li>• Invalid or mistyped event ID</li>
                <li>• Network connectivity issues</li>
                <li>• Event may be inactive or deleted</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default Resolver;
