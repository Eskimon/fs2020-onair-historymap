class Flight {
/*
let arrivalAirport = content['Flight']['ArrivalActualAirport'] || content['Flight']['ArrivalIntendedAirport'];
flights.push({
  'date': content['Flight']['StartTime'],
  'start': {lat: content['Flight']['DepartureAirport']['Latitude'], long: content['Flight']['DepartureAirport']['Longitude']},
  'stop': {lat: arrivalAirport['Latitude'], long: arrivalAirport['Longitude']},
  'points': content['StatPoints'],
  'content': content['Flight'],
})
*/

  constructor(metadata, points, hue) {
    this.flight = metadata;
    this.points = points;
    this.color = `hsl(${hue}, 100%, 50%)`;
    this.arrival = this.flight['ArrivalActualAirport'] || this.flight['ArrivalIntendedAirport'];

    this.polyline = null;
    this.marker = [null, null];
    this.pointMarker = [null, null];

    this.buildTrajectory();
  }

  buildTrajectory() {
    let pointOption = {
      radius: 4,
      stroke: true,
      color: '#000000',
      weight: 1,
      fill: true,
      fillColor: this.color,
      opacity: 0,
      fillOpacity: 0,
    }

    let poly = [[this.flight['DepartureAirport']['Latitude'], this.flight['DepartureAirport']['Longitude']]];
    let lastLon = this.flight['DepartureAirport']['Longitude'];
    let wrap = false;
    for(let i=0; i < this.points.length; i++) {
      if((lastLon < 0 && this.points[i]['Aircraft']['Longitude'] > 0 && Math.abs(this.points[i]['Aircraft']['Longitude'] > 150)) || 
         (lastLon > 0 && this.points[i]['Aircraft']['Longitude'] < 0 && Math.abs(this.points[i]['Aircraft']['Longitude'] < -150))) {
        wrap = true
      }
      let point = L.latLng(this.points[i]['Aircraft']['Latitude'], this.points[i]['Aircraft']['Longitude']);
      if(wrap) {
        point.lng += (point.lng < 0) ? 360 : -360
      }
      poly.push(point);
      lastLon = this.points[i]['Aircraft']['Longitude'];
    }
    let lastpoint = L.latLng(this.arrival['Latitude'], this.arrival['Longitude']);
    if(wrap) {
      lastpoint.lng += (lastpoint.lng < 0) ? 360 : -360
    }
    poly.push(lastpoint)
    this.polyline = L.polyline(poly, {color: this.color}).addTo(mymap);

    let startLoc = L.latLng(this.flight['DepartureAirport']['Latitude'], this.flight['DepartureAirport']['Longitude'])
    let stopLoc = L.latLng(this.arrival['Latitude'], this.arrival['Longitude'])
    if(wrap) {
      stopLoc.lng += (stopLoc.lng < 0) ? 360 : -360
    }
    this.marker[0] = L.marker(startLoc, {icon: takeOffIcon}).addTo(mymap);
    this.marker[1] = L.marker(stopLoc, {icon: landingIcon}).addTo(mymap);
    this.pointMarker[0] = L.circleMarker(startLoc, pointOption).addTo(mymap);
    this.pointMarker[1] = L.circleMarker(stopLoc, pointOption).addTo(mymap);

    markerLayer.addLayer(this.marker[0]);
    markerLayer.addLayer(this.marker[1]);
    circleMarkerLayer.addLayer(this.pointMarker[0]);
    circleMarkerLayer.addLayer(this.pointMarker[1]);
  }

  buildListNode() {
    let node = document.createElement('li');
    let colorBox = document.createElement('span');
    let textBox = document.createElement('span');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = this.color;
    textBox.innerText = `${this.flight['DepartureAirport']['DisplayName']} - ${this.arrival['DisplayName']}`;
    textBox.title = `${this.flight['StartTime']}`;
    textBox.setAttribute("aria-flighid", this.flight['Id']);
    node.appendChild(colorBox);
    node.appendChild(textBox);

    textBox.addEventListener("click", (evt) => {
      mymap.fitBounds(this.polyline.getBounds());
      this.drawChart();
    });

    return node;
  }

  getStartDate() {
    return this.flight['StartTime'];
  }

  drawChart() {
    resetAltSpeedChart();
    resetFuelChart();
    
    let tanksQty = this.points[0]['Aircraft']['FuelTanks'].length;
    for(let i=0; i<tanksQty; i++) {
      fuel_chart.data.datasets.push({
        label: `Fuel tank #${i} (%)`,
        backgroundColor: colors[i],
        data: [],
      })
    }

    for(let i=0; i<this.points.length; i++) {
      alt_and_speed_chart.data.labels.push(this.points[i]['Aircraft']['FSTime']);
      fuel_chart.data.labels.push(this.points[i]['Aircraft']['FSTime']);
      
      alt_and_speed_chart.data.datasets[0].data.push(Math.round(this.points[i]['Aircraft']['Altitude']));
      alt_and_speed_chart.data.datasets[1].data.push(Math.round(this.points[i]['Aircraft']['GroundSpeed']));

      for(let j=0; j<tanksQty; j++) {
        fuel_chart.data.datasets[j].data.push(Math.round(this.points[i]['Aircraft']['FuelTanks'][j]['PercentFuel']));
      }
    }

    alt_and_speed_chart.update();
    fuel_chart.update();

    infobox_from.textContent = `${this.flight['DepartureAirport']['Name']} (${this.flight['DepartureAirport']['ICAO']})`;
    infobox_to.textContent = `${this.flight['ArrivalIntendedAirport']['Name']} (${this.flight['ArrivalIntendedAirport']['ICAO']})`;
    infobox_takeoff.textContent = this.flight['StartTime'];
    infobox_landing.textContent = this.flight['LandedTime'];
    infobox_aircraft.textContent = this.points[0]['Aircraft']['AircraftType'];
  }
}