// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const MIN_RADIUS = 2;
const RADIUS_COEF = 3;
const COLOR_DEPTHS = [10, 30, 50, 70, 90];
const COLOR_COLORS = ['#ffd700', '#40e900', '#00a500', '#e36c18', '#ff0000', '#750000']

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  //console.log(data);
  createFeatures(data.features);
  // createFeatures(data.features.slice(0,100));
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
       layer.bindPopup(`<h4>Epicenter:</h4><p>${feature.properties.place} <p>[${feature.geometry.coordinates[0]},${feature.geometry.coordinates[1]}]</p></p><hr>Magnitude:  ${feature.properties.mag}<p>Depth:  ${feature.geometry.coordinates[2]}km</p><hr><p>${new Date(feature.properties.time)}</p>`);
  }
  function pointToLayer(feature, latlng){
    return L.circleMarker(latlng);
  }
  function style(feature){
    function get_radius(feature){
      let magnitude = feature.properties.mag;
      let radius = Math.max(MIN_RADIUS, magnitude*RADIUS_COEF);
      return radius;
    }

    function get_color(feature){
      let depth = feature.geometry.coordinates[2];
     
      let color = '';
      if (depth < COLOR_DEPTHS[0]){
        color = COLOR_COLORS[0];
      }  else if (depth < COLOR_DEPTHS[1]){
        color = COLOR_COLORS[1];
      } else if (depth <  COLOR_DEPTHS[2]){
        color = COLOR_COLORS[2];
      } else if (depth < COLOR_DEPTHS[3]){
        color = COLOR_COLORS[3];
      } else if (depth < COLOR_DEPTHS[4]){
        color = COLOR_COLORS[4];
      }else {
        color = COLOR_COLORS[5];
      }
      //console.log(color);
      return color;
    }

    let style_dict = {
      opacity: 0.3,
      color: '#0073cc', //border
      fillOpacity: 0.65, 
      fillColor: get_color(feature),
      radius: get_radius(feature)
    }
    return style_dict;
  }
  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer,
    style: style

  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
        41.2524, -95.9980
    ],
    zoom: 3.5,
    layers: [street, earthquakes]
    
  });
  createLegend(myMap);
}

function createLegend(map){
  let legend = L.control({
    position: 'bottomright'
  });

  function build_legend(){
    let div = L.DomUtil.create('div', 'info legend');
    labels = ['Earthquake Depth'];
    for (var i = 0; i < COLOR_DEPTHS.length; i++) {
      div.innerHTML += 
      labels.push(
          '<i style="background:' + COLOR_COLORS[i] + '"> Depth < </i> ' + 
      (COLOR_COLORS[i] ? COLOR_DEPTHS[i] : '+' ) + 'km');

  }
    div.innerHTML = labels.join('<br>');
    return div;
  }

  legend.onAdd = build_legend;
  legend.addTo(map);
}
