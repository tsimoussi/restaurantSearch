import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

let GOOGLE_API_KEY;
if (process.env.GOOGLE_API_KEY) {
  GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
} else {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing GOOGLE_API_KEY environment variable in production');
  }
  GOOGLE_API_KEY = fs.readFileSync(join(__dirname, 'googleApiKey.txt'), 'utf-8').trim();
}

function normalizePhoneForWhatsApp(phone) {
  if (!phone || typeof phone !== 'string') return null;

  const trimmed = phone.trim();
  if (!trimmed) return null;

  // Keep leading + if present, remove spaces and punctuation
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/[^0-9]/g, '');
  if (!digitsOnly) return null;

  if (hasPlus) return digitsOnly;

  // Best-effort for France: convert 0XXXXXXXXX -> 33XXXXXXXXX
  if (digitsOnly.length === 10 && digitsOnly.startsWith('0')) {
    return `33${digitsOnly.slice(1)}`;
  }

  // Fallback: already digits, but may not be internationally formatted
  return digitsOnly;
}

app.post('/api/search-restaurants', async (req, res) => {
  try {
    const { location, radius = 5000 } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    let lat, lng;
    if (typeof location === 'string') {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_API_KEY}`;
      const geocodeResponse = await axios.get(geocodeUrl);
      
      if (geocodeResponse.data.status !== 'OK' || !geocodeResponse.data.results.length) {
        return res.status(404).json({ error: 'Location not found' });
      }
      
      const geocodeLocation = geocodeResponse.data.results[0].geometry.location;
      lat = geocodeLocation.lat;
      lng = geocodeLocation.lng;
      console.log(`📍 Location: ${location} -> Lat: ${lat}, Lng: ${lng}`);
    } else {
      lat = location.lat;
      lng = location.lng;
    }

    const radiusInKm = Math.round(radius / 1000);
    const searchQuery = `restaurants in ${location}`;
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${lat},${lng}&radius=${radius}&key=${GOOGLE_API_KEY}`;
    const placesResponse = await axios.get(placesUrl);

    if (placesResponse.data.status !== 'OK' && placesResponse.data.status !== 'ZERO_RESULTS') {
      console.log(`❌ Places API Error: ${placesResponse.data.status}`);
      return res.status(500).json({ error: 'Error fetching restaurants', details: placesResponse.data.status });
    }

    const restaurants = placesResponse.data.results || [];
    console.log(`🔍 Found ${restaurants.length} restaurants in total`);
    
    const detailedRestaurants = [];
    let withWebsite = 0;
    let withoutWebsite = 0;

    for (const restaurant of restaurants) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${restaurant.place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,opening_hours,photos,geometry&key=${GOOGLE_API_KEY}`;
      const detailsResponse = await axios.get(detailsUrl);

      if (detailsResponse.data.status === 'OK') {
        const details = detailsResponse.data.result;
        
        if (!details.website) {
          withoutWebsite++;
          console.log(`✅ ${details.name} - NO WEBSITE`);

          const phone = details.international_phone_number || details.formatted_phone_number || null;
          const telUrl = phone ? `tel:${phone.replace(/\s+/g, '')}` : null;
          const waPhone = normalizePhoneForWhatsApp(phone);
          const whatsappUrl = waPhone ? `https://wa.me/${waPhone}` : null;
          const googleMapsUrl = restaurant.place_id
            ? `https://www.google.com/maps/place/?q=place_id:${restaurant.place_id}`
            : null;

          detailedRestaurants.push({
            name: details.name,
            address: details.formatted_address,
            phone: phone || 'Non disponible',
            telUrl,
            whatsappUrl,
            googleMapsUrl,
            rating: details.rating || 'N/A',
            totalRatings: details.user_ratings_total || 0,
            openNow: details.opening_hours?.open_now,
            location: details.geometry?.location,
            placeId: restaurant.place_id,
            photo: details.photos?.[0]?.photo_reference
          });
        } else {
          withWebsite++;
          console.log(`❌ ${details.name} - HAS WEBSITE: ${details.website}`);
        }
      }
    }

    console.log(`📊 Summary: ${withoutWebsite} without website, ${withWebsite} with website`);

    res.json({
      success: true,
      count: detailedRestaurants.length,
      restaurants: detailedRestaurants
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/api/photo/:photoReference', (req, res) => {
  const { photoReference } = req.params;
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
  res.redirect(photoUrl);
});

app.get('/api/test-restaurant/:name/:location', async (req, res) => {
  try {
    const { name, location } = req.params;
    const query = `${name} ${location}`;
    
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    const searchResponse = await axios.get(searchUrl);
    
    if (searchResponse.data.status !== 'OK' || !searchResponse.data.results.length) {
      return res.json({ found: false, message: 'Restaurant not found' });
    }
    
    const restaurant = searchResponse.data.results[0];
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${restaurant.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,photos,geometry&key=${GOOGLE_API_KEY}`;
    const detailsResponse = await axios.get(detailsUrl);
    
    if (detailsResponse.data.status === 'OK') {
      const details = detailsResponse.data.result;
      res.json({
        found: true,
        name: details.name,
        address: details.formatted_address,
        website: details.website || 'NO WEBSITE',
        hasWebsite: !!details.website,
        phone: details.formatted_phone_number,
        rating: details.rating,
        location: details.geometry?.location
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
});
