import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import db from './database';
import authRoutes from './routes/auth';
import diagnoseRoutes from './routes/diagnose';
import symptomsRoutes from './routes/symptoms';
import rulesRoutes from './routes/rules';
import articlesRoutes from './routes/articles';
import adminRoutes from './routes/admin';
import aboutRoutes from './routes/about';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/diagnose', diagnoseRoutes);
app.use('/api/symptoms', symptomsRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/about', aboutRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.init();
    console.log('Database initialized');
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🏥 Sistem Pakar - Diagnosa Kecanduan HP pada Anak            ║
║  Server running on http://localhost:${PORT}                     ║
║                                                                ║
║  Environment: ${process.env.NODE_ENV || 'development'}                            ║
║  Database: SQLite (${process.env.DATABASE_PATH || './database.db'})              ║
║                                                                ║
║  📚 API Documentation:                                         ║
║  GET  /health              - Health check                     ║
║  POST /api/auth/register   - Register new user                ║
║  POST /api/auth/login      - Login                            ║
║  GET  /api/auth/me         - Get current user                 ║
║  POST /api/diagnose        - Run diagnosis (Forward Chaining) ║
║  GET  /api/diagnose/history - Get diagnosis history           ║
║  GET  /api/symptoms        - Get all symptoms                 ║
║  GET  /api/articles        - Get all articles                 ║
║  GET  /api/about           - Get about content                ║
║                                                                ║
║  🔐 Admin endpoints (requires authentication):                 ║
║  GET  /api/admin/statistics - System statistics               ║
║  CRUD /api/admin/users/*   - Manage users                     ║
║  CRUD /api/symptoms/*      - Manage symptoms                  ║
║  CRUD /api/rules/*         - Manage rules                     ║
║  CRUD /api/articles/*      - Manage articles                  ║
║  PUT  /api/about           - Update about content             ║
╚════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
