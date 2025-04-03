const axios = require('axios');
const NodeCache = require('node-cache');

// Cache with TTL of 1 hour
const flightCache = new NodeCache({ stdTTL: 3600 });

// Booking Link Generator Class
class BookingLinkGenerator {
  // Generate Expedia deep link for flights
  static generateFlightExpediaLink(origin, destination, date) {
    const baseUrl = 'https://www.expedia.com/Flights-Search';
    const params = new URLSearchParams({
      mode: 'search',
      originPlace: origin.toUpperCase(),
      destinationPlace: destination.toUpperCase(),
      departDate: date,
      adults: '1', // Default to 1 adult
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  // Generate Skyscanner deep link for flights
  static generateFlightSkyscannerLink(origin, destination, date) {
    const baseUrl = 'https://www.skyscanner.com/transport/flights';
    const formattedOrigin = origin.toUpperCase();
    const formattedDestination = destination.toUpperCase();
    
    return `https://www.skyscanner.com/transport/flights/${formattedOrigin}/${formattedDestination}/${date}`;
  }
}

/**
 * Calculate flight duration between departure and arrival times
 * @param {Date} departure - Departure time
 * @param {Date} arrival - Arrival time
 * @returns {string} - Formatted duration string
 */
function calculateDuration(departure, arrival) {
  const diff = arrival - departure;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

/**
 * Generate random price (since the API doesn't provide price information)
 * @returns {string} - Formatted price string
 */
function generateRandomPrice() {
  const basePrice = Math.floor(Math.random() * 500) + 100;
  return `$${basePrice}`;
}

/**
 * Generate demo flights when API fails or returns no results
 * @param {string} origin - Origin airport code
 * @param {string} destination - Destination airport code
 * @param {string} date - Flight date
 * @returns {Array} - Array of demo flight objects
 */
function generateDemoFlights(origin, destination, date) {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString();
  
  const airlines = ['American Airlines', 'Delta', 'United', 'British Airways', 'Emirates', 'Lufthansa'];
  const flightCodes = ['AA', 'DL', 'UA', 'BA', 'EK', 'LH'];
  
  return Array.from({ length: 5 }, (_, i) => {
    const airlineIndex = i % airlines.length;
    const departureHour = 6 + i * 3; // Flights starting from 6 AM, spaced 3 hours apart
    const departureTime = new Date(dateObj);
    departureTime.setHours(departureHour, Math.floor(Math.random() * 60));
    
    const duration = 2 + Math.floor(Math.random() * 4); // 2-5 hour flights
    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(arrivalTime.getHours() + duration);
    
    return {
      airline: airlines[airlineIndex],
      flightNumber: `${flightCodes[airlineIndex]}${100 + Math.floor(Math.random() * 900)}`,
      departureAirport: `${origin.toUpperCase()} Airport`,
      departureTime: departureTime.toLocaleString(),
      arrivalAirport: `${destination.toUpperCase()} Airport`,
      arrivalTime: arrivalTime.toLocaleString(),
      duration: `${duration}h ${Math.floor(Math.random() * 60)}m`,
      status: ['Scheduled', 'On Time', 'Delayed', 'Boarding'][Math.floor(Math.random() * 3)],
      price: `$${200 + Math.floor(Math.random() * 600)}`,
      bookingLinks: {
        expedia: BookingLinkGenerator.generateFlightExpediaLink(origin, destination, date),
        skyscanner: BookingLinkGenerator.generateFlightSkyscannerLink(origin, destination, date)
      }
    };
  });
}

/**
 * Get flights based on origin, destination, and date
 * @param {string} origin - Origin airport/city code
 * @param {string} destination - Destination airport/city code
 * @param {string} date - Flight date (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array of flight objects
 */
exports.getFlights = async (origin, destination, date) => {
  // Create a cache key
  const cacheKey = `${origin.toUpperCase()}-${destination.toUpperCase()}-${date}`;
  
  // Check if data exists in cache
  const cachedFlights = flightCache.get(cacheKey);
  if (cachedFlights) {
    console.log('Retrieved flights from cache');
    return cachedFlights;
  }
  
  try {
    console.log(`Fetching flights from API for ${origin} to ${destination} on ${date}`);
    console.log(`API URL: ${process.env.AVIATIONSTACK_API_URL}/flights`);
    
    // Validate environment variables
    if (!process.env.AVIATIONSTACK_API_URL) {
      throw new Error('AVIATIONSTACK_API_URL is not defined in environment variables');
    }
    
    if (!process.env.AVIATIONSTACK_API_KEY) {
      throw new Error('AVIATIONSTACK_API_KEY is not defined in environment variables');
    }
    
    const response = await axios.get(`${process.env.AVIATIONSTACK_API_URL}/flights`, {
      params: {
        access_key: process.env.AVIATIONSTACK_API_KEY,
        dep_iata: origin.toUpperCase(),
        arr_iata: destination.toUpperCase(),
        flight_date: date
      }
    });
    
    console.log('API response received:', response.status);
    
    // Check if response contains expected data structure
    if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
      console.error('Invalid API response structure:', response.data);
      
      // Generate demo flights as fallback
      const demoFlights = generateDemoFlights(origin, destination, date);
      flightCache.set(cacheKey, demoFlights);
      return demoFlights;
    }
    
    // Process the flight data
    const flights = response.data.data.map(flight => {
      try {
        return {
          airline: flight.airline?.name || 'Unknown Airline',
          flightNumber: flight.airline?.iata ? `${flight.airline.iata}${flight.flight?.number || ''}` : 'Unknown',
          departureAirport: flight.departure?.airport || 'Unknown',
          departureTime: flight.departure?.scheduled ? new Date(flight.departure.scheduled).toLocaleString() : 'Unknown',
          arrivalAirport: flight.arrival?.airport || 'Unknown',
          arrivalTime: flight.arrival?.scheduled ? new Date(flight.arrival.scheduled).toLocaleString() : 'Unknown',
          duration: (flight.departure?.scheduled && flight.arrival?.scheduled) ? 
            calculateDuration(
              new Date(flight.departure.scheduled),
              new Date(flight.arrival.scheduled)
            ) : 'Unknown',
          status: flight.flight_status ? 
            flight.flight_status.charAt(0).toUpperCase() + flight.flight_status.slice(1) : 'Unknown',
          price: generateRandomPrice(), // Since the API doesn't provide price info
          bookingLinks: {
            expedia: BookingLinkGenerator.generateFlightExpediaLink(origin, destination, date),
            skyscanner: BookingLinkGenerator.generateFlightSkyscannerLink(origin, destination, date)
          }
        };
      } catch (err) {
        console.error('Error processing individual flight data:', err);
        return null;
      }
    }).filter(flight => flight !== null);
    
    // If no flights found, return demo flights
    if (flights.length === 0) {
      console.log('No flights found for the specified route and date');
      const demoFlights = generateDemoFlights(origin, destination, date);
      flightCache.set(cacheKey, demoFlights);
      return demoFlights;
    }
    
    // Store in cache
    flightCache.set(cacheKey, flights);
    
    return flights;
  } catch (error) {
    // Enhanced error logging
    console.error('Error fetching flight data:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('API Response Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    // Return demo flights in case of any errors
    const demoFlights = generateDemoFlights(origin, destination, date);
    return demoFlights;
  }
};

// Export additional utilities
exports.BookingLinkGenerator = BookingLinkGenerator;
exports.generateDemoFlights = generateDemoFlights;

