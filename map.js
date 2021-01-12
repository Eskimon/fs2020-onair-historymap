var mymap = L.map('mapid').setView([46.3630104, 2.9846608], 6);

var takeOffIcon = L.icon({
    iconUrl: 'images/airplane-takeoff.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});
var landingIcon = L.icon({
    iconUrl: 'images/airplane-landing.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

var markerLayer = L.layerGroup();
var circleMarkerLayer = L.layerGroup();
var layer = undefined;
