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
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Vortex Tales API Server Running!      `);
  console.log(`  Port: ${PORT}                          `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});
