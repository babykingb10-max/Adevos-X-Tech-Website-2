require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const configRoutes = require('./routes/configRoutes');
const botsRoutes = require('./routes/botsRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const coinsRoutes = require('./routes/coinsRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { runSeed } = require('./seed');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});
app.set('io', io);

// FRONTEND_URL can be a single URL or a comma-separated list
// (e.g. your Vercel URL + your custom domain, once you have one).
// If it's unset, every origin is allowed — useful during setup,
// tighten it once your real domain is confirmed.
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // same-origin / curl / server-to-server
    if (allowedOrigins.length === 0) return callback(null, true); // not configured yet — allow all
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`[CORS] Blocked request from origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());

// Health check for uptime monitors / Heroku
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/config', configRoutes);
app.use('/api/v1/bots', botsRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/coins', coinsRoutes);
app.use('/api/v1', contentRoutes); // /feedback, /updates, /tutorials
app.use('/api/v1/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected.');
    await runSeed(); // idempotent — only inserts default data if collections are empty
    server.listen(PORT, () => console.log(`Adevos-X Tech API running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
