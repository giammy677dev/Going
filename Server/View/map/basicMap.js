var map;
var roadmap;
let customMarker = './storage/marker.png'
var db_markers = {};
var stages_info = {}; 
var stage_index = 0;
var infoWindow;
var circles = [];
var distance_renderers = [];
const minZoomForExNovoMarkers = 15;
const receivedRoadmapData = new Event('receivedRoadmapData');
const receivedStageData = new Event('receivedStageData');
const dbMarkerClicked = new Event('dbMarkerClicked');

function drawObjects(stages) {
    var stage = stages[0];
    var routeHelper;
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < stages.length; i++) {
        stage = stages[i];
        const latLng = new google.maps.LatLng(stage.latitudine, stage.longitudine);
        circles[i] = new google.maps.Circle({
            strokeColor: "#007fff",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#007fff",
            fillOpacity: 0.35,
            map,
            center: latLng,
            radius: 30,
            clickable: false
        });
        bounds.extend(latLng);

        if (i != 0) {
            routeHelper = { origin: stages[i - 1].placeId, destination: stages[i].placeId, travelMode: roadmap.travelMode }
            distance_renderers[i - 1] = new google.maps.DirectionsRenderer();
            distance_renderers[i - 1].setOptions({
                directions: {
                    routes: typecastRoutes(stage.route.routes),
                    request: routeHelper
                },
                suppressMarkers: true,
                map: map,
                preserveViewport: true
            });

        }
        receivedStageData.stage_index = i;
        receivedStageData.stage = stage;
        document.dispatchEvent(receivedStageData)
    }

    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds)
}

function drawExNovoStages() {
    var boxMinLat = map.getBounds().getSouthWest().lat()
    var boxMaxLat = map.getBounds().getNorthEast().lat()
    var boxMinLng = map.getBounds().getSouthWest().lng()
    var boxMaxLng = map.getBounds().getNorthEast().lng()

    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/getMarkersFromRect', true);
    xhr.onload = function (event) {
        const r = JSON.parse(event.target.responseText);
        if (r.ok) {
            Object.keys(db_markers).forEach(function (key) { 
                db_markers[key][1] = 0;
            });

            for (var i = 0; i < r.data.length; i++) {
                const placeId = r.data[i].placeId;
                if (db_markers[placeId] === undefined) { 
                    const latLng = new google.maps.LatLng(r.data[i].latitudine, r.data[i].longitudine);

                    let marker = new google.maps.Marker({
                        position: latLng,
                        map: map,
                        icon: customMarker,
                        visible: false,
                    });

                    db_markers[placeId] = [marker, 1]; 

                    db_markers[placeId][0].addListener("click", (e) => {
                        dbMarkerClicked.placeId = placeId;
                        dbMarkerClicked.latLng = latLng;
                        document.dispatchEvent(dbMarkerClicked)
                    });
                }
                db_markers[placeId][1] = 1;

                if (db_markers[placeId][0].visible == false) {
                    db_markers[placeId][0].setVisible(true);
                }
            }

            Object.keys(db_markers).forEach(function (key) { // iter on markers 
                if (db_markers[key][1] == 0) {
                    db_markers[key][0].setMap(null);
                    delete db_markers[key] //remove element from dict too

                } else {
                    db_markers[key][0].setVisible(true);
                }
            });
        }
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        centerLatInf: boxMinLat,
        centerLatSup: boxMaxLat,
        centerLngInf: boxMinLng,
        centerLngSup: boxMaxLng
    }));
}

function loadMapInfo() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id')
    console.log(id)
    if (id != null && id >= 0) {
        roadmapId = id
        var xhr = new XMLHttpRequest();
        xhr.open("GET", '/getRoadmapData?id=' + id, true);

        xhr.onload = function (event) {
            const r = JSON.parse(event.target.responseText);
            console.log(r)
            if (r.ok == true) {
                roadmap = r.data.roadmap
                stage_index = roadmap.stages.length;
                stages_list = roadmap.stages;

                if (document.getElementById("somma_totale") != undefined) {
                    document.getElementById("somma_totale").innerText = convertHMS(roadmap.durata);
                    durataComplessiva = roadmap.durata;
                }
                roadmapCreator = r.data.user[0].username;
                document.dispatchEvent(receivedRoadmapData)
                drawObjects(stages_list);
            }
            else {
                alert("Problemi nel caricamento della Roadmap, verrai reindirizzato alla Homepage")
                location.href = '/'
            }
        }
        xhr.send()
    }
}

function getPlaceDetails(placeId) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/getPlaceInfo?placeId=' + placeId, true);
    xhr.onload = function (event) {
        const r = JSON.parse(event.target.responseText);
        if (r.ok == true) {
            console.log(r.data)
        }
        else if (r.ok == false) {
            console.log("nodi non trovati")
            return {}
        }
    }
    xhr.send();
}

function initMap() {
    loadMapInfo();

    var origin = { lat: 40.85, lng: 14.26 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: origin,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.HYBRID]
        },
        disableDefaultUI: true,
        mapTypeId: "hybrid",
        scaleControl: true,
        zoomControl: true,
        gestureHandling: "greedy",
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE
        },
    });

    map.addListener('zoom_changed', function () {
        var zoom = map.getZoom();
        if (zoom <= minZoomForExNovoMarkers) {
            Object.keys(db_markers).forEach(function (key) { 
                db_markers[key][0].setMap(null);
                delete db_markers[key] 
            });
        }
        else {
            drawExNovoStages();
        }
    });

    map.addListener('dragend', function () {
        var zoom = map.getZoom();
        console.log(zoom)
        if (zoom > minZoomForExNovoMarkers) {
            drawExNovoStages();
        }
    });

    new ClickEventHandler(map, origin);
}

function convertHMS(d) {
    d = Number(d);

    if (d < 60) {
        return "0 minuti"
    }

    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " ora " : " ore ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minuto " : " minuti ") : "";
    return hDisplay + mDisplay;
}