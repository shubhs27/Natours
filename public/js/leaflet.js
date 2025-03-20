/* eslint-disable */

// No need to make another API call as we already have the data, so we put it on html for js to read (convert JSON to string)

export const displayMap = (locations) => {
  // Create a map centered on the first location (if available)
  const defaultCenter = [25.7617, -80.1918];
  const mapCenter =
    locations.length > 0
      ? [locations[0].coordinates[1], locations[0].coordinates[0]]
      : defaultCenter;

  // Initialize the map
  const map = L.map('map', {
    scrollWheelZoom: false,
    center: mapCenter,
    zoom: 10,
    zoomControl: true,
  });

  // Add a custom grayscale tile layer
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    },
  ).addTo(map);

  // Create a bounds object to fit all markers
  const bounds = L.latLngBounds();

  // Custom icon
  const customIcon = L.icon({
    iconUrl: '/img/pin.png',
    iconSize: [30, 40], // size of the icon
    iconAnchor: [15, 40], // point of the icon which will correspond to marker's location
    popupAnchor: [20, -40], // point from which the popup should open relative to the iconAnchor
  });

  // Add markers for each location
  locations.forEach((loc) => {
    // Create marker
    const markerLatLng = [loc.coordinates[1], loc.coordinates[0]];

    // Add marker to map
    const marker = L.marker(markerLatLng, {
      icon: customIcon,
    }).addTo(map);

    // Add popup to marker
    const popup = L.popup({
      className: 'custom-popup',
      closeButton: true,
      autoClose: false,
    }).setContent(
      `<p style="font-size: 14px; margin: 0; padding: 5px; min-width: 150px; text-align: center;">Day ${loc.day}: ${loc.description}</p>`,
    );

    marker.bindPopup(popup);

    marker.openPopup();

    // Extend bounds to include this location
    bounds.extend(markerLatLng);
  });

  // Fit map to bounds with padding
  map.fitBounds(bounds, {
    padding: [80, 80],
  });

  const style = document.createElement('style');
  style.textContent = `
      .leaflet-popup-content-wrapper {
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 5px rgba(0,0,0,0.2);
      }
      .leaflet-popup-content {
        margin: 0;
        padding: 0;
      }
      .leaflet-popup-tip {
        background: white;
      }
      .leaflet-popup-close-button {
        position: absolute;
        top: 8px;
        right: 8px;
        color: #333;
      }
      .leaflet-popup-close-button:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.1);
      }
    `;
  document.head.appendChild(style);
};
