import dotenv from 'dotenv';
import type { Server } from 'http';
import app from './app';
import { ipService } from './services/IpService';

// Load environment variables
dotenv.config();

const PORT: number = parseInt(process.env.PORT || '3001');
const NODE_ENV: string = process.env.NODE_ENV || 'development';

// Validate required environment variables
const requiredEnvVars: string[] = ['DATABASE_URL'];
const missingEnvVars: string[] = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Graceful shutdown handling
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(async (err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('🔌 HTTP server closed');
    
    try {
      // Disconnect from database
      await ipService.disconnect();
      console.log('🔐 Database connections closed');
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during database shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Start server
const server: Server = app.listen(PORT, () => {
  console.log(`
🚀 IP Reverser API Server Started
📍 Environment: ${NODE_ENV}
🌐 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
📚 API Docs: http://localhost:${PORT}/
⏰ Started at: ${new Date().toISOString()}
`);

  if (NODE_ENV === 'development') {
    console.log(`
📋 Available Endpoints:
  GET  /                    - API information
  GET  /health              - Health check
  POST /api/ip/reverse      - Reverse an IP address
  GET  /api/ip/history      - Get IP history
  GET  /api/ip/stats        - Get statistics
  GET  /api/ip/search       - Search IPs
  GET  /api/ip/my-ip        - Get your IP reversed
`);
  }
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`❌ Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGTERM'));
