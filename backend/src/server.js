import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma.js';
import authRoutes from './routes/auth.routes.js';
import mobilesRoutes from './routes/mobiles.routes.js';
import stockRoutes from './routes/stock.routes.js';
import suppliersRoutes from './routes/suppliers.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mobiles', mobilesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Basic health check & DB connection test
app.get('/api/health', async (req, res) => {
  try {
    // Ping DB via simple query
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      message: 'Mobile Stock Management API is running',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database successfully.');
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
  }
});

export default app;
