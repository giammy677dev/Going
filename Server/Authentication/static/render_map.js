
var map;
var roadmap;
let customMarker = './storage/marker.png'
var db_markers = {};

var stage_index = 0;
var infoWindow;
var circles = [];
var distance_renderers = [];

const minZoomForExNovoMarkers = 15;

function richiestaRoadmap(id) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/viewrm?id=' + id, true);

    xhr.onload = function (event) {
        const r = JSON.parse(event.target.responseText);
        if (r.ok) {
            //cover all visible markers here: https://stackoverflow.com/questions/19304574/center-set-zoom-of-map-to-cover-all-visible-markers
            roadmap = r.data.roadmap
            const stage = roadmap.stages[0];
            const latLng = new google.maps.LatLng(stage.latitudine, stage.longitudine);
            console.log(stage)
            //map.setCenter(latLng);
            map.setZoom(16);
            renderDistances(roadmap.stages);
        }
    }
    xhr.send()
}

function asPath(encodedPolyObject) {
    return google.maps.geometry.encoding.decodePath(encodedPolyObject.points);
}

function asLatLng(latLngObject) {
    return new google.maps.LatLng(latLngObject.lat, latLngObject.lng);
}

function asBounds(boundsObject) {
    return new google.maps.LatLngBounds(asLatLng(boundsObject.southwest), asLatLng(boundsObject.northeast));
}

function typecastRoutes(routes) {
    routes.forEach(function (route) {
        route.bounds = asBounds(route.bounds);
        // I don't think `overview_path` is used but it exists on the
        // response of DirectionsService.route()
        routes.overview_path = asPath(route.overview_polyline);

        route.legs.forEach(function (leg) {
            leg.start_location = asLatLng(leg.start_location);
            leg.end_location = asLatLng(leg.end_location);

            leg.steps.forEach(function (step) {
                step.start_location = asLatLng(step.start_location);
                step.end_location = asLatLng(step.end_location);
                step.path = asPath(step.polyline);
            });
        });
    });
    return routes;
}

function renderDistances(stages) {
    var stage = stages[0];
    var routeHelper;
    var minLat = stages[0].latitudine;
    var maxLat = stages[0].latitudine;
    var minLng = stages[0].longitudine;
    var maxLng = stages[0].latitudine;
    const latLng = new google.maps.LatLng(stage.latitudine, stage.longitudine);
    var bounds = new google.maps.LatLngBounds();


    for (var i = 0; i < stages.length; i++) {
        stage = stages[i];
        const latLng = new google.maps.LatLng(stage.latitudine, stage.longitudine);
        circles[stage_index] = new google.maps.Circle({
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
            routeHelper = { origin: stages[i - 1].placeId, destination: stages[i].placeId, travelMode: "WALKING" }
            //TRAVEL MODE dipende dal campo roadmap.travelMode ancora da aggiungere nel db
            distance_renderers[i] = new google.maps.DirectionsRenderer();
            distance_renderers[i].setOptions({
                directions: {
                    routes: typecastRoutes(stage.route.routes),
                    request: routeHelper
                },
                suppressMarkers: true,
                map: map,
                preserveViewport: true
            });

        }

    }
    console.log(minLat)
    console.log(minLng)
    console.log(maxLat)
    console.log(maxLng)


    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds)
    //map.setZoom(map.getZoom() - 1);  //edge marker case cover

}
function initMap() {
    var origin = { lat: 40.863269726529374, lng: 14.279279083822711 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: origin,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP] //, google.maps.MapTypeId.HYBRID] --> volendo si può aggiungere questo
        },
        disableDefaultUI: true,
        mapTypeControl: false, //se aggiungiamo anche il tipo di mappa ibrida di sopra bisogna mettere questo parametro a true
        scaleControl: true,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    map.addListener('zoom_changed', function () {
        var zoom = map.getZoom();

        if (zoom <= minZoomForExNovoMarkers) {
            Object.keys(db_markers).forEach(function (key) { // iter on markers 
                db_markers[key][0].setVisible(false);
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


    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id')
    richiestaRoadmap(id)

    new ClickEventHandler(map, origin);
}

function drawExNovoStages() {
    console.log("UPDATE MARKERS!")

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
                        ClickEventHandler.prototype.openInfoBox(placeId, latLng);
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

function isIconMouseEvent(e) {
    return "placeId" in e;
}

function drawNewStage(stage_index, stage) {
    document.getElementById('lines').innerHTML += '<div class="dot" id="dot' + stage_index + '"></div><div class="line" id="line' + stage_index + '"></div>'
    document.getElementById('cards').innerHTML += '<div class="card" id="card' + stage_index + '"> <a class="boxclose" id="boxclose' + stage_index + '" onclick="deleteStage(' + stage_index + ')"">x</a><h4>' + stage.nome + '</h4><p>' + stage.indirizzo + ' con durata di visita: <div id="durata' + stage_index + '">' + stage.durata + '</div></p></div>'
}

var ClickEventHandler = (function () {
    function ClickEventHandler(map, origin) {
        this.origin = origin;
        this.map = map;

        this.placesService = new google.maps.places.PlacesService(map);
        //this.infowindow = new google.maps.InfoWindow();
        infoWindow = new google.maps.InfoWindow();
        this.infowindowContent = document.getElementById("infowindow-content");
        //this.infowindow.setContent(this.infowindowContent);
        infoWindow.setContent("placeholder");
        // getExNovoStages(this);
        // Listen for clicks on the map

        this.map.addListener("click", this.handleClick.bind(this));
    }
    ClickEventHandler.prototype.handleClick = function (event) {
        console.log("You clicked on: " + event.latLng);
        console.log(event)
        // If the event has a placeId, use it.
        if (isIconMouseEvent(event)) { //POI
            console.log(event)
            console.log("You clicked on place:" + event.placeId);
            // Calling e.stop() on the event prevents the default info window from
            // showing.
            // If you call stop here when there is no placeId you will prevent some
            // other map click event handlers from receiving the event.
            event.stop();
            if (event.placeId) {
                this.openInfoBox(event.placeId, event.latLng);
            }
        }
    };

    ClickEventHandler.prototype.openInfoBox = function (placeId, latLng) {
        var content = ""
        for (var i = 0; i < roadmap.stages.length; i++) {
            console.log("test")
            if (roadmap.stages[i].placeId == placeId) {
                content += roadmap.stages[i].durata + "\n";
                console.log(roadmap.stages[i])
            }
        }
        infoWindow = new google.maps.InfoWindow({
            content: content
        });

        infoWindow.setPosition(latLng);
        infoWindow.open(map);

    };
    return ClickEventHandler;
}());

window.initMap = initMap;