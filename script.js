var trajHash = {}
var trajlist = document.getElementById("trajList");
var charts = document.getElementById("charts");

document.getElementById("inputTraj").addEventListener("change", handleFiles, false);
document.getElementById("interface").addEventListener("change", updateInterface, false);
document.getElementById("chart_handle").addEventListener("click", () => {
  charts.classList.toggle("hidden");
}, false);

var colors = ['#1abc9c', '#3498db', '#34495e', '#e67e22', '#e74c3c'];

var alt_and_speed_ctx = document.getElementById('alt_and_speed_chart');
var alt_and_speed_chart = new Chart(alt_and_speed_ctx, {
  type: 'line',
  data: {
    datasets: [{
      label: 'Altitude (Ft.)',
      backgroundColor: '#e74c3c',
      borderColor: '#e74c3c',
      data: [],
      fill: false,
      yAxisID: 'y-axis-alt',
      pointRadius: 1,
    }, {
      label: 'Ground speed (Kts)',
      fill: false,
      backgroundColor: '#3498db',
      borderColor: '#3498db',
      data: [],
      yAxisID: 'y-axis-speed',
      pointRadius: 1,
    }]
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: 'Altitude and speed'
    },
    scales: {
      xAxes: [{
        display: true,
        type: 'time',
        time: {
          minUnit: 'minute',
          unit: 'minute',
          displayFormats: {
            minute: 'kk:mm'
          }
        }
      }],
      yAxes: [{
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        position: 'left',
        id: 'y-axis-alt',
        ticks: {
          suggestedMin: 0,
        }
      }, {
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        position: 'right',
        id: 'y-axis-speed',
        suggestedMin: 0,
        // grid line settings
        gridLines: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      }],
    }
  }
});

var fuel_ctx = document.getElementById('fuel_chart');
var fuel_chart = new Chart(fuel_ctx, {
  type: 'bar',

  options: {
    title: {
      display: true,
      text: 'Fuel total'
    },
    responsive: true,
    scales: {
      xAxes: [{
        stacked: true,
        display: false,
        // type: 'time',
        time: {
          minUnit: 'minute',
          //   unit: 'minute',
          //   displayFormats: {
          //     minute: 'kk:mm'
          //   }
        }
      }],
      yAxes: [{
        title: "Total (%)",
        stacked: true,
        ticks: {
          min: 0,
        }
      }]
    }
  }
});

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
