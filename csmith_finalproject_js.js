// Create Map Object

var map = L.map("map", { center: [39.981192, -75.155399], zoom: 10 });
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);

var mbAttr =
    'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  mbUrl =
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";

var grayscale = L.tileLayer(mbUrl, {
    id: "mapbox/light-v9",
    tileSize: 512,
    zoomOffset: -1,
    attribution: mbAttr,
  }),
  streets = L.tileLayer(mbUrl, {
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    attribution: mbAttr,
  });

var baseMaps = {
  grayscale: grayscale,
  streets: streets,
};

// load GeoJSON from an API
var neighborhoodsLayer = null;
$.getJSON("cartogram_food_gun.geojson", function (data) {
  neighborhoodsLayer = L.geoJson(data, {
    style: styleFunc,
    onEachFeature: onEachFeature,
  }).addTo(map);
  var overlayLayer = {
    cartogram_food_gun: neighborhoodsLayer,
  };

  L.control.layers(baseMaps, overlayLayer).addTo(map);
});

// Set style function that sets fill color property equal to blood lead
function styleFunc(feature) {
  return {
    fillColor: setColorFunc(feature.properties.shtng_r),
    fillOpacity: 0.9,
    weight: 1,
    opacity: 1,
    color: "#ffffff",
    dashArray: "3",
  };
}

// Set function for color ramp
function setColorFunc(density) {
  return density > 86
    ? "#08519c"
    : density > 28
    ? "#3182bd"
    : density > 16
    ? "#6baed6"
    : density > 6.21
    ? "#bdd7e7"
    : density > 0
    ? "#eff3ff"
    : "#BFBCBB";
}

// Now we’ll use the onEachFeature option to add the listeners on our state layers:
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomFeature,
  });
  layer.bindPopup(
    "Shooting Rate Per 1000 Population: " + feature.properties.shtng_r
  );
}

// Now let’s make the states highlighted visually in some way when they are hovered with a mouse. First we’ll define an event listener for layer mouseover event:
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7,
  });
  // for different web browsers
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

// Define what happens on mouseout:
function resetHighlight(e) {
  neighborhoodsLayer.resetStyle(e.target);
}

// As an additional touch, let’s define a click listener that zooms to the state:
function zoomFeature(e) {
  console.log(e.target.getBounds());
  map.fitBounds(e.target.getBounds().pad(1.5));
}

// Create Leaflet Control Object for Legend
var legend = L.control({ position: "bottomright" });

// Function that runs when legend is added to map
legend.onAdd = function (map) {
  // Create Div Element and Populate it with HTML
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<b>Shooting Victim Rate Per 1000 Population</b><br />";
  div.innerHTML += "by census tract<br />";
  div.innerHTML += "<br>";
  div.innerHTML += '<i style="background: #08519c"></i><p>50.33 - 86</p>';
  div.innerHTML += '<i style="background: #3182bd"></i><p>28.81 - 50.32</p>';
  div.innerHTML += '<i style="background: #6baed6"></i><p>16.20 - 28.80</p>';
  div.innerHTML += '<i style="background: #bdd7e7"></i><p>6.21 - 16.19</p>';
  div.innerHTML += '<i style="background: #eff3ff"></i><p>0.00 - 6.20</p>';
  div.innerHTML += "<hr>";
  div.innerHTML += '<i style="background: #BFBCBB"></i><p>No Data</p>';

  // Return the Legend div containing the HTML content
  return div;
};

// Add Legend to Map
legend.addTo(map);
