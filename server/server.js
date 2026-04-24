require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const Admin = require('./models/Admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  // Seed Admin if not exists
  const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL || 'admin@leoclub.com' });
  if (!adminExists) {
    const admin = new Admin({
      email: process.env.ADMIN_EMAIL || 'admin@leoclub.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    await admin.save();
    console.log('--- Default Admin Account Created ---');
    console.log(`Email: ${admin.email}`);
    console.log('------------------------------------');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
