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

var trajHash = {}
var trajlist = document.getElementById("trajList");
var inputElement = document.getElementById("inputTraj");
inputElement.addEventListener("change", handleFiles, false);
var inputInterface = document.getElementById("interface");
inputInterface.addEventListener("change", updateInterface, false);

/*********************************************************/

function updateInterface(event) {
  let option = event.target.selectedOptions[0].value;
  if(option === 'None') {
    for(let idx in trajHash) {
      trajHash[idx]['marker'][0].setOpacity(0);
      trajHash[idx]['marker'][1].setOpacity(0);
      trajHash[idx]['point'][0].setStyle({opacity: 0, fillOpacity: 0});
      trajHash[idx]['point'][1].setStyle({opacity: 0, fillOpacity: 0});
    }
  }
  else if(option === 'Icon') {
    for(let idx in trajHash) {
      trajHash[idx]['marker'][0].setOpacity(1);
      trajHash[idx]['marker'][1].setOpacity(1);
      trajHash[idx]['point'][0].setStyle({opacity: 0, fillOpacity: 0});
      trajHash[idx]['point'][1].setStyle({opacity: 0, fillOpacity: 0});
    }
  }
  else if(option === 'Point') {
    for(let idx in trajHash) {
      trajHash[idx]['marker'][0].setOpacity(0);
      trajHash[idx]['marker'][1].setOpacity(0);
      trajHash[idx]['point'][0].setStyle({opacity: 1, fillOpacity: 1});
      trajHash[idx]['point'][1].setStyle({opacity: 1, fillOpacity: 1});
    }
  }
}

async function handleFiles() {
  var flights = [];
  var fileList = this.files;
  var color_step = Math.max(20, 360 / fileList.length);
  for(let i=0; i<fileList.length; i++) {
    let content = await readTheFile(fileList[i]);
    content = JSON.parse(content);
    let points = content['StatPoints'];
    try {
      // console.log('parsing', content['Flight']['Id']);
      if(content['Flight']['Id'] in trajHash)
        // Don't rerender already existing flight
        continue;
      let arrivalAirport = content['Flight']['ArrivalActualAirport'] || content['Flight']['ArrivalIntendedAirport'];
      flights.push({
        'date': content['Flight']['StartTime'],
        'start': {lat: content['Flight']['DepartureAirport']['Latitude'], long: content['Flight']['DepartureAirport']['Longitude']},
        'stop': {lat: arrivalAirport['Latitude'], long: arrivalAirport['Longitude']},
        'points': points,
        'content': content['Flight'],
      })
    } catch (error) {
      console.error(error);
    }
  }
  // Order by date
  if(flights.length > 1) {
    flights.sort(function(a, b) {
      return a['date'].localeCompare(b['date']);
    });
  }
  // Then add trips
  for(let i=0; i<flights.length; i++) {
    // console.log(new Intl.DateTimeFormat().format(new Date(flights[i]['date'])));
    addTrip(
      flights[i].start,
      flights[i].stop,
      flights[i].points,
      flights[i].content,
      `hsl(${(i * color_step) % 360}, 100%, 50%)`
    );
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

function addTrip(start, stop, points, metadata, color) {
  let pointOption = {
    radius: 4,
    stroke: true,
    color: '#000000',
    weight: 1,
    fill: true,
    fillColor: color,
    opacity: 0,
    fillOpacity: 0,
  }
  let startMarker = L.marker([start.lat, start.long], {icon: takeOffIcon}).addTo(mymap);
  let endMarker = L.marker([stop.lat, stop.long], {icon: landingIcon}).addTo(mymap);
  let startPoint = L.circleMarker([start.lat, start.long], pointOption).addTo(mymap);
  let endPoint = L.circleMarker([stop.lat, stop.long], pointOption).addTo(mymap);


  let poly = [[start.lat, start.long]];
  for(let i=0; i < points.length; i++) {
    poly.push([points[i]['Aircraft']['Latitude'], points[i]['Aircraft']['Longitude']]);
  }
  poly.push([stop.lat, stop.long]);

  trajHash[metadata['Id']] = {
    'poly': L.polyline(poly, {color: color}).addTo(mymap),
    'marker': [startMarker, endMarker],
    'point': [startPoint, endPoint],
  };

  let node = document.createElement('li');
  let colorBox = document.createElement('span');
  let textBox = document.createElement('span');
  colorBox.className = 'color-box';
  colorBox.style.backgroundColor = color;
  let arrivalAirport = metadata['ArrivalActualAirport'] || metadata['ArrivalIntendedAirport'];
  textBox.innerText = `${metadata['DepartureAirport']['DisplayName']} - ${arrivalAirport['DisplayName']}`;
  textBox.title = `${metadata['StartTime']}`;
  textBox.setAttribute("aria-flighid", metadata['Id']);
  node.appendChild(colorBox);
  node.appendChild(textBox);
  trajlist.appendChild(node);

  textBox.addEventListener("click", (evt) => {
    let flightid = evt.target.getAttribute('aria-flighid');
    let bounds = trajHash[flightid]['poly'].getBounds();
    mymap.fitBounds(bounds);
  });
  // for(let i=0; i < points.length; i++) {
  //   L.circle([points[i]['Aircraft']['Latitude'], points[i]['Aircraft']['Longitude']], {radius: 200}).addTo(mymap);
  // }
}