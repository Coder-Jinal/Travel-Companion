const axios = require('axios');
const NodeCache = require('node-cache');

// Cache with TTL of 1 hour
const hotelCache = new NodeCache({ stdTTL: 3600 });

/**
 * Get hotels based on city, check-in/out dates, and number of guests
 * @param {string} city - City name
 * @param {string} checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} checkOut - Check-out date (YYYY-MM-DD)
 * @param {number} guests - Number of guests
 * @returns {Promise<Array>} - Array of hotel objects
 */
exports.getHotels = async (city, checkIn, checkOut, guests) => {
  // Create a cache key
  const cacheKey = `${city.toLowerCase()}-${checkIn}-${checkOut}-${guests}`;
  
  // Check if data exists in cache
  const cachedHotels = hotelCache.get(cacheKey);
  if (cachedHotels) {
    console.log('Retrieved hotels from cache');
    return cachedHotels;
  }
  
  try {
    // For demo purposes, we'll generate mock hotel data
    // In a real application, this would make an API call to Amadeus
    const hotels = generateMockHotels(city, 8, checkIn, checkOut, guests);
    
    // Store in cache
    hotelCache.set(cacheKey, hotels);
    
    return hotels;
  } catch (error) {
    console.error('Error fetching hotel data:', error);
    throw new Error('Failed to retrieve accommodation information');
  }
};

/**
 * Generate mock hotel data for demonstration purposes
 * @param {string} city - City name
 * @param {number} count - Number of hotels to generate
 * @param {string} checkIn - Check-in date
 * @param {string} checkOut - Check-out date
 * @param {number} guests - Number of guests
 * @returns {Array} - Array of hotel objects
 */
function generateMockHotels(city, count, checkIn, checkOut, guests) {
  const hotelNames = [
    'Grand Hotel',
    'City Plaza',
    'Royal Suites',
    'Oceanview Resort',
    'Downtown Inn',
    'Metropolitan Hotel',
    'Sunset View',
    'Riverside Lodge',
    'Century Plaza',
    'The Paramount',
    'Heritage Hotel',
    'Urban Retreat'
  ];
  
  // Using placeholder images directly since local images might not exist
  const placeholders = [
    'https://placehold.co/600x400/3498db/FFFFFF.png?text=Grand+Hotel',
    'https://placehold.co/600x400/e74c3c/FFFFFF.png?text=City+Plaza',
    'https://placehold.co/600x400/2ecc71/FFFFFF.png?text=Royal+Suites',
    'https://placehold.co/600x400/f39c12/FFFFFF.png?text=Oceanview+Resort',
    'https://placehold.co/600x400/9b59b6/FFFFFF.png?text=Downtown+Inn',
    'https://placehold.co/600x400/1abc9c/FFFFFF.png?text=Metropolitan+Hotel'
  ];
  
  const amenities = [
    'Free WiFi',
    'Swimming Pool',
    'Fitness Center',
    'Restaurant',
    'Room Service',
    'Spa',
    'Business Center',
    'Airport Shuttle',
    'Parking',
    'Concierge',
    'Laundry Service',
    'Bar/Lounge'
  ];
  
  // Calculate number of nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
  
  const hotels = [];
  
  for (let i = 0; i < count; i++) {
    // Get a unique name
    const nameIndex = i % hotelNames.length;
    const name = `${hotelNames[nameIndex]} ${city}`;
    
    // Random rating between 3 and 5 stars
    const rating = (Math.floor(Math.random() * 21) + 30) / 10;
    
    // Base price between $80 and $400 per night
    const pricePerNight = Math.floor(Math.random() * 321) + 80;
    
    // Adjust price based on number of guests (additional $25 per guest after the first)
    const guestSurcharge = Math.max(0, (parseInt(guests) - 1) * 25);
    
    // Calculate total price
    const totalPrice = (pricePerNight + guestSurcharge) * nights;
    
    // Get a placeholder image
    const imageIndex = i % placeholders.length;
    
    // Random subset of amenities
    const hotelAmenities = [];
    const amenityCount = Math.floor(Math.random() * 6) + 3; // 3-8 amenities
    
    while (hotelAmenities.length < amenityCount) {
      const amenity = amenities[Math.floor(Math.random() * amenities.length)];
      if (!hotelAmenities.includes(amenity)) {
        hotelAmenities.push(amenity);
      }
    }
    
    hotels.push({
      id: `hotel-${i + 1}`,
      name,
      address: `${Math.floor(Math.random() * 1000) + 1} Main Street, ${city}`,
      rating,
      pricePerNight,
      totalPrice,
      nights,
      currency: 'USD',
      amenities: hotelAmenities,
      thumbnail: placeholders[imageIndex],
      description: `Experience luxury and comfort at ${name}. Located in the heart of ${city}, our hotel offers easy access to local attractions and business districts.`,
      // Add Expedia booking link
      expediaBookingLink: `https://www.expedia.com/Hotels?destination=${encodeURIComponent(name + ', ' + city)}&startDate=${checkIn}&endDate=${checkOut}&adults=${guests}`
    });
  }
  
  return hotels;
}



// const axios = require('axios');
// const NodeCache = require('node-cache');

// // Cache with TTL of 1 hour
// const hotelCache = new NodeCache({ stdTTL: 3600 });

// /**
//  * Get hotels based on city, check-in/out dates, and number of guests
//  * @param {string} city - City name
//  * @param {string} checkIn - Check-in date (YYYY-MM-DD)
//  * @param {string} checkOut - Check-out date (YYYY-MM-DD)
//  * @param {number} guests - Number of guests
//  * @returns {Promise<Array>} - Array of hotel objects
//  */
// exports.getHotels = async (city, checkIn, checkOut, guests) => {
//   // Create a cache key
//   const cacheKey = `${city.toLowerCase()}-${checkIn}-${checkOut}-${guests}`;
  
//   // Check if data exists in cache
//   const cachedHotels = hotelCache.get(cacheKey);
//   if (cachedHotels) {
//     console.log('Retrieved hotels from cache');
//     return cachedHotels;
//   }
  
//   try {
//     // For demo purposes, we'll generate mock hotel data
//     // In a real application, this would make an API call to Amadeus
//     const hotels = generateMockHotels(city, 8, checkIn, checkOut, guests);
    
//     // Store in cache
//     hotelCache.set(cacheKey, hotels);
    
//     return hotels;
//   } catch (error) {
//     console.error('Error fetching hotel data:', error);
//     throw new Error('Failed to retrieve accommodation information');
//   }
// };

// /**
//  * Generate mock hotel data for demonstration purposes
//  * @param {string} city - City name
//  * @param {number} count - Number of hotels to generate
//  * @param {string} checkIn - Check-in date
//  * @param {string} checkOut - Check-out date
//  * @param {number} guests - Number of guests
//  * @returns {Array} - Array of hotel objects
//  */
// function generateMockHotels(city, count, checkIn, checkOut, guests) {
//   const hotelNames = [
//     'Grand Hotel',
//     'City Plaza',
//     'Royal Suites',
//     'Oceanview Resort',
//     'Downtown Inn',
//     'Metropolitan Hotel',
//     'Sunset View',
//     'Riverside Lodge',
//     'Century Plaza',
//     'The Paramount',
//     'Heritage Hotel',
//     'Urban Retreat'
//   ];
  
//   const hotelImages = [
//     '/images/hotels/hotel1.jpg',
//     '/images/hotels/hotel2.jpg',
//     '/images/hotels/hotel3.jpg',
//     '/images/hotels/hotel4.jpg',
//     '/images/hotels/hotel5.jpg',
//     '/images/hotels/hotel6.jpg'
//   ];
  
//   // Fallback image in case the hotel images don't exist
//   const placeholderImage = 'https://placehold.co/600x400?text=Hotel+Image';
  
//   const amenities = [
//     'Free WiFi',
//     'Swimming Pool',
//     'Fitness Center',
//     'Restaurant',
//     'Room Service',
//     'Spa',
//     'Business Center',
//     'Airport Shuttle',
//     'Parking',
//     'Concierge',
//     'Laundry Service',
//     'Bar/Lounge'
//   ];
  
//   // Calculate number of nights
//   const checkInDate = new Date(checkIn);
//   const checkOutDate = new Date(checkOut);
//   const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
  
//   const hotels = [];
  
//   for (let i = 0; i < count; i++) {
//     // Get a unique name
//     const nameIndex = i % hotelNames.length;
//     const name = `${hotelNames[nameIndex]} ${city}`;
    
//     // Random rating between 3 and 5 stars
//     const rating = (Math.floor(Math.random() * 21) + 30) / 10;
    
//     // Base price between $80 and $400 per night
//     const pricePerNight = Math.floor(Math.random() * 321) + 80;
    
//     // Adjust price based on number of guests (additional $25 per guest after the first)
//     const guestSurcharge = Math.max(0, (parseInt(guests) - 1) * 25);
    
//     // Calculate total price
//     const totalPrice = (pricePerNight + guestSurcharge) * nights;
    
//     // Get a hotel image
//     const imageIndex = i % hotelImages.length;
//     const thumbnail = hotelImages[imageIndex];
    
//     // Random subset of amenities
//     const hotelAmenities = [];
//     const amenityCount = Math.floor(Math.random() * 6) + 3; // 3-8 amenities
    
//     while (hotelAmenities.length < amenityCount) {
//       const amenity = amenities[Math.floor(Math.random() * amenities.length)];
//       if (!hotelAmenities.includes(amenity)) {
//         hotelAmenities.push(amenity);
//       }
//     }
    
//     hotels.push({
//       id: `hotel-${i + 1}`,
//       name,
//       address: `${Math.floor(Math.random() * 1000) + 1} Main Street, ${city}`,
//       rating,
//       pricePerNight,
//       totalPrice,
//       nights,
//       currency: 'USD',
//       amenities: hotelAmenities,
//       thumbnail: thumbnail || placeholderImage,
//       fallbackImage: placeholderImage, // In case the thumbnail doesn't load
//       description: `Experience luxury and comfort at ${name}. Located in the heart of ${city}, our hotel offers easy access to local attractions and business districts.`
//     });
//   }
  
//   return hotels;
// }