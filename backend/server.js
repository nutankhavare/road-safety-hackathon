require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import DB so it connects on startup
require('./config/db');

// Import routes
const analyzeRoutes = require('./routes/analyzeRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads statically
app.use('/uploads', express.static('uploads'));

const { testGemini } = require('./controllers/testGeminiController');

// Routes
app.use('/api/analyze-road', analyzeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Gemini Test Route
app.get('/api/test-gemini', testGemini);

// Test Route
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Backend working successfully' });
});

// Root Route
app.get('/', (req, res) => {
  res.send('SafePath AI Backend API is running...');
});

// Error handling middleware
const errorMiddleware = require('./middleware/errorMiddleware');
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
