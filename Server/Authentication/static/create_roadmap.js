
window.onload = function () {
    check()
    initMap();

    
};

document.addEventListener('receivedUserInfo', (e) => { blurIfNotLoggedIn(user_id) }, false);

var stages_list = []; //lista degli stage
var stages_info = {}; //cache hit cache miss to make less server calls & on top of that save local new ex novo info (server doesnt have them yet)
var lastPlaceId = 0;
var durataComplessiva = 0;
var indirizzo;

function blurIfNotLoggedIn(user_id) {
    console.log(user_id)
    if (user_id == 0) {
        document.getElementById('contenuto').style.filter = 'blur(10px)'
        document.getElementById('all_page').style.overflow = 'hidden'
        document.getElementById('all_page').style.height = '100%'
        document.getElementById('all_page').style.margin = '0'
        document.getElementById('info_nolog').style.display = 'block'
        document.getElementById('contenuto').style['pointer-events'] = 'none';
    }
}

function deleteStage(toDeleteIndex) {
    //qua va il comando di rimozione del box grafico nel stages_list

    //rimozione marker dalla mappa
    //markers[toDeleteIndex].setMap(null);
    //markers.splice(toDeleteIndex, 1);
    circles[toDeleteIndex].setMap(null);
    circles.splice(toDeleteIndex, 1);

    //vanno rimosse le distanze tra A->B e B->C se viene rimosso B.

    if (toDeleteIndex == 0) {

        if (stages_list.length > 1) {
            distance_renderers[toDeleteIndex].setMap(null);
            distance_renderers.splice(toDeleteIndex, 1);
            lastPlaceId = 0
        }
    } else if (toDeleteIndex == stages_list.length - 1) {
        distance_renderers[toDeleteIndex - 1].setMap(null);
        distance_renderers.splice(toDeleteIndex - 1, 1);
        lastPlaceId = stages_list[toDeleteIndex - 1].placeId
    } else {
        distance_renderers[toDeleteIndex].setMap(null);
        distance_renderers[toDeleteIndex - 1].setMap(null);
        distance_renderers.splice(toDeleteIndex - 1, 2); //remove 2 elements!
        lastPlaceId = stages_list[toDeleteIndex - 1].placeId
        //si calcola distanza tra A->C
        requestDistance(stages_list[toDeleteIndex - 1], stages_list[toDeleteIndex + 1])
    }

    stages_list.splice(toDeleteIndex, 1); //4) eliminare istanza nella stages_list
    //tolto un elemento!
    var timeStage = parseInt(document.getElementById("durata" + toDeleteIndex).innerText)
    console.log("timestage: ", timeStage)
    document.getElementById("card" + toDeleteIndex).remove();
    document.getElementById("line" + toDeleteIndex).remove();
    document.getElementById("dot" + toDeleteIndex).remove();
    var allTime = parseInt(document.getElementById("somma_totale").innerText)
    console.log("alltime: ", allTime)
    allTime = allTime - timeStage
    document.getElementById("somma_totale").innerText = allTime
    const remainingCards = stages_list.length - toDeleteIndex;
    for (var i = 0; i < remainingCards; i++) {
        var oldIndex = toDeleteIndex + i + 1;
        var newIndex = toDeleteIndex + i;

        var element = document.getElementById("card" + oldIndex);
        var line = document.getElementById("line" + oldIndex);
        var dot = document.getElementById("dot" + oldIndex);
        var dur = document.getElementById("durata" + oldIndex);

        dur.id = "durata" + newIndex;

        element.id = "card" + newIndex;
        element.innerHTML = element.innerHTML.replace("boxclose" + oldIndex, "boxclose" + newIndex).replace("deleteStage(" + oldIndex + ")", "deleteStage(" + newIndex + ")")

        line.id = "line" + newIndex;
        dot.id = "dot" + newIndex;
        //così se scriviamo qualcosa l'istanza è preservata
    }
    stage_index--;
}

function requestDistance(marker1, marker2) {
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
            console.log(response)
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
                    },
                    suppressMarkers: true,
                    map: map,
                    preserveViewport: true
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

function submitRoadmap() {
    var isPub = 1;
    var visibilita = document.querySelector('input[name="visibilita"]:checked').value;
    if (visibilita == "Privata") {
        isPub = 0
    }
    var title = document.getElementById("titolo").value
    var description = document.getElementById("descrizione").value

    if (title == "") {
        alert("Titolo vuoto")
    }
    else if (stages_list.length < 2) {
        alert("almeno due stage")
    }
    else {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/createRoadmap', true);
        xhr.onload = function (event) {

            const r = JSON.parse(event.target.responseText);

            if (r.ok == true) {
                alert("creata la stages_list")
                //location.href = '/profile'
            }
            else if (r.ok == false) {
                alert("Problemi creazione stages_list")
            }
        }

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            titolo: title,
            descrizione: description,
            isPublic: isPub,
            stages: stages_list
        }));
    }
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
        // Listen for clicks on the map

        this.map.addListener("click", this.handleClick.bind(this));
    }
    ClickEventHandler.prototype.handleClick = function (event) {
        console.log("You clicked on: " + event.latLng);
        console.log(event)
        // If the event has a placeId, use it.
        if ("placeId" in event) { //POI
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
                indirizzo = "Indirizzo:\n\n" + place.formatted_address;
                spn.appendChild(AddressLabel);
            }
            else if (r.ok == false) {
                console.log("nodi non trovati")
                return {}
            }
        }
        xhr.send();

        //costruzione sottopagina per inserimento nodo ex novo. qui va fatto la customizzazione grafica.
        //volendo al posto di tutto ciò si può importare una pagina HTML pronta da fare a parte.

        var StageTitle = document.createElement('p');
        StageTitle.textContent = 'Stai creando un nuovo stage! Descrivilo:';

        var StageNameLabel = document.createElement('p');
        StageNameLabel.textContent = 'NOME:';

        var StageName = document.createElement('input');
        StageName.id = "stage-name";

        var StagePhotoLabel = document.createElement('p');
        StagePhotoLabel.textContent = 'PHOTO:';

        var PhotoFile = document.createElement('input');
        PhotoFile.type = "file"
        PhotoFile.id = "stage-photo";

        stage.latLng = latLng;

        var WebsiteLabel = document.createElement('p');
        WebsiteLabel.textContent = "website"

        var WebsiteElement = document.createElement('input');
        WebsiteElement.id = "website";

        var durataShow = document.createElement('p');
        durataShow.textContent = "Quanti minuti devi sostare questo nodo?"

        var durataElement = document.createElement('input');
        durataElement.id = "durata";


        var inputElement = document.createElement('input');
        inputElement.type = "submit"
        inputElement.value = "Aggiungi stage"

        spn.appendChild(StageTitle);
        spn.appendChild(StageNameLabel);
        spn.appendChild(StageName);
        spn.appendChild(StagePhotoLabel);
        spn.appendChild(PhotoFile);
        spn.appendChild(WebsiteLabel);
        spn.appendChild(WebsiteElement);
        spn.appendChild(durataShow);
        spn.appendChild(durataElement);
        spn.appendChild(inputElement);

        inputElement.addEventListener('click', function () {
            circles[stage_index] = new google.maps.Circle({
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                map,
                center: latLng,
                radius: 3,
            });

            var marker = new google.maps.Marker({ //qua va aggiustato l'evento
                position: latLng,
                map: map,
                icon: customMarker,
                visible: true,
            });

            marker.addListener("click", (e) => {
                ClickEventHandler.prototype.openAddBox(placeId, latLng);
            });


            /*Nodo ex novo*/
            stage.indirizzo = indirizzo
            stage.index = stage_index
            stage.nome = StageName.value;
            stage.durata = parseInt(durataElement.value);
            stage.placeId = placeId;
            stage.fotoURL = PhotoFile.value;
            stage.latitudine = latLng.lat();
            stage.longitudine = latLng.lng();

            stages_info[placeId] = stage;

            to_send_stage.placeId = stage.placeId;
            to_send_stage.titolo = stage.titolo;
            to_send_stage.fotoURL = stage.fotoURL;
            to_send_stage.website = stage.website;
            to_send_stage.durata = stage.durata;
            to_send_stage.nome = stage.nome;
            //to_send_stage.latitudine = stage.latitudine;
            //to_send_stage.longitudine = stage.longitudine;

            stages_list.push(to_send_stage)
            lastPlaceId = placeId;

            drawNewStage(stage_index, stage);

            if (stages_list.length >= 2) {
                //requestDistance(stages_list[stage_index - 1], stage);
                requestDistance(stages_list[stage_index - 1], stage);
            }

            stage_index++;

            var prec = parseInt(document.getElementById("somma_totale").innerText)
            prec = stage.durata + prec
            document.getElementById("somma_totale").innerText = prec

            infoWindow.close();
        });

        infoWindow = new google.maps.InfoWindow({
            content: spn
        });

        infoWindow.setPosition(latLng);
        infoWindow.open(map);
        return;
    };
    ClickEventHandler.prototype.openAddBox = function (placeId, latLng) {
        if (lastPlaceId == placeId) { //stesso nodo due volte di fila!
            return;
        }
        infoWindow.close();


        var stage = {}
        var to_send_stage = {}

        var durataShow = document.createElement('p');
        durataShow.textContent = "Quanti minuti devi sostare questo nodo?"
        var durataElement = document.createElement('input');
        durataElement.id = "durata";

        var inputElement = document.createElement('input');
        inputElement.type = "submit"
        inputElement.value = "Aggiungi stage"


        inputElement.addEventListener('click', function () {

            circles[stage_index] = new google.maps.Circle({
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                map,
                center: latLng,
                radius: 3,
            });

            /*Nodo gia esistente*/
            stage.durata = parseInt(durataElement.value);

            stage.placeId = placeId;
            stage.latitudine = latLng.lat();
            stage.longitudine = latLng.lng();

            //to_send_stage.latitudine = latLng.lat();
            //to_send_stage.longitudine = latLng.lng();
            to_send_stage.durata = stage.durata;
            to_send_stage.placeId = stage.placeId;

            stages_list.push(to_send_stage);
            //addToRoadmapVisual(stage);
            lastPlaceId = placeId;
            drawNewStage(stage_index, stage)


            if (stages_list.length >= 2) {
                requestDistance(stages_list[stage_index - 1], stage);
            }

            stage_index++;

            var prec = parseInt(document.getElementById("somma_totale").innerText)
            prec = stage.durata + prec
            document.getElementById("somma_totale").innerText = prec

            //me.infowindow.close();
            infoWindow.close();
        });

        var spn = document.createElement("span");

        spn.append(durataShow);
        spn.appendChild(durataElement);
        spn.appendChild(inputElement);

        if (stages_info[placeId] !== undefined) {
            stage = stages_info[placeId]
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", '/getPlaceInfo?placeId=' + placeId, true);
            xhr.onload = function (event) {
                const r = JSON.parse(event.target.responseText);
                if (r.ok == true) {
                    var place = r.data;
                    stage.nome = place.name;
                    stage.indirizzo = place.formatted_address;
                    stage.citta = place.citta;
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
                    stages_info[placeId] = stage;
                }
                else if (r.ok == false) {
                    console.log("nodi non trovati")
                    return {}
                }
            }
            xhr.send();
        }
        infoWindow = new google.maps.InfoWindow({
            content: spn
        });
        infoWindow.setPosition(latLng);
        infoWindow.open(map);
    };
    return ClickEventHandler;
}());