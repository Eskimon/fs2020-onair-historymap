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

var inputElement = document.getElementById("inputTraj");
var trajlist = document.getElementById("trajList");
var trajHash = {}
inputElement.addEventListener("change", handleFiles, false);

/*********************************************************/

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
      if(!content['Flight']['LandedTime'])
        continue;
      if(content['Flight']['Id'] in trajHash)
        // Don't rerender already existing flight
        continue;
        flights.push({
        'date': content['Flight']['StartTime'],
        'start': {lat: content['Flight']['DepartureAirport']['Latitude'], long: content['Flight']['DepartureAirport']['Longitude']},
        'stop': {lat: content['Flight']['ArrivalActualAirport']['Latitude'], long: content['Flight']['ArrivalActualAirport']['Longitude']},
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
  L.marker([start.lat, start.long], {icon: takeOffIcon}).addTo(mymap);
  L.marker([stop.lat, stop.long], {icon: landingIcon}).addTo(mymap);

  let poly = [[start.lat, start.long]];
  for(let i=0; i < points.length; i++) {
    poly.push([points[i]['Aircraft']['Latitude'], points[i]['Aircraft']['Longitude']]);
  }
  poly.push([stop.lat, stop.long]);

  trajHash[metadata['Id']] = L.polyline(poly, {color: color}).addTo(mymap);

  let node = document.createElement('li');
  let colorBox = document.createElement('span');
  let textBox = document.createElement('span');
  colorBox.className = 'color-box';
  colorBox.style.backgroundColor = color;
  textBox.innerText = `${metadata['DepartureAirport']['DisplayName']} - ${metadata['ArrivalActualAirport']['DisplayName']}`;
  textBox.title = `${metadata['StartTime']}`;
  textBox.setAttribute("aria-flighid", metadata['Id']);
  node.appendChild(colorBox);
  node.appendChild(textBox);
  trajlist.appendChild(node);

  textBox.addEventListener("click", (evt) => {
    let flightid = evt.target.getAttribute('aria-flighid');
    let bounds = trajHash[flightid].getBounds();
    mymap.fitBounds(bounds);
  });
  // for(let i=0; i < points.length; i++) {
  //   L.circle([points[i]['Aircraft']['Latitude'], points[i]['Aircraft']['Longitude']], {radius: 200}).addTo(mymap);
  // }
}