var trajHash = {}

document.getElementById("inputTraj").addEventListener("change", handleFiles, false);
document.getElementById("interface").addEventListener("change", updateInterface, false);
document.getElementById("map_bg").addEventListener("change", (e) => {updateMapBackground(e.target.value)}, false);
document.getElementById("chart_handle").addEventListener("click", () => {
  charts.classList.toggle("hidden");
}, false);

updateMapBackground('standard')

/*********************************************************/

function updateInterface(event) {
  let option = event.target.selectedOptions[0].value;
  if(option === 'None') {
    markerLayer.eachLayer((marker) => { marker.setOpacity(0); });
    circleMarkerLayer.eachLayer((marker) => { marker.setStyle({opacity: 0, fillOpacity: 0}); });
  }
  else if(option === 'Icon') {
    markerLayer.eachLayer((marker) => { marker.setOpacity(1); });
    circleMarkerLayer.eachLayer((marker) => { marker.setStyle({opacity: 0, fillOpacity: 0}); });
  }
  else if(option === 'Point') {
    markerLayer.eachLayer((marker) => { marker.setOpacity(0); });
    circleMarkerLayer.eachLayer((marker) => { marker.setStyle({opacity: 1, fillOpacity: 1}); });
  }
}

function updateMapBackground(choice) {
  if (layer) {
    mymap.removeLayer(layer);
  }
  switch(choice) {
    case('topo'):
      layer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
              }).addTo(mymap);
      break;
    case('imagery'):
      layer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              }).addTo(mymap);
      break;
    case('standard'):
      layer = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
              }).addTo(mymap);
    break;
  }
}

async function handleFiles() {
  var flights = [];
  var fileList = this.files;
  var color_step = Math.max(20, 360 / fileList.length);
  for(let i=0; i<fileList.length; i++) {
    let content = await readTheFile(fileList[i]);
    content = JSON.parse(content);
    try {
      // console.log('parsing', content['Flight']['Id']);
      if(content['Flight']['Id'] in trajHash)
        // Don't rerender already existing flight
        continue;

      flights.push(new Flight(content['Flight'], content['StatPoints'], (i * color_step) % 360));
    } catch (error) {
      console.error(error);
    }
  }

  // Order by date
  if(flights.length > 1) {
    flights.sort(function(a, b) {
      return a.getStartDate().localeCompare(b.getStartDate());
    });
  }

  // Move that to a dict
  for(let i=0; i<flights.length; i++) {
    // Build the leaflet traj
    flights[i].buildTrajectory();
    // Then create the list element
    trajlist.appendChild(flights[i].buildListNode());
    // Then track it!
    trajHash[flights[i].flight.Id] = flights[i];
  }
}

function readTheFile(file) {
  return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = reject;
      fr.onload = function() {
        resolve(fr.result);
      }
      fr.readAsText(file);
  });
}
