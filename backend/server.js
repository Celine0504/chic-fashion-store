import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB and Seed Data on startup
initDatabase();

// Route middleware
app.use('/api', productRoutes);
app.use('/api', orderRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'CHIC FASHION STORE API',
    timestamp: new Date().toISOString(),
  });
});

const server = app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[NOTICE] Port ${PORT} is already in use by another open terminal.`);
    console.log(`Please close any extra terminals in VS Code or press Ctrl + C and restart.\n`);
  } else {
    console.error('Server error:', err);
  }
});
