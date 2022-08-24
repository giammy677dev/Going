var user_id = 0
function check_now() {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", '/isLogWho', true);
    xhr.onload = function (event) {

        const r = JSON.parse(event.target.responseText);


        if (r.ok == true) {
            console.log("ok:", r.ok, "=>sei loggato!!! con questo id", r.whoLog)
            user_id = r.whoLog
        }
        else if (r.ok == false) {
            document.getElementById('contenuto').style.filter = 'blur(10px)'
            document.getElementById('all_page').style.overflow = 'hidden'
            document.getElementById('all_page').style.height = '100%'
            document.getElementById('all_page').style.margin = '0'
            document.getElementById('info_nolog').style.display = 'block'
        }
    }
    xhr.send();
}

function deleteStage(stage_index) {
    console.log("ciao stage da eliminare: ", stage_index)
}




var map;
let customMarker = './storage/marker.png'
var db_markers = [];
var roadmap = []; //lista degli stage
var markers = [];
var distance_renderers = [];
var stage_index = 0;
var rectDegree = 0.008;

function deleteStage(toDeleteIndex) {
    //qua va il comando di rimozione del box grafico nel roadmap

    //rimozione markaer dalla mappa
    markers[toDeleteIndex].setMap(null);
    markers.splice(toDeleteIndex, 1);
    //vanno rimosse le distanze tra A->B e B->C se viene rimosso B.
    if (toDeleteIndex == 0) {
        if (roadmap.length > 1) {
            distance_renderers[toDeleteIndex].setMap(null);
            distance_renderers.splice(toDeleteIndex, 1);
        }
    } else if (toDeleteIndex == roadmap.length - 1) {
        distance_renderers[toDeleteIndex - 1].setMap(null);
        distance_renderers.splice(toDeleteIndex - 1, 1);
    } else {
        distance_renderers[toDeleteIndex].setMap(null);
        distance_renderers[toDeleteIndex - 1].setMap(null);
        distance_renderers.splice(toDeleteIndex - 1, 1);
        distance_renderers.splice(toDeleteIndex, 1);
        //si calcola distanza tra A->C
        backendDistance(roadmap[toDeleteIndex - 1], roadmap[toDeleteIndex + 1])
    }
    roadmap.splice(toDeleteIndex, 1); //4) eliminare istanza nella roadmap
    //tolto un elemento!

    document.getElementById("card" + toDeleteIndex).remove();
    document.getElementById("line" + toDeleteIndex).remove();
    document.getElementById("dot" + toDeleteIndex).remove();
    const remainingCards = roadmap.length - toDeleteIndex;
    for (var i = 0; i < remainingCards; i++) {
        var oldIndex = toDeleteIndex + i + 1;
        var newIndex = toDeleteIndex + i;
        console.log(oldIndex, "diventa", newIndex)
        var element = document.getElementById("card" + oldIndex);
        var line = document.getElementById("line" + oldIndex);
        var dot = document.getElementById("dot" + oldIndex);




    roadmap.splice(stage_index, 1); //4) eliminare istanza nella roadmap
    //tolto un elemento!
=======
    if (toDeleteIndex == 0) {
        if (roadmap.length > 1) {
            distance_renderers[toDeleteIndex].setMap(null);
            distance_renderers.splice(toDeleteIndex, 1);
        }
    } else if (toDeleteIndex == roadmap.length - 1) {
        distance_renderers[toDeleteIndex - 1].setMap(null);
        distance_renderers.splice(toDeleteIndex - 1, 1);
    } else {
        distance_renderers[toDeleteIndex].setMap(null);
        distance_renderers[toDeleteIndex - 1].setMap(null);
        distance_renderers.splice(toDeleteIndex - 1, 1);
        distance_renderers.splice(toDeleteIndex, 1);
        //si calcola distanza tra A->C
        backendDistance(roadmap[toDeleteIndex - 1], roadmap[toDeleteIndex + 1])
    }
    roadmap.splice(toDeleteIndex, 1); //4) eliminare istanza nella roadmap
    //tolto un elemento!

    document.getElementById("card" + toDeleteIndex).remove();
    document.getElementById("line" + toDeleteIndex).remove();
    document.getElementById("dot" + toDeleteIndex).remove();
    const remainingCards = roadmap.length - toDeleteIndex;
    for (var i = 0; i < remainingCards; i++) {
        var oldIndex = toDeleteIndex + i + 1;
        var newIndex = toDeleteIndex + i;
        console.log(oldIndex, "diventa", newIndex)
        var element = document.getElementById("card" + oldIndex);
        var line = document.getElementById("line" + oldIndex);
        var dot = document.getElementById("dot" + oldIndex);

        element.id = "card" + newIndex;
        element.innerHTML = element.innerHTML.replace("boxclose" + oldIndex, "boxclose" + newIndex).replace("deleteStage(" + oldIndex + ")", "deleteStage(" + newIndex + ")")
        
        
        line.id = "line"+ newIndex;
        dot.id = "dot"+ newIndex; //così se scriviamo qualcosa l'istanza è preservata
    }
    console.log(toDeleteIndex)

    stage_index--;
>>>>>>> f3b7958292c008e409af1b717903d3ea980644ec
    console.log(roadmap)
}


function initMap() {
    var origin = { lat: 40.85, lng: 14.26 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5,
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


    document.getElementById("submit_btn").addEventListener('click', function () {
        submitRoadmap(roadmap);
    });

    map.addListener('zoom_changed', function () {
        var zoom = map.getZoom();

        if (zoom <= 15) {
            for (var i = 0; i < db_markers.length; i++) {
                db_markers[i].setVisible(false);
            }
        }
        else {
            drawExNovoStages();
        }
    });

    map.addListener('dragend', function () {
        map.addListener('idle', function () {
            drawExNovoStages();
        });
    });

    new ClickEventHandler(map, origin);
}

function drawExNovoStages() {
    var centerLatInf = map.getCenter().lat() - rectDegree;
    var centerLatSup = map.getCenter().lat() + rectDegree;
    var centerLngInf = map.getCenter().lng() - rectDegree;
    var centerLngSup = map.getCenter().lng() + rectDegree;
    var zoom = map.getZoom();
    console.log(zoom)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/getMarkersFromRect', true);
    xhr.onload = function (event) {
        const r = JSON.parse(event.target.responseText);

        if (r.ok == true) {
            var old_db_markers = [];
            old_db_markers.push(...db_markers);
            db_markers = [];

            if (zoom > 15 && r.data.length > 0) {
                for (var i = 0; i < r.data.length; i++) {
                    var j = 0;
                    var trovato = false;
                    while (trovato != true && j < old_db_markers.length) {
                        if (r.data[i].placeId == old_db_markers[j].placeId) {
                            db_markers.push(old_db_markers[j]);
                            old_db_markers[j].pop();
                            trovato = true;
                        }
                        j++;
                    }

                    if (trovato == false) {
                        const latLng = new google.maps.LatLng(r.data[i].latitudine, r.data[i].longitudine);

                        let marker = new google.maps.Marker({
                            position: latLng,
                            map: map,
                            icon: customMarker,
                            visible: true,
                        });

                        db_markers.push(marker);
                    }
                }

                for (var j = 0; j < old_db_markers.length; j++) {
                    old_db_markers[j].setMap(null);
                }
            }
        }
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        centerLatInf: centerLatInf,
        centerLatSup: centerLatSup,
        centerLngInf: centerLngInf,
        centerLngSup: centerLngSup
    }));
}

function getDistance(marker, centerLat, centerLng) {
    var centerLatlng = new google.maps.LatLng(centerLat, centerLng);
    distance = google.maps.geometry.spherical.computeDistanceBetween(marker.position, centerLatlng)
    return distance;
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

/*function getExNovoStages(t) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/getExNovoStages', true);
    xhr.onload = function (event) {
        const r = JSON.parse(event.target.responseText);
        console.log(r)
        if (r.ok == true) {
            drawExNovoStages(r.data, t) //chiama la funzione per disegnare i nodi ex novo già caricati nel DB
        }
        else if (r.ok == false) {
            console.log("Nodi non trovati")
        }
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(null);
}*/

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

/* Loop through the results array and place a marker for each set of coordinates.
function drawExNovoStages(results, t) {
    for (let i = 0; i < results.length; i++) {
        const latitudine = results[i].latitudine;
        const longitudine = results[i].longitudine;
        const placeId = results[i].placeId;
        const latLng = new google.maps.LatLng(latitudine, longitudine);

        let marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: customMarker,
            visible: false
        });

        t.latLng = latLng;
        t.placeId = placeId;
        t.ExistingNode = true;
        //marker.addListener("click", t.handleClick.bind(this));
        marker.addListener("click", () => { console.log(results[i]) })
        //marker.addListener("click", console.log(results).bind(this));
        db_markers.push(marker); //Aggiungo il marker all'array markers
    }
}*/

function backendDistance(marker1, marker2) {

    //CI DEVE ESSERE UNA MODALITA' PER OGNI COPPIA DI NODI?

    var selectedMode;
    if (document.getElementById("driving_mode").checked) {
        selectedMode = document.getElementById("driving_mode").value;
    }
    else {
        selectedMode = document.getElementById("walking_mode").value;
    }
    console.log('Modalità: ' + selectedMode);

    const route = {
        origin: marker1.placeId,
        destination: marker2.placeId,
        travelMode: selectedMode
    }


    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/getRoute', true);
    xhr.onload = function (event) {
        const r = JSON.parse(event.target.responseText);
        console.log(r)
        if (r.ok == true) {
            const response = r.data;
            const status = response.status;
            if (status !== 'OK') {
                window.alert('Directions request failed due to ' + status);
                return;
            } else {
                distance_renderers[stage_index - 2] = new google.maps.DirectionsRenderer();
                distance_renderers[stage_index - 2].setOptions({
                    directions: {
                        routes: typecastRoutes(response.routes),
                        // "ub" is important and not returned by web service it's an
                        // object containing "origin", "destination" and "travelMode"
                        request: route
                    },*/
                    map: map
                });
            }
        }
        else if (r.ok == false) {
            alert("Nodi non trovati")
        }
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(route));
}

function calculateDistance(first_marker, second_marker) {
    var selectedMode;
    if (document.getElementById("driving_mode").checked) {
        selectedMode = document.getElementById("driving_mode").value;
    }
    else {
        selectedMode = document.getElementById("walking_mode").value;
    }
    console.log('Modalità: ' + selectedMode);

    let directionsService = new google.maps.DirectionsService();
    let directionsRenderer = new google.maps.DirectionsRenderer();
    console.log(directionsRenderer)
    directionsRenderer.setMap(map); // Existing map object displays directions
    // Create route from existing points used for markers
    const route = {
        origin: { lat: first_marker.latitudine, lng: first_marker.longitudine },
        destination: { lat: second_marker.latitudine, lng: second_marker.longitudine },
        travelMode: selectedMode //c'era 'DRIVING', cambia se vogliamo fare la modalità diverse (a piedi, in macchina, ecc..)
    }


    directionsService.route(route,
        function (response, status) { // anonymous function to capture directions
            console.log('STATUS: ' + status)
            if (status !== 'OK') {
                window.alert('Directions request failed due to ' + status);
                return;
            } else {
                console.log(response)
                directionsRenderer.setDirections(response); // Add route to the map
                var directionsData = response.routes[0].legs[0]; // Get data about the mapped route
                if (!directionsData) {
                    window.alert('Directions request failed');
                    return;
                }
                else {
                    //TO-DO: Dobbiamo aggiungere la durata
                    //document.getElementById('msg').innerHTML += " Driving distance is " + directionsData.distance.text + " (" + directionsData.duration.text + ").";
                }
            }
        });
}

function isIconMouseEvent(e) {
    return "placeId" in e;
}

function drawNewStage(stage_index, stage) {
    document.getElementById('lines').innerHTML += '<div class="dot" id="dot' + stage_index + '"></div><div class="line" id="line' + stage_index + '"></div>'
    document.getElementById('cards').innerHTML += '<div class="card" id="card' + stage_index + '"> <a class="boxclose" id="boxclose' + stage_index + '" onclick="deleteStage(' + stage_index + ')"">x</a><h4>' + stage.nome + '</h4><p>' + stage.indirizzo + ' con durata di visita: ' + stage.durata + '</p></div>'
}

var ClickEventHandler = /** @class */ (function () {
    function ClickEventHandler(map, origin) {
        this.origin = origin;
        this.map = map;

        this.placesService = new google.maps.places.PlacesService(map);
        this.infowindow = new google.maps.InfoWindow();
        this.infowindowContent = document.getElementById("infowindow-content");
        this.infowindow.setContent(this.infowindowContent);
        //getExNovoStages(this);
        // Listen for clicks on the map.
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
                this.openAddBox(event.placeId, event.latLng);
            }
        }
        else {
            this.openCreateBox(event.latLng); //ex novo node
        }
    };
    ClickEventHandler.prototype.openCreateBox = function (latLng) {
        var me = this;
        me.infowindow.close();
        var stage = {}
        var to_send_stage = {}

        var spn = document.createElement("span");
        var placeId;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", '/getPlaceFromCoords?lat=' + latLng.lat() + "&lng=" + latLng.lng(), true);
        xhr.onload = function (event) {
            const r = JSON.parse(event.target.responseText);
            if (r.ok == true) {
                var place = r.data;
                placeId = place.place_id;
                var AddressLabel = document.createElement('p');
                AddressLabel.textContent = "Indirizzo:\n\n" + place.formatted_address;
                spn.appendChild(AddressLabel);
            }
            else if (r.ok == false) {
                console.log("nodi non trovati")
                return {}
            }
        }

        xhr.send();
        var StageTitle = document.createElement('p');
        StageTitle.textContent = 'Stai creando un nuovo stage! Descrivilo:';
        spn.appendChild(StageTitle);

        var StageNameLabel = document.createElement('p');
        StageNameLabel.textContent = 'NOME:';
        spn.appendChild(StageNameLabel);
        var StageName = document.createElement('input');
        StageName.id = "stage-name";
        spn.appendChild(StageName);

        var StagePhotoLabel = document.createElement('p');
        StagePhotoLabel.textContent = 'PHOTO:';
        spn.appendChild(StagePhotoLabel);
        var PhotoFile = document.createElement('input');
        PhotoFile.type = "file"
        PhotoFile.id = "stage-photo";
        spn.appendChild(PhotoFile);

        stage.place_id = -1;
        stage.latLng = latLng;

        var WebsiteLabel = document.createElement('p');
        WebsiteLabel.textContent = "website"
        spn.appendChild(WebsiteLabel);
        var WebsiteElement = document.createElement('input');
        WebsiteElement.id = "website";
        spn.appendChild(WebsiteElement);

        var durataShow = document.createElement('p');
        durataShow.textContent = "Quanti minuti devi sostare questo nodo?"
        spn.appendChild(durataShow);
        var durataElement = document.createElement('input');
        durataElement.id = "durata";
        spn.appendChild(durataElement);

        var desLabel = document.createElement('p');
        desLabel.textContent = "descrizione (opzionale)"
        spn.appendChild(desLabel);

        var descrElement = document.createElement('input');
        descrElement.id = "descrizione";
        descrElement.value = " "
        spn.appendChild(descrElement);

        var inputElement = document.createElement('input');
        inputElement.type = "submit"
        inputElement.value = "Aggiungi stage"
        spn.appendChild(inputElement);

        markers[stage_index] = new google.maps.Marker({
            position: latLng,
            map: this.map,
            title: "#",
            visible: false
        });

        markers[stage_index].addListener("click", () => {
            console.log("test")
            console.log(stage_index)
            console.log(markers)
            markers[stage_index].setVisible(false);
        });

        inputElement.addEventListener('click', function () {
            markers[stage_index].setVisible(true);
            markers[stage_index].setTitle(StageName.value)

            /*Nodo ex novo*/
            stage.index = stage_index
            stage.nome = StageName.value;
            stage.durata = parseInt(durataElement.value);
            stage.descrizione = descrElement.value
            stage.placeId = placeId;
            stage.fotoURL = PhotoFile.value;
            stage.latitudine = latLng.lat();
            stage.longitudine = latLng.lng();
            to_send_stage.placeId = stage.placeId;
            to_send_stage.descrizione = stage.descrizione;
            to_send_stage.titolo = stage.titolo;
            to_send_stage.fotoURL = stage.fotoURL;
            to_send_stage.website = stage.website;
            to_send_stage.durata = stage.durata;
            to_send_stage.nome = stage.nome;
            to_send_stage.latitudine = latLng.lat();
            to_send_stage.longitudine = latLng.lng();
            roadmap.push(to_send_stage)


            //addToRoadmapVisual(stage); // -1 = placeholder di UUID da fare
            document.getElementById('lines').innerHTML += '<div class="dot"></div><div class="line"></div>'
            document.getElementById('cards').innerHTML += '<div class="card"> <a class="boxclose" id="boxclose'+stage_index+'" onclick="deleteStage('+stage_index+')"">x</a><h4>' + stage.nome + '</h4><p>' +stage.indirizzo+' con durata di visita: '+stage.durata + '</p></div>'

            if (roadmap.length >= 2) {
                //calculateDistance(roadmap[stage_index - 1], stage);
                backendDistance(roadmap[stage_index - 1], stage);
            }

            stage_index++;

            var prec = parseInt(document.getElementById("somma_totale").innerText)
            prec = stage.durata + prec
            document.getElementById("somma_totale").innerText = prec

            me.infowindow.close();
        });

        me.infowindow = new google.maps.InfoWindow({
            content: spn
        });

        me.infowindow.setPosition(latLng);
        me.infowindow.open(me.map);
        return;
    };
    ClickEventHandler.prototype.openAddBox = function (placeId, latLng) {
        var me = this;
        me.infowindow.close();

        var stage = {}
        var to_send_stage = {}

        var durataShow = document.createElement('p');
        durataShow.textContent = "Quanti minuti devi sostare questo nodo?"
        var durataElement = document.createElement('input');
        durataElement.id = "durata";

        var desShow = document.createElement('p');
        desShow.textContent = "descrizione (opzionale)"
        var desElement = document.createElement('input');
        desElement.id = "descrizone";
        desElement.value = " "

        var inputElement = document.createElement('input');
        inputElement.type = "submit"
        inputElement.value = "Aggiungi stage"

        markers[stage_index] = new google.maps.Marker({
            position: latLng,
            map: this.map,
            title: "#",
            visible: false
        });

        inputElement.addEventListener('click', function () {
            markers[stage_index].setVisible(true);
            markers[stage_index].setTitle(stage.nome)

            /*Nodo gia esistente*/
            stage.durata = parseInt(durataElement.value);
            to_send_stage.durata = stage.durata;
            stage.placeId = placeId;
            to_send_stage.placeId = stage.placeId;
            stage.descrizione = desElement.value
            to_send_stage.descrizione = stage.descrizione;
            stage.latitudine = latLng.lat();
            stage.longitudine = latLng.lng();
            to_send_stage.latitudine = latLng.lat();
            to_send_stage.longitudine = latLng.lng();

            console.log(stage)
            roadmap.push(to_send_stage);
            //addToRoadmapVisual(stage);
            document.getElementById('lines').innerHTML += '<div class="dot"></div><div class="line"></div>'
            document.getElementById('cards').innerHTML += '<div class="card"> <a class="boxclose" id="boxclose'+stage_index+'" onclick="deleteStage('+stage_index+')"">x</a><h4>' + stage.nome + '</h4><p>' +stage.indirizzo+' con durata di visita: '+stage.durata + '</p></div>'

            if (roadmap.length >= 2) {
                //calculateDistance(roadmap[stage_index - 1], stage);
                backendDistance(roadmap[stage_index - 1], stage);
            }

            stage_index++;

            var prec = parseInt(document.getElementById("somma_totale").innerText)
            prec = stage.durata + prec
            document.getElementById("somma_totale").innerText = prec

            me.infowindow.close();
        });

        var spn = document.createElement("span");

        spn.append(durataShow);
        spn.appendChild(durataElement);
        spn.append(desShow);
        spn.appendChild(desElement);
        spn.appendChild(inputElement);

        console.log(placeId)

        var xhr = new XMLHttpRequest();
        xhr.open("GET", '/getPlaceInfo?placeId=' + placeId, true);
        xhr.onload = function (event) {
            const r = JSON.parse(event.target.responseText);
            if (r.ok == true) {
                var place = r.data;
                stage.nome = place.name;
                stage.indirizzo = place.formatted_address;
                //stage.citta = place.address_components[2].long_name
                if (place.website !== undefined) {
                    stage.website = place.website;
                }
                else {
                    stage.website = null
                }
                if (place.foto !== undefined) {
                    stage.fotoURL = place.fotoURL
                }
                else {
                    stage.fotoURL = null
                }

                console.log(r.data)
            }
            else if (r.ok == false) {
                console.log("nodi non trovati")
                return {}
            }
        }
        xhr.send();

        me.infowindow = new google.maps.InfoWindow({
            content: spn
            //content: "Sei sicuro di voler aggiungere questo nodo? <br>DURATA: <input id=\"durata\"></input><br><button onclick=\"addToRoadmap('placeId')\" type=\"button\">AGGIUNGI</button>"
        });

        me.infowindow.setPosition(latLng);
        me.infowindow.open(me.map);
    };
    return ClickEventHandler;
}());

window.initMap = initMap;