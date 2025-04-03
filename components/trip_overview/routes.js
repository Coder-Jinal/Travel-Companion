const express = require('express');
const tripOverviewController = require('./trip_overview');
const router = express.Router();

// GET trip overview page
router.get('/', tripOverviewController.renderTripOverview);

// POST save hotel to trip
router.post('/save-hotel', tripOverviewController.saveHotel);

// POST save flight to trip
router.post('/save-flight', tripOverviewController.saveFlight);

// POST remove trip
router.post('/remove-trip', tripOverviewController.removeTrip);

module.exports = router;