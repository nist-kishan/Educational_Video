import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables first, before any other imports
dotenv.config({ path: path.join(__dirname, '../.env') });

// Now import other modules
import app from './app.js';
import { testSupabaseConnection } from './config/supabase.js';

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
const startServer = async () => {
  try {
    // Test Supabase connection
    console.log('🔍 Testing database connection...');
    const isConnected = await testSupabaseConnection();
    
    if (!isConnected) {
      console.warn('⚠️  Database connection test failed, but server will still start');
    }

    // Start the server
    const server = app.listen(PORT, () => {
      console.log('🚀 Server running on port', PORT);
      console.log('📚 Educational Video Platform API');
      console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
      console.log('🔗 Health check:', `http://localhost:${PORT}/health`);
      console.log('🔐 Auth endpoints:', `http://localhost:${PORT}/api/auth`);
      console.log('📖 API Documentation available at root endpoint');
      console.log('=' .repeat(50));
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
      
      server.close((err) => {
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }
        
        console.log('✅ Server closed successfully');
        console.log('👋 Goodbye!');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⏰ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('💥 Uncaught Exception:', err);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
