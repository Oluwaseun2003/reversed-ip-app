// frontend/src/components/IPHistory.tsx

import React, { useState, useEffect } from 'react';
import { apiService, type IPHistoryEntry, APIError } from '../services/api';

interface HistoryData {
  entries: IPHistoryEntry[];
  total: number;
  page: number;
  limit: number;
}

export const IPHistory: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<IPHistoryEntry[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const itemsPerPage = 10;

  const fetchHistory = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getHistory(page, itemsPerPage);
      setHistoryData(response.data);
      setCurrentPage(page);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Failed to load history');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await apiService.searchIPs(query.trim(), 20);
      setSearchResults(response.data.results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const totalPages = historyData ? Math.ceil(historyData.total / itemsPerPage) : 0;
  const displayData = searchQuery.trim() ? searchResults : historyData?.entries || [];

  const renderPagination = () => {
    if (searchQuery.trim() || !historyData || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing page {currentPage} of {totalPages} ({historyData.total} total entries)
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchHistory(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + Math.max(1, currentPage - 2);
            if (page > totalPages) return null;
            
            return (
              <button
                key={page}
                onClick={() => fetchHistory(page)}
                className={`px-3 py-2 text-sm rounded ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => fetchHistory(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading && !historyData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">IP History</h2>
              <p className="text-gray-600 mt-1">Browse all reversed IP addresses</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search IPs..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => fetchHistory(currentPage)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="p-6">
          {isSearching && (
            <div className="text-center py-4">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </div>
            </div>
          )}

          {displayData.length === 0 && !isSearching ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery.trim() ? 'No results found' : 'No history yet'}
              </h3>
              <p className="text-gray-600">
                {searchQuery.trim() 
                  ? `No IP addresses match "${searchQuery}"`
                  : 'Start reversing some IP addresses to see them here!'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayData.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">ORIGINAL IP</label>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {entry.originalIP}
                        </code>
                        <button
                          onClick={() => copyToClipboard(entry.originalIP)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy original IP"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">REVERSED IP</label>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-green-600 bg-green-50 px-2 py-1 rounded font-semibold">
                          {entry.reversedIP}
                        </code>
                        <button
                          onClick={() => copyToClipboard(entry.reversedIP)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy reversed IP"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">
                        {formatDate(entry.timestamp)}
                      </div>
                      {entry.requestIP && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                          From: {entry.requestIP}
                        </div>
                      )}
                    </div>
                  </div>

                  {entry.userAgent && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">User Agent:</span>{' '}
                        <span className="font-mono">{entry.userAgent}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {renderPagination()}
        </div>
      </div>
    </div>
  );
};
                