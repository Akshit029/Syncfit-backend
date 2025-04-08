require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const authRoutes = require('./routes/auth'); // Import authentication routes
const fitnessRoutes = require('./routes/fitnessRoutes'); // Fixed import path
const userRoutes = require('./routes/userRoutes'); // Import user routes
const feedbackRoutes = require('./routes/feedbackRoutes'); // Import feedback routes
const connectDB = require('./config/db');

const app = express();
const port = process.env.PORT || 5001;

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is not defined!');
  process.exit(1); // Exit if MongoDB URI is not defined
}

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET is not defined!');
  process.exit(1); // Exit if JWT secret is not defined
}

// ✅ CORS configuration
const corsOptions = {
  origin: ['https://syncfit-j7pw.onrender.com', 'http://localhost:3000'], // Allow both deployed and local frontend
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true, // Allow cookies (like JWT tokens)
};

app.use(cors(corsOptions));

// Set up cookie-parser before routes
app.use(cookieParser());

// Parse JSON request bodies
app.use(express.json());

// Configure express-fileupload
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use authentication routes
app.use('/api/auth', authRoutes);

// Use user routes
app.use('/api/user', userRoutes);

// Use fitness routes
app.use('/api/fitness', fitnessRoutes);

// Use feedback routes
app.use('/api/feedback', feedbackRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('SyncFit API Server');
});

// Connect to MongoDB
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
