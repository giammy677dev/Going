
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
            //TRAVEL MODE dipende dal campo roadmap.travelMode ancora da aggiungere nel db
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
        drawNewStage(i, stage);

    }

    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds)
    //map.setZoom(map.getZoom() - 1);  //edge marker case cover

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
                        ClickEventHandler.prototype.openAddBox(placeId, latLng);
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

function loadFromForkIfNeeded() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('roadmap_id')

    if (id != null && id >= 0) {
        id_rm = id
        var xhr = new XMLHttpRequest();
        xhr.open("GET", '/viewrm?id=' + id, true);

        xhr.onload = function (event) {
            const r = JSON.parse(event.target.responseText);
            if (r.ok) {
                roadmap = r.data.roadmap
                stage_index = roadmap.stages.length;
                stages_list = roadmap.stages;
                document.getElementById("somma_totale").innerText = roadmap.durataComplessiva;
                //map.setCenter(latLng);
                map.setZoom(16);
                drawObjects(stages_list);
            }
        }
        xhr.send()
    }
}


function drawNewStage(stage_index, stage) {
    document.getElementById('lines').innerHTML += '<div class="dot" id="dot' + stage_index + '"></div><div class="line" id="line' + stage_index + '"></div>'
    document.getElementById('cards').innerHTML += '<div class="card" id="card' + stage_index + '"> <a class="boxclose" id="boxclose' + stage_index + '" onclick="deleteStage(' + stage_index + ')"">x</a><h4>' + stage.nome + '</h4><p>' + stage.indirizzo + ' con durata di visita: <div id="durata' + stage_index + '">' + stage.durata + '</div></p></div>'
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