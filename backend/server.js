const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Middleware - allow mobile app requests from LAN devices
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads if any exist
app.use('/uploads', express.static('src/uploads'));

// Register API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/chat', require('./src/routes/chatRoutes'));
app.use('/api/lessons', require('./src/routes/lessonRoutes'));
app.use('/api/user', require('./src/routes/userRoutes'));
app.use('/api/streak', require('./src/routes/streakRoutes'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.send('AI English Learning API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;
const os = require('os');

function getLanAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  Object.values(interfaces).forEach((entries) => {
    entries?.forEach((entry) => {
      if (entry.family === 'IPv4' && !entry.internal) {
        addresses.push(entry.address);
      }
    });
  });

  return addresses;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  getLanAddresses().forEach((address) => {
    console.log(`API available at http://${address}:${PORT}/api`);
  });
});
