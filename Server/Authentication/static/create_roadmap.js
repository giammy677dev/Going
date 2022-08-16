var map;
let customMarker = './storage/markerDiego.png'
var markers = [];

// Initialize and add the map
function initMap() {
    // The location of Italy
    const italy = { lat: 40.733334, lng: 14.533333 };
    // The map, centered at Italy
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: italy,
        disableDefaultUI: true,
    });

    // The marker, positioned at Uluru
    var stages = []
    map.addListener('click', function (e) {
        console.log(e);
        if (e.placeId) { //nodo già esistente su google maps

            //stages.add({})
            //alert("already existing")
        } else {
            //alert("ex novo")
            //nodo ex novo
        }

        let marker = new google.maps.Marker({
            map: map,
            position: e.latLng,
            draggable: false
        });
    });

    /* Change markers on zoom */
    map.addListener('zoom_changed', function () {
        var zoom = map.getZoom();
        console.log(zoom)
        // iterate over markers and call setVisible
        for (var i = 0; i < markers.length; i++) {
            if (zoom <= 5) {
                markers[i].setVisible(false);
            }
            else {
                markers[i].setVisible(true);
            }
        }
    });

    // Create a <script> tag and set the USGS URL as the source.
    const script = document.createElement("script");

    // This example uses a local copy of the GeoJSON stored at
    // http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojsonp
    script.src =
        "https://developers.google.com/maps/documentation/javascript/examples/json/earthquake_GeoJSONP.js";
    document.getElementsByTagName("head")[0].appendChild(script);
}

// Loop through the results array and place a marker for each set of coordinates.
const eqfeed_callback = function (results) {
    for (let i = 0; i < results.features.length; i++) {
        const coords = results.features[i].geometry.coordinates;
        const latLng = new google.maps.LatLng(coords[1], coords[0]);

        let marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: customMarker,
            visible: false
        });

        markers.push(marker); //Aggiungo il marker all'array markers
    }
}

window.initMap = initMap;
window.eqfeed_callback = eqfeed_callback;