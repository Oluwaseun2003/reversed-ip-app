import { Router } from 'express';
import rateLimit from 'express-rate-limit';
// import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { ipController } from '../controllers/IpController';
import { asyncHandler, rateLimitHandler } from '../middleware/IpMiddleware';

const router: Router = Router();

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: rateLimitHandler,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req: Request): boolean => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  },
});

const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 requests per windowMs for write operations
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request): boolean => {
    return process.env.NODE_ENV === 'development';
  },
});

// Apply general rate limiting to all routes
router.use(generalLimiter);

/**
 * @route POST /api/ip/reverse
 * @description Reverse an IP address and store it
 * @access Public
 * @body { ip: string }
 */
router.post(
  '/reverse',
  strictLimiter,
  asyncHandler(ipController.reverseIP.bind(ipController))
);

/**
 * @route GET /api/ip/history
 * @description Get paginated history of reversed IPs
 * @access Public
 * @query { page?: number, limit?: number }
 */
router.get(
  '/history',
  asyncHandler(ipController.getHistory.bind(ipController))
);

/**
 * @route GET /api/ip/stats
 * @description Get statistics about stored IPs
 * @access Public
 */
router.get(
  '/stats',
  asyncHandler(ipController.getStats.bind(ipController))
);

/**
 * @route GET /api/ip/search
 * @description Search for IPs
 * @access Public
 * @query { q: string, limit?: number }
 */
router.get(
  '/search',
  asyncHandler(ipController.searchIPs.bind(ipController))
);

/**
 * @route GET /api/ip/my-ip
 * @description Get and reverse the client's IP address
 * @access Public
 */
router.get(
  '/my-ip',
  strictLimiter,
  asyncHandler(ipController.getMyIP.bind(ipController))
);

export default router;