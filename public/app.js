const searchBtn = document.getElementById('searchBtn');
const locationInput = document.getElementById('locationInput');
const radiusSelect = document.getElementById('radiusSelect');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const noResults = document.getElementById('noResults');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const resultCount = document.getElementById('resultCount');
const restaurantList = document.getElementById('restaurantList');

searchBtn.addEventListener('click', searchRestaurants);
locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchRestaurants();
    }
});

async function searchRestaurants() {
    const location = locationInput.value.trim();
    const radius = radiusSelect.value;

    if (!location) {
        showError('Veuillez entrer une localisation');
        return;
    }

    hideAll();
    loading.classList.remove('hidden');

    try {
        const response = await fetch('/api/search-restaurants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ location, radius: parseInt(radius) })
        });

        const data = await response.json();

        loading.classList.add('hidden');

        if (!response.ok) {
            showError(data.error || 'Une erreur est survenue');
            return;
        }

        if (data.restaurants.length === 0) {
            noResults.classList.remove('hidden');
        } else {
            displayResults(data.restaurants);
        }

    } catch (err) {
        loading.classList.add('hidden');
        showError('Erreur de connexion au serveur. Assurez-vous que le serveur est démarré.');
        console.error(err);
    }
}

function displayResults(restaurants) {
    resultCount.textContent = restaurants.length;
    restaurantList.innerHTML = '';

    restaurants.forEach(restaurant => {
        const card = createRestaurantCard(restaurant);
        restaurantList.appendChild(card);
    });

    results.classList.remove('hidden');
}

function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 overflow-hidden';

    const photoUrl = restaurant.photo 
        ? `/api/photo/${restaurant.photo}`
        : 'https://via.placeholder.com/400x200?text=Pas+de+photo';

    const openStatus = restaurant.openNow === true 
        ? '<span class="text-green-600 font-semibold"><i class="fas fa-check-circle"></i> Ouvert</span>'
        : restaurant.openNow === false 
        ? '<span class="text-red-600 font-semibold"><i class="fas fa-times-circle"></i> Fermé</span>'
        : '<span class="text-gray-500">Horaires inconnus</span>';

    card.innerHTML = `
        <div class="relative">
            <img src="${photoUrl}" alt="${restaurant.name}" class="w-full h-48 object-cover">
            <div class="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                <i class="fas fa-star"></i> ${restaurant.rating}
            </div>
        </div>
        <div class="p-4">
            <h3 class="text-xl font-bold text-gray-800 mb-2">${restaurant.name}</h3>
            
            <div class="space-y-2 text-sm text-gray-600">
                <div class="flex items-start">
                    <i class="fas fa-map-marker-alt text-red-500 mt-1 mr-2"></i>
                    <span>${restaurant.address}</span>
                </div>
                
                <div class="flex items-center">
                    <i class="fas fa-phone text-blue-500 mr-2"></i>
                    <span>${restaurant.phone}</span>
                </div>
                
                <div class="flex items-center justify-between">
                    <div>
                        <i class="fas fa-users text-purple-500 mr-2"></i>
                        <span>${restaurant.totalRatings} avis</span>
                    </div>
                    <div>${openStatus}</div>
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200">
                <a 
                    href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.address)}&query_place_id=${restaurant.placeId}"
                    target="_blank"
                    class="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-200"
                >
                    <i class="fas fa-map"></i> Voir sur Google Maps
                </a>
            </div>
        </div>
    `;

    return card;
}

function showError(message) {
    errorMessage.textContent = message;
    error.classList.remove('hidden');
    setTimeout(() => {
        error.classList.add('hidden');
    }, 5000);
}

function hideAll() {
    loading.classList.add('hidden');
    results.classList.add('hidden');
    noResults.classList.add('hidden');
    error.classList.add('hidden');
}
