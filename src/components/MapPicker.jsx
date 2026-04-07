import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { X, Check, MapPin, Loader2, Search } from 'lucide-react';
import { reverseGeocode, geocodeCity } from '../api/weather';

// Modern Leaflet icon fix
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MapPicker = ({ isOpen, onClose, onSelect, initialPos, t, lang, initialSearchQuery }) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const containerRef = useRef(null);
    const [position, setPosition] = useState(initialPos || { lat: 25.0330, lng: 121.5654 });
    const [isConfirming, setIsConfirming] = useState(false);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedName, setSelectedName] = useState(null);

    // Sync initialSearchQuery when map opens and trigger search
    useEffect(() => {
        if (isOpen && initialSearchQuery) {
            setSearchQuery(initialSearchQuery);
            const performInitialSearch = async () => {
                setIsSearching(true);
                const results = await geocodeCity(initialSearchQuery, lang);
                if (results) {
                    setSearchResults(results);
                }
                setIsSearching(false);
            };
            performInitialSearch();
        }
    }, [isOpen, initialSearchQuery]);

    // Initialize map
    useEffect(() => {
        if (isOpen && containerRef.current && !mapRef.current) {
            const initialCoords = [position.lat, position.lng];
            
            // Initialize the map
            const map = L.map(containerRef.current).setView(initialCoords, 13);
            mapRef.current = map;

            // Add OSM tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Add marker
            const marker = L.marker(initialCoords, { icon: DefaultIcon, draggable: true }).addTo(map);
            markerRef.current = marker;

            // Handle map click
            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                setPosition({ lat, lng });
                marker.setLatLng([lat, lng]);
                setSelectedName(null); // Reset when user manually clicks
            });

            // Handle marker drag
            marker.on('dragend', () => {
                const { lat, lng } = marker.getLatLng();
                setPosition({ lat, lng });
                setSelectedName(null); // Reset when user manually drags
            });
        }

        // Cleanup
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, [isOpen]);

    // Update map/marker when initialPos changes
    useEffect(() => {
        if (isOpen && mapRef.current && initialPos) {
            const coords = [initialPos.lat, initialPos.lon || initialPos.lng];
            setPosition({ lat: coords[0], lng: coords[1] });
            mapRef.current.setView(coords, mapRef.current.getZoom());
            if (markerRef.current) {
                markerRef.current.setLatLng(coords);
            }
        }
    }, [isOpen, initialPos]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            // Priority 1: Use the name from search result if position is unchanged
            let finalName = selectedName;
            let finalCityName = selectedName;
            
            // Priority 2: Use Reverse Geocode
            if (!finalName) {
                const geoResult = await reverseGeocode(position.lat, position.lng, lang);
                finalName = geoResult?.name;
                finalCityName = geoResult?.cityName || finalName;
            }
            
            onSelect(position.lat, position.lng, finalName || t.currentLocation, finalCityName || finalName || t.currentLocation);
            onClose();
        } catch (err) {
            console.error(err);
            onSelect(position.lat, position.lng, t.currentLocation);
            onClose();
        } finally {
            setIsConfirming(false);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        const results = await geocodeCity(searchQuery, lang);
        if (results) {
            setSearchResults(results);
        }
        setIsSearching(false);
    };

    const selectResult = (result) => {
        const { lat, lon } = result;
        const newPos = { lat, lng: lon };
        setPosition(newPos);
        
        if (mapRef.current) {
            mapRef.current.setView([lat, lon], 14);
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lon]);
            }
        }
        
        setSearchResults([]);
        setSearchQuery(result.name);
        setSelectedName(result.name);
    };

    return (
        <div className="map-picker-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="map-picker-container">
                <header className="map-picker-header">
                    <div className="header-left">
                        <MapPin size={24} color="var(--md-sys-color-primary)" />
                        <span className="text-title" style={{ fontWeight: 600 }}>{t.selectLocation}</span>
                    </div>
                    <div className="header-right">
                        <button className="icon-btn" onClick={onClose} title={t.cancel}>
                            <X size={24} />
                        </button>
                    </div>
                </header>

                <div className="map-search-container">
                    <form onSubmit={handleSearch} className="map-search-form">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="map-search-input"
                        />
                        <button type="submit" className="map-search-btn" disabled={isSearching}>
                            {isSearching ? <Loader2 size={20} className="spin" /> : <Search size={20} />}
                        </button>
                    </form>
                    
                    {searchResults.length > 0 && (
                        <div className="map-search-results">
                            {searchResults.map((res, idx) => (
                                <button key={idx} className="map-search-item" onClick={() => selectResult(res)}>
                                    <span className="res-name">{res.name}</span>
                                    <span className="res-admin">{res.admin1 ? `${res.admin1}, ` : ''}{res.country}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="map-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div 
                        ref={containerRef} 
                        style={{ height: '100%', width: '100%', position: 'absolute' }} 
                    />
                </div>

                <footer className="map-picker-footer">
                    <div className="coords-info">
                        <span className="text-label" style={{ fontSize: '0.75rem', opacity: 0.8 }}>LAT: {position.lat.toFixed(5)}</span>
                        <span className="text-label" style={{ fontSize: '0.75rem', opacity: 0.8 }}>LON: {position.lng.toFixed(5)}</span>
                    </div>
                    <button 
                        className="confirm-btn" 
                        onClick={handleConfirm}
                        disabled={isConfirming}
                        style={{ minWidth: '120px', justifyContent: 'center' }}
                    >
                        {isConfirming ? <Loader2 size={20} className="spin" /> : <Check size={20} />}
                        <span style={{ marginLeft: '8px' }}>
                            {t.confirmLocation}
                        </span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default MapPicker;
