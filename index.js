require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require("dotenv");

// Import routes
const flightRoutes = require('./components/flight/routes');
const weatherRoutes = require('./components/weather/routes');
const hotelRoutes = require('./components/hotel/routes');
const imageRoutes = require('./components/images/routes');
const tripOverviewRoutes = require('./components/trip_overview/routes');


const app = express();
const PORT = process.env.PORT || 3000;

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(session({
  secret: process.env.SESSIONSECRET, 
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Home route
app.get('/', (req, res) => {
  res.render('index', { title: 'Travel Explorer - Your Smart Travel Companion' });
});

// Trip overview route
// app.get('/trip-overview', (req, res) => {
//   res.render('trip-overview', { title: 'Your Trip Overview' });
// });

// Use component routes
app.use('/flight', flightRoutes);
app.use('/weather', weatherRoutes);
app.use('/hotel', hotelRoutes);
app.use('/images', imageRoutes);
app.use('/trip-overview', tripOverviewRoutes);
app.use('/', tripOverviewRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});