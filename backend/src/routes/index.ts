import { Router } from 'express';
import type { Request, Response } from 'express';
import ipRoutes from './IpRoute';
import { ipController } from '../controllers/IpController';
import { asyncHandler } from '../middleware/IpMiddleware';

const router: Router = Router();

/**
 * @route GET /health
 * @description Health check endpoint
 * @access Public
 */
router.get('/health', asyncHandler(ipController.healthCheck.bind(ipController)));

/**
 * @route GET /
 * @description API info endpoint
 * @access Public
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'IP Reverser API',
      version: process.env.npm_package_version || '1.0.0',
      description: 'API for reversing IP addresses and storing them in a database',
      endpoints: {
        health: 'GET /health',
        reverse: 'POST /api/ip/reverse',
        history: 'GET /api/ip/history',
        stats: 'GET /api/ip/stats',
        search: 'GET /api/ip/search',
        myIp: 'GET /api/ip/my-ip',
      },
      documentation: {
        reverse: {
          method: 'POST',
          path: '/api/ip/reverse',
          body: { ip: 'string' },
          description: 'Reverse an IP address and store it in the database',
        },
        history: {
          method: 'GET',
          path: '/api/ip/history',
          query: { page: 'number?', limit: 'number?' },
          description: 'Get paginated history of reversed IPs',
        },
        stats: {
          method: 'GET',
          path: '/api/ip/stats',
          description: 'Get statistics about stored IPs',
        },
        search: {
          method: 'GET',
          path: '/api/ip/search',
          query: { q: 'string', limit: 'number?' },
          description: 'Search for IPs by original, reversed, or request IP',
        },
        myIp: {
          method: 'GET',
          path: '/api/ip/my-ip',
          description: 'Get and reverse your IP address automatically',
        },
      },
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * IP-related routes
 */
router.use('/api/ip', ipRoutes);

export default router;