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

L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
}).addTo(mymap);

var markerLayer = L.layerGroup();
var circleMarkerLayer = L.layerGroup();


var infobox_from = document.getElementById("from");
var infobox_to = document.getElementById("to");
var infobox_takeoff = document.getElementById("takeoff");
var infobox_landing = document.getElementById("landing");
var infobox_aircraft = document.getElementById("aircraft");