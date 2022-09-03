var map;
var roadmap;
let customMarker = './storage/marker.png'
var db_markers = {};
var stages_info = {}; //cache hit cache miss to make less server calls & on top of that save local new ex novo info (server doesnt have them yet)

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
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
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
        //drawNewStage(i, stage);
        receivedStageData.stage_index = i;
        receivedStageData.stage = stage;
        document.dispatchEvent(receivedStageData)
    }

    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds)
    //map.setZoom(map.getZoom() - 1);  //edge marker case cover
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
            Object.keys(db_markers).forEach(function (key) { // iter on markers 
                db_markers[key][1] = 0;
            });

            for (var i = 0; i < r.data.length; i++) {
                const placeId = r.data[i].placeId;
                if (db_markers[placeId] === undefined) { //non c'è ma dovrebbe esserci! lo aggiungo!
                    const latLng = new google.maps.LatLng(r.data[i].latitudine, r.data[i].longitudine);

                    let marker = new google.maps.Marker({
                        position: latLng,
                        map: map,
                        icon: customMarker,
                        visible: false,
                    });

                    db_markers[placeId] = [marker, 1]; //flag 1 = deve rimanere

                    //add event on click
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

        xhr.onload = function (event) 
        {
            const r = JSON.parse(event.target.responseText);
            if (r.ok) {
                roadmap = r.data.roadmap
                stage_index = roadmap.stages.length;
                stages_list = roadmap.stages;
                //document.getElementById("somma_totale").innerText = roadmap.durataComplessiva; MATT questo va messo
                //con lo stesso nome come fatto nel create_roadmap.js!
                //map.setZoom(2);
                roadmapCreator = r.data.user[0].username;
                document.dispatchEvent(receivedRoadmapData)
                drawObjects(stages_list);
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
    loadMapInfo(); //loads roadmap if roadmap_id != null

    var origin = { lat: 40.85, lng: 14.26 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: origin,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.HYBRID]
        },
        disableDefaultUI: true,
        mapTypeId: "hybrid",
        //mapTypeControl: false, //se aggiungiamo anche il tipo di mappa ibrida di sopra bisogna mettere questo parametro a true
        scaleControl: true,
        zoomControl: true,
        gestureHandling: "greedy",
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE
        },
        //mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    map.addListener('zoom_changed', function () {
        var zoom = map.getZoom();
        if (zoom <= minZoomForExNovoMarkers) {
            Object.keys(db_markers).forEach(function (key) { // iter on markers 
                //db_markers[key][0].setVisible(false);
                db_markers[key][0].setMap(null);
                delete db_markers[key] //remove element from dict too
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
