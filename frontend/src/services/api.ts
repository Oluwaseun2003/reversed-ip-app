// frontend/src/services/api.ts

export interface ReverseIPRequest {
    ip: string;
  }
  
  export interface ReverseIPResponse {
    success: boolean;
    data: {
      originalIP: string;
      reversedIP: string;
      requestIP?: string;
      timestamp: string;
      id: string;
    };
    message?: string;
  }
  
  export interface GetIPHistoryResponse {
    success: boolean;
    data: {
      entries: IPHistoryEntry[];
      total: number;
      page: number;
      limit: number;
    };
    message?: string;
  }
  
  export interface IPHistoryEntry {
    id: string;
    originalIP: string;
    reversedIP: string;
    requestIP?: string;
    userAgent?: string;
    timestamp: string;
    createdAt: string;
  }
  
  export interface APIError {
    success: false;
    error: {
      message: string;
      code?: string;
      details?: any;
    };
    timestamp: string;
  }
  
  export interface HealthCheckResponse {
    success: boolean;
    data: {
      status: 'healthy' | 'unhealthy';
      timestamp: string;
      version: string;
      database: 'connected' | 'disconnected';
      uptime: number;
      responseTime?: number;
      environment?: string;
    };
  }
  
  export interface StatsResponse {
    success: boolean;
    data: {
      totalEntries: number;
      uniqueIPs: number;
      todayEntries: number;
      topRequestIPs: { ip: string; count: number }[];
    };
    message?: string;
  }
  
  export interface SearchResponse {
    success: boolean;
    data: {
      results: IPHistoryEntry[];
      query: string;
      count: number;
    };
    message?: string;
  }
  
  class APIService {
    private baseURL: string;
  
    constructor() {
      this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    }
  
    private async request<T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T> {
      const url = `${this.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };
  
      try {
        const response = await fetch(url, config);
        const data = await response.json();
  
        if (!response.ok) {
          throw new APIError(data.error?.message || 'An error occurred', response.status, data);
        }
  
        return data;
      } catch (error) {
        if (error instanceof APIError) {
          throw error;
        }
        
        // Network or other errors
        throw new APIError(
          error instanceof Error ? error.message : 'Network error occurred',
          0,
          { originalError: error }
        );
      }
    }
  
    // Health check
    async healthCheck(): Promise<HealthCheckResponse> {
      return this.request<HealthCheckResponse>('/health');
    }
  
    // Reverse an IP address
    async reverseIP(ip: string): Promise<ReverseIPResponse> {
      return this.request<ReverseIPResponse>('/api/ip/reverse', {
        method: 'POST',
        body: JSON.stringify({ ip }),
      });
    }
  
    // Get my IP reversed
    async getMyIP(): Promise<ReverseIPResponse> {
      return this.request<ReverseIPResponse>('/api/ip/my-ip');
    }
  
    // Get IP history with pagination
    async getHistory(page: number = 1, limit: number = 10): Promise<GetIPHistoryResponse> {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      return this.request<GetIPHistoryResponse>(`/api/ip/history?${params}`);
    }
  
    // Get statistics
    async getStats(): Promise<StatsResponse> {
      return this.request<StatsResponse>('/api/ip/stats');
    }
  
    // Search IPs
    async searchIPs(query: string, limit: number = 10): Promise<SearchResponse> {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
      });
      
      return this.request<SearchResponse>(`/api/ip/search?${params}`);
    }
  }
  
  // Custom API Error class
  export class APIError extends Error {
    public statusCode: number;
    public details?: any;
  
    constructor(message: string, statusCode: number, details?: any) {
      super(message);
      this.name = 'APIError';
      this.statusCode = statusCode;
      this.details = details;
    }
  }
  
  // Export singleton instance
  export const apiService = new APIService();
  export default apiService;