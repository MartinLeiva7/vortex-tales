import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - Allow all in development or configure origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Base Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// API Routes
app.use('/api', apiRouter);

// Start server
const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Vortex Tales API Server Running!      `);
  console.log(`  Port: ${PORT}                          `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});

// Handle graceful shutdown to release the port immediately
const handleShutdown = () => {
  console.log('Shutting down API server...');
  server.close(() => {
    console.log('Express server closed.');
    process.exit(0);
  });
  
  // Force exit if connections are kept open for too long
  setTimeout(() => {
    console.error('Forced shutdown: connections did not close in time.');
    process.exit(1);
  }, 1000);
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
