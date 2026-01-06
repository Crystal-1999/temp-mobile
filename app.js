const express = require('express');
const path = require('path');
const app = express();

// Trust proxy for accurate secure connection detection (needed when behind reverse proxy/load balancer)
app.set('trust proxy', true);
const connectDB = require('./config/db');
const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/auth");
const cors = require('cors');
const indexRoutes = require('./routes/index');
const apiRouter = require('./routes/api');
const authCustomerRoutes = require('./routes/auth/customer');
const statusRoutes = require('./routes/auth/status'); // Add this line
const protectedRoutes = require('./routes/protected'); // Add this line
const adminRoutes = require('./routes/admin'); // Add this line

// // Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security Headers - HSTS (Strict-Transport-Security)
app.use((req, res, next) => {
  // Only set HSTS header for HTTPS connections
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(authMiddleware);
app.use(indexRoutes);
app.use(authCustomerRoutes);
app.use('/api', apiRouter);
app.use('/auth', statusRoutes); // Add this line
app.use((req, res, next) => {
  res.locals.customer = req.customer || null;
  next();
});

app.use('/app', protectedRoutes);
app.use('/admin', adminRoutes);

// 404 handler - custom page
app.use((req, res) => {
  res.status(404).render('pages/404', {
    url: req.originalUrl || ''
  });
});

console.log("Views Directory:", path.join(__dirname, "views"));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});