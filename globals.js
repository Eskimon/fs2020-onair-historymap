var infobox_from = document.getElementById("from");
var infobox_to = document.getElementById("to");
var infobox_takeoff = document.getElementById("takeoff");
var infobox_landing = document.getElementById("landing");
var infobox_aircraft = document.getElementById("aircraft");

var trajlist = document.getElementById("trajList");
var charts = document.getElementById("charts");

var alt_and_speed_ctx = document.getElementById('alt_and_speed_chart');
var fuel_ctx = document.getElementById('fuel_chart');

var colors = ['#1abc9c', '#3498db', '#34495e', '#e67e22', '#e74c3c'];

var alt_and_speed_chart = null;
var fuel_chart = null;


function resetAltSpeedChart() {
  if(alt_and_speed_chart) {
    alt_and_speed_chart.destroy();
  }
  alt_and_speed_chart = new Chart(alt_and_speed_ctx, {
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
}


function resetFuelChart() {
  if(fuel_chart) {
    fuel_chart.destroy();
  }
  fuel_chart = new Chart(fuel_ctx, {
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
}