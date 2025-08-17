// frontend/src/components/IPReverser.tsx

import React, { useState } from 'react';
import { apiService, type ReverseIPResponse, APIError } from '../services/api';

interface IPResult {
  originalIP: string;
  reversedIP: string;
  requestIP?: string;
  timestamp: string;
  id: string;
}

export const IPReverser: React.FC = () => {
  const [ipAddress, setIpAddress] = useState<string>('');
  const [result, setResult] = useState<IPResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validateIP = (ip: string): boolean => {
    // Basic IP validation (IPv4)
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // Basic IPv6 validation (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ipAddress.trim()) {
      setError('Please enter an IP address');
      return;
    }

    if (!validateIP(ipAddress.trim())) {
      setError('Please enter a valid IP address');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response: ReverseIPResponse = await apiService.reverseIP(ipAddress.trim());
      setResult(response.data);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetMyIP = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setIpAddress(''); // Clear manual input

    try {
      const response: ReverseIPResponse = await apiService.getMyIP();
      setResult(response.data);
      setIpAddress(response.data.originalIP); // Show the detected IP
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Failed to detect your IP address');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">IP Address Reverser</h1>
        <p className="text-gray-600">
          Enter an IP address to reverse its format (e.g., 192.168.1.1 → 1.1.168.192)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Reversing...' : 'Reverse IP'}
            </button>
            <button
              type="button"
              onClick={handleGetMyIP}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap"
            >
              My IP
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-4">
            <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-green-800">Success!</h3>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-1">Original IP</label>
                <div className="flex items-center justify-between">
                  <code className="text-lg font-mono text-blue-600">{result.originalIP}</code>
                  <button
                    onClick={() => copyToClipboard(result.originalIP)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reversed IP</label>
                <div className="flex items-center justify-between">
                  <code className="text-lg font-mono text-green-600 font-bold">{result.reversedIP}</code>
                  <button
                    onClick={() => copyToClipboard(result.reversedIP)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-white p-3 rounded border">
              <div className="flex justify-between items-center">
                <span>Processed at: {new Date(result.timestamp).toLocaleString()}</span>
                {result.requestIP && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    From: {result.requestIP}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-500">
          All reversed IPs are stored in the database for history and statistics.
        </p>
      </div>
    </div>
  );
};