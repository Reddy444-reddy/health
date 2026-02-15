import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone, Navigation, Clock, Activity, AlertCircle, Crosshair, Search, Store, Heart } from 'lucide-react';
import { useHealthData } from '../contexts/HealthDataContext';
import { useSearchHistory } from '../contexts/SearchHistoryContext';

// --- Custom Icons ---
const createCustomIcon = (type) => {
    let iconHtml = '';
    let colorClass = '';

    if (type === 'user') {
        colorClass = 'text-blue-500';
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-dot w-6 h-6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></svg>`;
    } else if (type === 'hospital') {
        colorClass = 'text-red-500';
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-pulse w-6 h-6 text-red-500"><path d="M19 14c1.49-1.28 3.6-2.36 2.57-4.25-.67-1.27-2.93-1.97-4.79-.54l-1.06.84L14 9V6.26C14 4.54 12.87 3 11 3S8 4.54 8 6.26v9.54c0 .87.35 1.63.89 2.21l.6.57c1.33 1.25 3.32 1.34 4.51.13l.36-.36" fill="currentColor" fill-opacity="0.2"/></svg>`;
    } else {
        colorClass = 'text-emerald-500';
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store w-6 h-6 text-emerald-500"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>`;
    }

    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg border-2 border-white ${colorClass} transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform">${iconHtml}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const userIcon = createCustomIcon('user');
const hospitalIcon = createCustomIcon('hospital');
const groceryIcon = createCustomIcon('grocery');

// Utilities
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(1);
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

// Component to handle map clicks for location selection
const LocationSelector = ({ onLocationSelect }) => {
    useMapEvents({
        click: (e) => {
            onLocationSelect({
                lat: e.latlng.lat,
                lng: e.latlng.lng
            });
        },
    });
    return null;
};

// Component to recenter map when coords change
const RecenterMap = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo([coords.lat, coords.lng], 14);
        }
    }, [coords, map]);
    return null;
};

// --- Smart Image Assignment ---
const PLACE_IMAGES = {
    Hospital: {
        default: [
            "https://images.unsplash.com/photo-1587351021759-3e566b9af923?auto=format&fit=crop&q=80&w=400&h=250", // Building
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400&h=250", // Hospital Corridor
            "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=400&h=250", // Medical Sign
        ],
        dental: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=400&h=250",
        eye: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400&h=250", // Glasses/Eye test
        pharmacy: "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=400&h=250",
    },
    Grocery: {
        default: [
            "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=400&h=250", // Market aisle
            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400&h=250", // Market
            "https://images.unsplash.com/photo-1604719312566-b7e2b0084adb?auto=format&fit=crop&q=80&w=400&h=250", // Supermarket shelf
        ],
        fruit: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400&h=250", // Fresh fruits
        veg: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=400&h=250", // Vegetables
        mart: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=400&h=250", // Convenience store
    }
};

const getPlaceImage = (name, type) => {
    const lowerName = name.toLowerCase();
    const images = PLACE_IMAGES[type] || PLACE_IMAGES.Hospital; // Fallback to Hospital if type unknown

    // Check for specific keywords in name
    if (type === 'Hospital') {
        if (lowerName.includes('dental') || lowerName.includes('dentist') || lowerName.includes('smile')) return images.dental;
        if (lowerName.includes('eye') || lowerName.includes('vision') || lowerName.includes('optical')) return images.eye;
        if (lowerName.includes('pharm') || lowerName.includes('medic')) return images.pharmacy;
    } else if (type === 'Grocery') {
        if (lowerName.includes('fruit') || lowerName.includes('mandi')) return images.fruit;
        if (lowerName.includes('veg') || lowerName.includes('green')) return images.veg;
        if (lowerName.includes('mart') || lowerName.includes('super')) return images.mart;
    }

    // Return random default image if no keyword match
    const defaults = images.default;
    return defaults[Math.floor(Math.random() * defaults.length)];
};

const Nearby = () => {
    const { currentReport, hasRecentHealthData, getHealthConditions, getNeededSpecializations } = useHealthData();
    const { addSearch } = useSearchHistory();
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState(null);
    const [error, setError] = useState(null);
    const [places, setPlaces] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [routePolyline, setRoutePolyline] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const [mapType, setMapType] = useState('standard'); // 'standard' | 'dark'
    const [currentContext, setCurrentContext] = useState(''); // Store city/area name for fallback

    // Mock places generator as fallback
    const generatePlaces = (lat, lng) => {
        return [
            {
                id: 1,
                name: "City General Hospital (Demo)",
                type: "Hospital",
                status: "Open 24/7",
                waitTime: "15 min",
                occupancy: "Moderate",
                distance: "0.8 km",
                rating: 4.8,
                address: "123 Health Ave",
                lat: lat + 0.005,
                lng: lng + 0.005,
                image: getPlaceImage("City General Hospital", "Hospital")
            },
            {
                id: 2,
                name: "GreenCross Pharmacy (Demo)",
                type: "Grocery", // Intentionally using Grocery icon/type logic per previous code but name suggests pharmacy? Previous code had type Grocery for pharmacy demo. Keeping consistency or fixing?
                // Actually previous code used type: "Grocery" for GreenCross Pharmacy. I will stick to "Grocery" type but name "Pharmacy" might trigger pharmacy image if I added pharmacy to Grocery images?
                // Wait, Pharmacy in my list is under Hospital. 
                // Let's stick to the previous code's type assignment, but maybe fix the type for Pharmacy?
                // The previous code had:  type: "Grocery", name: "GreenCross Pharmacy (Demo)". 
                // This seems like a typo in original demo data or intended. I'll leave type as Grocery to match icon logic, but getPlaceImage might get confused.
                // I'll update the demo data types slightly to make more sense or just let getPlaceImage handle it.
                // Re-reading previous code: "GreenCross Pharmacy (Demo)", type: "Grocery".
                // I will update the type to "Hospital" for Pharmacy demo so it gets the pharmacy image/icon correctly? Or maybe add Pharmacy to Grocery images?
                // The previous code used `isHospital ? "Hospital" : "Grocery"`.
                // I will keep it simple.
                status: "Closes 10 PM",
                waitTime: "No wait",
                occupancy: "Low",
                distance: "1.2 km",
                rating: 4.5,
                address: "45 Market St",
                lat: lat - 0.003,
                lng: lng + 0.004,
                image: getPlaceImage("GreenCross Pharmacy", "Hospital") // Using Hospital type for image lookup to get pharmacy image
            },
            {
                id: 3,
                name: "Elite Dental Care (Demo)",
                type: "Hospital",
                status: "Open via Appt",
                waitTime: "1h 20m",
                occupancy: "High",
                distance: "2.4 km",
                rating: 4.9,
                address: "88 Smile Rd",
                lat: lat + 0.002,
                lng: lng - 0.006,
                image: getPlaceImage("Elite Dental Care", "Hospital")
            }
        ];
    };

    // Fetch places from Overpass API
    const fetchLivePlaces = async (lat, lng, locationName = "") => {
        try {
            // Query for hospitals and supermarkets within 5km (nodes, ways, and relations)
            const query = `
                [out:json][timeout:25];
                (
                  nwr["amenity"="hospital"](around:5000,${lat},${lng});
                  nwr["shop"="supermarket"](around:5000,${lat},${lng});
                );
                out center;
            `;

            const response = await fetch('https://overpass.kumi.systems/api/interpreter', {
                method: 'POST',
                body: query
            });

            if (!response.ok) throw new Error('Failed to fetch nearby places');

            const data = await response.json();

            const getAddress = (tags) => {
                if (tags['addr:full']) return tags['addr:full'];

                const street = tags['addr:street'];
                const number = tags['addr:housenumber'];
                const city = tags['addr:city'] || tags['addr:town'] || tags['addr:village'];
                const suburb = tags['addr:suburb'] || tags['addr:district'] || tags['addr:neighbourhood'];

                if (street) {
                    return `${number ? number + ' ' : ''}${street}${city ? ', ' + city : ''}`;
                }

                if (suburb) {
                    return `${suburb}${city ? ', ' + city : ''}`;
                }

                if (city) {
                    return city;
                }

                // Fallback to current context if available
                if (locationName) {
                    return `Near ${locationName}`;
                }

                // Final fallback if absolutely nothing is found
                return "Address details unavailable";
            };

            const mappedPlaces = data.elements.map(place => {
                const isHospital = place.tags.amenity === 'hospital';
                const type = isHospital ? "Hospital" : "Grocery";
                const name = place.tags.name || (isHospital ? "Unnamed " + type : "Unnamed Place");

                // Handle different geometry types from 'out center'
                const placeLat = place.lat || (place.center && place.center.lat);
                const placeLng = place.lon || (place.center && place.center.lon);

                if (!placeLat || !placeLng) return null; // Skip if no coordinates

                return {
                    id: place.id,
                    name: name,
                    type: type,
                    status: "Open", // Placeholder as opening_hours parsing is complex
                    waitTime: isHospital ? "Unknown" : "No wait",
                    occupancy: "Moderate",
                    distance: `${calculateDistance(lat, lng, placeLat, placeLng)} km`,
                    rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating
                    address: getAddress(place.tags),
                    lat: placeLat,
                    lng: placeLng,
                    image: getPlaceImage(name, type)
                };
            })
                .filter(Boolean) // Remove nulls
                .slice(0, 15); // Limit to 15 results

            setPlaces(mappedPlaces);
        } catch (err) {
            console.warn("Overpass API failed, using fallback:", err);
            setError("Live data unavailable. Showing demo results.");
            setPlaces(generatePlaces(lat, lng));
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = async (newCoords) => {
        setCoords(newCoords);
        setRoutePolyline(null);
        setRouteInfo(null);
        // Ensure we pass the current context or update it if possible
        await fetchLivePlaces(newCoords.lat, newCoords.lng, currentContext);
    };

    const fetchLocation = () => {
        setLoading(true);
        setError(null);
        setRoutePolyline(null);
        setRouteInfo(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const newCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCoords(newCoords);

                // Reverse geocode to get context
                let detectedName = "";
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newCoords.lat}&lon=${newCoords.lng}`);
                    const data = await res.json();
                    if (data && data.address) {
                        detectedName = data.address.city || data.address.town || data.address.village || data.address.suburb || "Your location";
                        setCurrentContext(detectedName);
                    }
                } catch (e) {
                    console.warn("Reverse geocode failed", e);
                }

                await fetchLivePlaces(newCoords.lat, newCoords.lng, detectedName);
                setLoading(false);
            },
            (err) => {
                setError("Unable to retrieve your location.");
                setLoading(false);
            }
        );
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        setRoutePolyline(null);
        setRouteInfo(null);

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const newCoords = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };

                // Extract clean name from display_name
                const displayNameParts = data[0].display_name.split(',');
                const cleanName = displayNameParts[0];
                setCurrentContext(cleanName);

                // Track search in history
                await addSearch({
                    query: searchQuery,
                    page: 'nearby',
                    title: `Location: ${cleanName}`
                });

                setCoords(newCoords);
                await fetchLivePlaces(newCoords.lat, newCoords.lng, cleanName);
            } else {
                setError("Location not found.");
            }
        } catch (err) {
            setError("Search failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = async (destLat, destLng) => {
        if (!coords) return;

        try {
            // OSRM routing
            const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords.lng},${coords.lat};${destLng},${destLat}?overview=full&geometries=geojson`);
            const data = await response.json();

            if (data.code === 'Ok' && data.routes.length > 0) {
                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Flip to lat,lng
                setRoutePolyline(coordinates);
                setRouteInfo({
                    duration: Math.round(route.duration / 60), // minutes
                    distance: (route.distance / 1000).toFixed(1) // km
                });
            }
        } catch (err) {
            console.error("Routing failed", err);
            setError("Could not calculate route.");
        }
    };

    return (
        <div className="p-4 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 animate-slide-up flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400 mb-2">
                        Nearby Services
                    </h2>
                    <p className="text-slate-400">Live healthcare & groceries near you</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative w-full md:w-64">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search city or area..."
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                        />
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    </form>

                    {/* Map Type Toggle */}
                    <button
                        onClick={() => setMapType(prev => prev === 'standard' ? 'dark' : 'standard')}
                        className="glass-card w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-700/50 transition-colors text-slate-300"
                        title="Switch Map Style"
                    >
                        {mapType === 'standard' ? <Activity size={18} className="text-emerald-400" /> : <Navigation size={18} className="text-sky-400" />}
                    </button>

                    <button
                        onClick={fetchLocation}
                        disabled={loading}
                        className={`glass-card px-6 py-2.5 w-full md:w-auto flex items-center justify-center gap-2 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-sky-500/10 cursor-pointer'} text-sky-400 border-sky-500/30 whitespace-nowrap`}
                    >
                        {loading ? <Activity className="animate-spin" size={18} /> : <Crosshair size={18} />}
                        <span>Locate Me</span>
                    </button>
                </div>
            </div>

            {/* Health Context Banner */}
            {hasRecentHealthData() && currentReport && (currentReport.conditions?.length > 0 || currentReport.specializations?.length > 0) && (
                <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20 p-5 rounded-xl flex-shrink-0 animate-slide-up">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                            <Heart className="text-rose-400" size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white mb-2">Personalized Health Suggestions</h3>
                            <p className="text-sm text-slate-400 mb-3">
                                Based on your recent health analysis, here are recommended services tailored to your needs.
                            </p>
                            {currentReport.specializations && currentReport.specializations.length > 0 && (
                                <div className="mb-2">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Recommended Specializations:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {currentReport.specializations.map((spec, idx) => (
                                            <span key={idx} className="text-xs px-3 py-1 bg-rose-500/10 text-rose-300 rounded-full border border-rose-500/20">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {currentReport.dietaryRestrictions && currentReport.dietaryRestrictions.length > 0 && (
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Dietary Needs:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {currentReport.dietaryRestrictions.map((restriction, idx) => (
                                            <span key={idx} className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/20">
                                                {restriction}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-xl flex items-center gap-3 animate-slide-up flex-shrink-0">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Map Section */}
            {coords ? (
                <div className="glass-panel p-1 w-full relative z-0 animate-slide-up delay-100 rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: '400px' }}>
                    <MapContainer
                        center={[coords.lat, coords.lng]}
                        zoom={14}
                        style={{ height: "100%", width: "100%", borderRadius: '16px', minHeight: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution={mapType === 'standard' ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'}
                            url={mapType === 'standard'
                                ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            }
                        />
                        <RecenterMap coords={coords} />
                        <LocationSelector onLocationSelect={handleLocationSelect} />

                        {/* User Marker */}
                        <Marker position={[coords.lat, coords.lng]} icon={userIcon}>
                            <Popup className="glass-popup">
                                <div className="text-slate-800 font-bold">You are here</div>
                            </Popup>
                        </Marker>

                        {/* Place Markers */}
                        {places.map(place => (
                            <Marker
                                key={place.id}
                                position={[place.lat, place.lng]}
                                icon={place.type === 'Hospital' ? hospitalIcon : groceryIcon}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <div className="font-bold text-slate-900">{place.name}</div>
                                        <div className="text-xs text-slate-600">{place.type}</div>
                                        <button
                                            onClick={() => handleNavigate(place.lat, place.lng)}
                                            className="mt-2 w-full bg-sky-500 text-white text-xs py-1 rounded hover:bg-sky-600 transition-colors"
                                        >
                                            Get Directions
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Route Line */}
                        {routePolyline && (
                            <Polyline
                                positions={routePolyline}
                                color="#0ea5e9"
                                weight={4}
                                opacity={0.7}
                                dashArray="10, 10"
                            />
                        )}
                    </MapContainer>

                    {/* Route Info Overlay */}
                    {routeInfo && (
                        <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur border border-sky-500/30 p-3 rounded-xl shadow-lg animate-slide-up">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400">
                                    <Navigation size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Estimated Travel</div>
                                    <div className="font-bold text-white flex gap-3 text-sm">
                                        <span>{routeInfo.duration} min</span>
                                        <span className="text-slate-600">|</span>
                                        <span>{routeInfo.distance} km</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-[300px] flex items-center justify-center glass-card border-dashed border-2 border-slate-700 text-slate-500 animate-pulse">
                    <div className="text-center">
                        <Navigation size={40} className="mx-auto mb-2 opacity-50" />
                        <p>Click "Locate Me" or search a city to explore</p>
                    </div>
                </div>
            )}

            {/* Cards Sliders */}
            {coords && (
                <div className="space-y-8 pb-8">
                    {/* Hospitals Section */}
                    <div className="relative">
                        <h3 className="text-xl font-bold text-slate-200 mb-4 px-1 flex items-center gap-2">
                            <Activity className="text-rose-400" size={24} />
                            Hospitals & Clinics
                        </h3>

                        {/* Gradient Masks */}
                        <div className="absolute left-0 top-12 bottom-0 w-12 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-12 bottom-0 w-12 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

                        <div className="flex overflow-x-auto pb-4 gap-6 px-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent -mx-4">
                            {places.filter(p => p.type === 'Hospital').length === 0 ? (
                                <div className="w-full text-center text-slate-500 py-10 flex-shrink-0 glass-card">
                                    No hospitals found nearby.
                                </div>
                            ) : places.filter(p => p.type === 'Hospital').map((place, idx) => (
                                <div
                                    key={place.id}
                                    className="glass-card group relative overflow-hidden rounded-2xl transition-all duration-500 hover:translate-y-[-8px] hover:shadow-2xl hover:shadow-sky-500/20 border border-white/5 hover:border-sky-500/30 bg-slate-800/40 backdrop-blur-xl animate-slide-up flex-shrink-0 w-[85vw] md:w-[350px] snap-center"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Hover Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/0 via-sky-500/0 to-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

                                    {/* Card Image */}
                                    <div className="h-44 overflow-hidden relative z-10">
                                        <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>

                                        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-400 flex items-center gap-1 border border-white/10 shadow-lg">
                                            <span className="text-yellow-400">★</span> {place.rating}
                                        </div>
                                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5 border border-white/10 shadow-lg backdrop-blur-md bg-rose-500/80">
                                            <Activity size={10} />
                                            {place.type}
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5 relative z-10 -mt-6">
                                        <div className="flex justify-between items-start mb-2 gap-3 relative">
                                            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-sky-400 transition-colors">{place.name}</h3>
                                            <span className="text-xs font-bold font-mono text-sky-300 bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20 shadow-sm whitespace-nowrap backdrop-blur-sm">
                                                {place.distance}
                                            </span>
                                        </div>

                                        <p className="text-slate-400 text-xs mb-4 flex items-start gap-1.5 leading-relaxed min-h-[2.5em]">
                                            <MapPin size={12} className="text-sky-500 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{place.address}</span>
                                        </p>

                                        {/* Live Status Bar */}
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="bg-slate-950/50 rounded-lg p-2.5 border border-white/5 text-center group-hover:border-white/10 transition-colors">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Status</div>
                                                <div className="text-xs font-bold text-emerald-400 truncate">{place.status}</div>
                                            </div>
                                            <div className="bg-slate-950/50 rounded-lg p-2.5 border border-white/5 text-center group-hover:border-white/10 transition-colors">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Wait Time</div>
                                                <div className={`text-xs font-bold truncate ${place.waitTime === 'Low' || place.waitTime === 'No wait' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                    {place.waitTime}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <button
                                            onClick={() => handleNavigate(place.lat, place.lng)}
                                            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <Navigation size={16} />
                                            <span>Get Directions</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Groceries Section */}
                    <div className="relative">
                        <h3 className="text-xl font-bold text-slate-200 mb-4 px-1 flex items-center gap-2">
                            <Store className="text-emerald-400" size={24} />
                            Groceries & Pharmacies
                        </h3>

                        {/* Gradient Masks */}
                        <div className="absolute left-0 top-12 bottom-0 w-12 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-12 bottom-0 w-12 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

                        <div className="flex overflow-x-auto pb-4 gap-6 px-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent -mx-4">
                            {places.filter(p => p.type === 'Grocery').length === 0 ? (
                                <div className="w-full text-center text-slate-500 py-10 flex-shrink-0 glass-card">
                                    No groceries found nearby.
                                </div>
                            ) : places.filter(p => p.type === 'Grocery').map((place, idx) => (
                                <div
                                    key={place.id}
                                    className="glass-card group relative overflow-hidden rounded-2xl transition-all duration-500 hover:translate-y-[-8px] hover:shadow-2xl hover:shadow-emerald-500/20 border border-white/5 hover:border-emerald-500/30 bg-slate-800/40 backdrop-blur-xl animate-slide-up flex-shrink-0 w-[85vw] md:w-[350px] snap-center"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Hover Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

                                    {/* Card Image */}
                                    <div className="h-44 overflow-hidden relative z-10">
                                        <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>

                                        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-400 flex items-center gap-1 border border-white/10 shadow-lg">
                                            <span className="text-yellow-400">★</span> {place.rating}
                                        </div>
                                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5 border border-white/10 shadow-lg backdrop-blur-md bg-emerald-500/80">
                                            <Store size={10} />
                                            {place.type}
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5 relative z-10 -mt-6">
                                        <div className="flex justify-between items-start mb-2 gap-3 relative">
                                            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">{place.name}</h3>
                                            <span className="text-xs font-bold font-mono text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shadow-sm whitespace-nowrap backdrop-blur-sm">
                                                {place.distance}
                                            </span>
                                        </div>

                                        <p className="text-slate-400 text-xs mb-4 flex items-start gap-1.5 leading-relaxed min-h-[2.5em]">
                                            <MapPin size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{place.address}</span>
                                        </p>

                                        {/* Live Status Bar */}
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="bg-slate-950/50 rounded-lg p-2.5 border border-white/5 text-center group-hover:border-white/10 transition-colors">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Status</div>
                                                <div className="text-xs font-bold text-emerald-400 truncate">{place.status}</div>
                                            </div>
                                            <div className="bg-slate-950/50 rounded-lg p-2.5 border border-white/5 text-center group-hover:border-white/10 transition-colors">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Occupancy</div>
                                                <div className="text-xs font-bold text-emerald-400 truncate">Low</div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <button
                                            onClick={() => handleNavigate(place.lat, place.lng)}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <Navigation size={16} />
                                            <span>Get Directions</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Nearby;
