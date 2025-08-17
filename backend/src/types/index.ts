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
    };
  }
  
  // Request with client IP extraction
  export interface RequestWithIP extends Request {
    clientIP?: string;
  }