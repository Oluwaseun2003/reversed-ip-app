import cors from 'cors';
import type { CorsOptions, CorsOptionsDelegate } from 'cors';

// Define allowed origins based on environment
const getAllowedOrigins = (): string[] => {
  const corsOrigin: string | undefined = process.env.CORS_ORIGIN;
  
  if (corsOrigin) {
    // Split by comma and trim whitespace
    return corsOrigin.split(',').map(origin => origin.trim());
  }
  
  // Default origins based on environment
  if (process.env.NODE_ENV === 'production') {
    return [
      'https://your-domain.com',
      'https://www.your-domain.com',
    ];
  }
  
  // Development defaults
  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173', // Vite default
    'http://127.0.0.1:5173',
  ];
};

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins: string[] = getAllowedOrigins();
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS',
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Forwarded-For',
    'X-Real-IP',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page',
    'X-Per-Page',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;