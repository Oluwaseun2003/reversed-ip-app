import express from 'express';
import type { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { corsMiddleware } from './middleware/CorsMiddleware';
import { errorHandler, notFoundHandler, timeoutHandler } from './middleware/IpMiddleware';
import routes from './routes/index';

const app: Application = express();

// Trust proxy - important for getting real client IPs
app.set('trust proxy', true);

// Request timeout (30 seconds)
app.use(timeoutHandler(30000));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS middleware
app.use(corsMiddleware);

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1000,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// Logging middleware
const morganFormat: string = process.env.NODE_ENV === 'production' 
  ? 'combined' 
  : 'dev';

app.use(morgan(morganFormat, {
  skip: (req, res) => {
    // Skip logging for health checks in production
    if (process.env.NODE_ENV === 'production' && req.path === '/health') {
      return true;
    }
    return false;
  },
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true,
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
}));

// Request metadata middleware
app.use((req, res, next) => {
  (req as any).requestTime = new Date().toISOString();
  res.locals.requestId = Math.random().toString(36).substring(2, 15);
  next();
});

// API routes
app.use('/', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;