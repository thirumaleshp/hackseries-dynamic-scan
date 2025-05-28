import React, { useState } from 'react';
import { CheckCircle, AlertCircle, QrCode, Clock, ChevronDown, ChevronUp, Filter } from 'lucide-react';

const History: React.FC = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all',
  });

  // Mock data for transaction history
  const transactions = [
    {
      id: 'txn-001',
      type: 'scan',
      code: 'ALGO-QR-001',
      label: 'Product Authentication',
      timestamp: '2023-05-15T14:32:00',
      status: 'verified',
      transactionId: 'ALGO-XXXXXX-001',
    },
    {
      id: 'txn-002',
      type: 'generation',
      code: 'ALGO-QR-024',
      label: 'Event Ticket #1',
      timestamp: '2023-05-15T13:45:00',
      status: 'pending',
      transactionId: 'ALGO-XXXXXX-002',
    },
    {
      id: 'txn-003',
      type: 'scan',
      code: 'ALGO-QR-018',
      label: 'Product Authentication',
      timestamp: '2023-05-15T10:22:00',
      status: 'verified',
      transactionId: 'ALGO-XXXXXX-003',
    },
    {
      id: 'txn-004',
      type: 'scan',
      code: 'ALGO-QR-022',
      label: 'Event Ticket #2',
      timestamp: '2023-05-14T16:05:00',
      status: 'verified',
      transactionId: 'ALGO-XXXXXX-004',
    },
    {
      id: 'txn-005',
      type: 'generation',
      code: 'ALGO-QR-023',
      label: 'Event Ticket #3',
      timestamp: '2023-05-14T15:30:00',
      status: 'verified',
      transactionId: 'ALGO-XXXXXX-005',
    },
    {
      id: 'txn-006',
      type: 'scan',
      code: 'ALGO-QR-019',
      label: 'Product Authentication',
      timestamp: '2023-05-13T09:17:00',
      status: 'failed',
      transactionId: 'ALGO-XXXXXX-006',
    },
  ];

  // Filter transactions based on current filter settings
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type
    if (filter.type !== 'all' && transaction.type !== filter.type) {
      return false;
    }
    
    // Filter by status
    if (filter.status !== 'all' && transaction.status !== filter.status) {
      return false;
    }
    
    // Filter by date
    if (filter.dateRange !== 'all') {
      const txnDate = new Date(transaction.timestamp);
      const today = new Date();
      
      if (filter.dateRange === 'today') {
        return txnDate.toDateString() === today.toDateString();
      } else if (filter.dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return txnDate >= weekAgo;
      } else if (filter.dateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        return txnDate >= monthAgo;
      }
    }
    
    return true;
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1>Transaction History</h1>
        
        <button
          type="button"
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Filter size={16} className="mr-2" />
          Filters
          {filterOpen ? (
            <ChevronUp size={16} className="ml-2" />
          ) : (
            <ChevronDown size={16} className="ml-2" />
          )}
        </button>
      </div>

      {/* Filters */}
      {filterOpen && (
        <div className="card animate-fade-in p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="all">All Types</option>
                <option value="scan">Scans</option>
                <option value="generation">Generations</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateRange" className="mb-1 block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <select
                id="dateRange"
                name="dateRange"
                value={filter.dateRange}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-600">Type</th>
                <th className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-600">QR Code</th>
                <th className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-600">Date & Time</th>
                <th className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-600">Transaction ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center">
                        <div
                          className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${
                            transaction.type === 'scan'
                              ? 'bg-secondary-100 text-secondary-500'
                              : 'bg-primary-100 text-primary-500'
                          }`}
                        >
                          {transaction.type === 'scan' ? (
                            <Clock size={16} />
                          ) : (
                            <QrCode size={16} />
                          )}
                        </div>
                        <span className="capitalize">{transaction.type}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div>
                        <div className="font-medium">{transaction.code}</div>
                        <div className="text-xs text-gray-500">{transaction.label}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {formatDate(transaction.timestamp)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {transaction.status === 'verified' ? (
                        <span className="badge-success flex items-center">
                          <CheckCircle size={12} className="mr-1" />
                          Verified
                        </span>
                      ) : transaction.status === 'pending' ? (
                        <span className="badge-warning flex items-center">
                          <Clock size={12} className="mr-1" />
                          Pending
                        </span>
                      ) : (
                        <span className="badge-error flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                      {transaction.transactionId}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No transactions match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;