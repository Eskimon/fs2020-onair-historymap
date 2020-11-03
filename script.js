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

function handleFiles() {
  var fileList = this.files;
  for(let i=0; i<fileList.length; i++) {
    let reader = new FileReader();
    reader.onload = function() {
      let content = JSON.parse(reader.result);
      let points = content['StatPoints'];
      try {
        // console.log('parsing', content['Flight']['Id']);
        if(!content['Flight']['LandedTime'])
          return;
        if(content['Flight']['Id'] in trajHash)
          // Don't rerender already existing flight
          return;
        addTrip(
          {lat: content['Flight']['DepartureAirport']['Latitude'], long: content['Flight']['DepartureAirport']['Longitude']},
          {lat: content['Flight']['ArrivalActualAirport']['Latitude'], long: content['Flight']['ArrivalActualAirport']['Longitude']},
          points,
          content['Flight'],
        );
      } catch (error) {
        console.error(error);
      }

    };
    reader.readAsText(fileList[i]); 
  }
}

function addTrip(start, stop, points, metadata) {
  let color = "#"+((1<<24)*Math.random()|0).toString(16)
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