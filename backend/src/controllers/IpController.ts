import type { Request, Response } from 'express';
import { ipService } from '../services/IpService';
import { isValidIP, extractClientIP } from '../utils/IpUtils';
import type { 
  ReverseIPRequest, 
  ReverseIPResponse, 
  GetIPHistoryResponse,
  APIError,
  RequestWithIP 
} from '../types/index';

interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface SearchQuery {
  q?: string;
  limit?: string;
}

export class IPController {
  /**
   * POST /api/ip/reverse
   * Reverse an IP address and store it in database
   */
  async reverseIP(req: Request, res: Response): Promise<void> {
    try {
      const { ip } = req.body as ReverseIPRequest;
      
      // Validate input
      if (!ip) {
        const error: APIError = {
          success: false,
          error: {
            message: 'IP address is required',
            code: 'MISSING_IP',
          },
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(error);
        return;
      }

      if (!isValidIP(ip)) {
        const error: APIError = {
          success: false,
          error: {
            message: 'Invalid IP address format',
            code: 'INVALID_IP',
            details: { providedIP: ip },
          },
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(error);
        return;
      }

      // Process the IP reversal
      const result = await ipService.reverseAndStore(ip, req);
      
      const response: ReverseIPResponse = {
        success: true,
        data: {
          id: result.id,
          originalIP: result.originalIP,
          reversedIP: result.reversedIP,
          requestIP: result.requestIP,
          timestamp: result.timestamp.toISOString(),
        },
        message: 'IP address reversed and stored successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error in reverseIP controller:', error);
      
      const errorResponse: APIError = {
        success: false,
        error: {
          message: 'Internal server error while processing IP reversal',
          code: 'INTERNAL_ERROR',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
        timestamp: new Date().toISOString(),
      };
      
      res.status(500).json(errorResponse);
    }
  }

  /**
   * GET /api/ip/history
   * Get paginated history of reversed IPs
   */
  async getHistory(req: Request<{}, GetIPHistoryResponse, {}, PaginationQuery>, res: Response<GetIPHistoryResponse | APIError>): Promise<void> {
    try {
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = Math.min(parseInt(req.query.limit as string) || 10, 100); // Max 100 items per page
      
      if (page < 1 || limit < 1) {
        const error: APIError = {
          success: false,
          error: {
            message: 'Page and limit must be positive integers',
            code: 'INVALID_PAGINATION',
          },
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(error);
        return;
      }

      const result = await ipService.getHistory(page, limit);
      
      const response: GetIPHistoryResponse = {
        success: true,
        data: result,
        message: 'History retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in getHistory controller:', error);
      
      const errorResponse: APIError = {
        success: false,
        error: {
          message: 'Internal server error while retrieving history',
          code: 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
      };
      
      res.status(500).json(errorResponse);
    }
  }

  /**
   * GET /api/ip/stats
   * Get statistics about stored IPs
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await ipService.getStats();
      
      res.status(200).json({
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully',
      });
    } catch (error) {
      console.error('Error in getStats controller:', error);
      
      const errorResponse: APIError = {
        success: false,
        error: {
          message: 'Internal server error while retrieving statistics',
          code: 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
      };
      
      res.status(500).json(errorResponse);
    }
  }

  /**
   * GET /api/ip/search
   * Search for IPs
   */
  async searchIPs(req: Request<{}, any, {}, SearchQuery>, res: Response): Promise<void> {
    try {
      const query: string | undefined = req.query.q as string;
      const limit: number = Math.min(parseInt(req.query.limit as string) || 10, 50);
      
      if (!query || query.trim().length === 0) {
        const error: APIError = {
          success: false,
          error: {
            message: 'Search query is required',
            code: 'MISSING_QUERY',
          },
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(error);
        return;
      }

      const results = await ipService.searchIPs(query.trim(), limit);
      
      res.status(200).json({
        success: true,
        data: {
          results,
          query: query.trim(),
          count: results.length,
        },
        message: 'Search completed successfully',
      });
    } catch (error) {
      console.error('Error in searchIPs controller:', error);
      
      const errorResponse: APIError = {
        success: false,
        error: {
          message: 'Internal server error while searching',
          code: 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
      };
      
      res.status(500).json(errorResponse);
    }
  }

  /**
   * GET /api/ip/my-ip
   * Get the client's IP address (reversed)
   */
  async getMyIP(req: Request, res: Response): Promise<void> {
    try {
      const clientIP = extractClientIP(req);
      
      if (!clientIP || clientIP === 'unknown') {
        const error: APIError = {
          success: false,
          error: {
            message: 'Unable to determine client IP address',
            code: 'IP_DETECTION_FAILED',
          },
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(error);
        return;
      }

      // Check if it's a valid IP that we can reverse
      if (!isValidIP(clientIP)) {
        const error: APIError = {
          success: false,
          error: {
            message: 'Detected IP address is not in a valid format',
            code: 'INVALID_DETECTED_IP',
            details: { detectedIP: clientIP },
          },
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(error);
        return;
      }

      // Store and return the reversed IP
      const result = await ipService.reverseAndStore(clientIP, req);
      
      const response: ReverseIPResponse = {
        success: true,
        data: {
          id: result.id,
          originalIP: result.originalIP,
          reversedIP: result.reversedIP,
          requestIP: result.requestIP,
          timestamp: result.timestamp.toISOString(),
        },
        message: 'Your IP address has been reversed and stored',
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in getMyIP controller:', error);
      
      const errorResponse: APIError = {
        success: false,
        error: {
          message: 'Internal server error while processing your IP',
          code: 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
      };
      
      res.status(500).json(errorResponse);
    }
  }

  /**
   * GET /health
   * Health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const startTime = process.hrtime();
      const dbHealthy = await ipService.healthCheck();
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const responseTime = seconds * 1000 + nanoseconds * 1e-6;

      const health = {
        success: true,
        data: {
          status: dbHealthy ? 'healthy' : 'unhealthy' as const,
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          database: dbHealthy ? 'connected' : 'disconnected' as const,
          uptime: process.uptime(),
          responseTime: Math.round(responseTime * 100) / 100, // Round to 2 decimal places
          environment: process.env.NODE_ENV || 'unknown',
        },
      };

      const statusCode = dbHealthy ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      console.error('Error in health check:', error);
      
      res.status(503).json({
        success: false,
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          database: 'disconnected',
          uptime: process.uptime(),
          error: 'Health check failed',
        },
      });
    }
  }
}

export const ipController = new IPController();