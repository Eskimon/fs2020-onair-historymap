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

    this.marker[0] = L.marker([this.flight['DepartureAirport']['Latitude'], this.flight['DepartureAirport']['Longitude']], {icon: takeOffIcon}).addTo(mymap);
    this.marker[1] = L.marker([this.arrival['Latitude'], this.arrival['Longitude']], {icon: landingIcon}).addTo(mymap);
    this.pointMarker[0] = L.circleMarker([this.flight['DepartureAirport']['Latitude'], this.flight['DepartureAirport']['Longitude']], pointOption).addTo(mymap);
    this.pointMarker[1] = L.circleMarker([this.arrival['Latitude'], this.arrival['Longitude']], pointOption).addTo(mymap);

    markerLayer.addLayer(this.marker[0]);
    markerLayer.addLayer(this.marker[1]);
    circleMarkerLayer.addLayer(this.pointMarker[0]);
    circleMarkerLayer.addLayer(this.pointMarker[1]);

    let poly = [[this.flight['DepartureAirport']['Latitude'], this.flight['DepartureAirport']['Longitude']]];
    for(let i=0; i < this.points.length; i++) {
      poly.push([this.points[i]['Aircraft']['Latitude'], this.points[i]['Aircraft']['Longitude']]);
    }
    poly.push([this.arrival['Latitude'], this.arrival['Longitude']]);
    this.polyline = L.polyline(poly, {color: this.color}).addTo(mymap);
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
    // Remove old dataset
    alt_and_speed_chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    alt_and_speed_chart.data.labels = [];
    // Remove old dataset
    fuel_chart.data.datasets = [];
    fuel_chart.data.labels = [];
    
    let tanksQty = this.points[0]['Aircraft']['FuelTanks'].length;
    for(let i=0; i<tanksQty; i++) {
      fuel_chart.data.datasets.push({
        label: `Fuel tank #${i}`,
        backgroundColor: colors[i],
        data: [],
      })
    }

    for(let i=0; i<this.points.length; i++) {
      alt_and_speed_chart.data.labels.push(i);
      alt_and_speed_chart.data.datasets[0].data.push(this.points[i]['Aircraft']['Altitude']);
      alt_and_speed_chart.data.datasets[1].data.push(this.points[i]['Aircraft']['GroundSpeed']);

      fuel_chart.data.labels.push(i);
      for(let j=0; j<tanksQty; j++) {
        fuel_chart.data.datasets[j].data.push(this.points[i]['Aircraft']['FuelTanks'][j]['PercentFuel'] / tanksQty);
      }
    }

    alt_and_speed_chart.update();
    fuel_chart.update();
  }
}