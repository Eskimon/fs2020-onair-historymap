var trajHash = {}

document.getElementById("inputTraj").addEventListener("change", handleFiles, false);
document.getElementById("interface").addEventListener("change", updateInterface, false);
document.getElementById("chart_handle").addEventListener("click", () => {
  charts.classList.toggle("hidden");
}, false);

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
