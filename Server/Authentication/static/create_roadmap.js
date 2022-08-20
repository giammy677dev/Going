var map;
let customMarker = './storage/markerDiego.png'
var db_markers = [];

function initMap() {
    var origin = { lat: 40.85, lng: 14.26 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 18,
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

    var submitBtn = document.createElement('input');
    submitBtn.type = "submit"
    submitBtn.value = "Conferma creazione"
    submitBtn.addEventListener('click', function () {
        submitRoadmap(roadmap);
    });
    document.getElementById('submit_btn').appendChild(submitBtn);

    map.addListener('zoom_changed', function () {
        var zoom = map.getZoom();
        console.log(zoom)
        // iterate over markers and call setVisible
        for (var i = 0; i < db_markers.length; i++) {
            if (zoom <= 5) {
                db_markers[i].setVisible(false);
            }
            else {
                db_markers[i].setVisible(true);
            }
        }
    });

    //getExNovoStages(); //chiama la funzione per disegnare i nodi ex novo già caricati nel DB
    new ClickEventHandler(map, origin);
}

function getExNovoStages(t) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/getExNovoStages', true);
    xhr.onload = function (event) {
        const r = JSON.parse(event.target.responseText);
        console.log(r)
        if (r.ok == true) {
            drawExNovoStages(r.data,t) //chiama la funzione per disegnare i nodi ex novo già caricati nel DB
        }
        else if (r.ok == false) {
            alert("Nodi non trovati")
        }
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(null);
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

// Loop through the results array and place a marker for each set of coordinates.
function drawExNovoStages(results,t) {
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
        t.ExistingNode=true;
        //marker.addListener("click", t.handleClick.bind(this));
        marker.addListener("click", () => { console.log(results[i])})
        //marker.addListener("click", console.log(results).bind(this));
        db_markers.push(marker); //Aggiungo il marker all'array markers
    }
}

function isIconMouseEvent(e) {
    return "placeId" in e;
}
var roadmap = []; //lista degli stage
var markers = [];
var stage_index = 0;

var ClickEventHandler = /** @class */ (function () {
    function ClickEventHandler(map, origin) {
        this.origin = origin;
        this.map = map;
        //this.directionsService = new google.maps.DirectionsService();
        //this.directionsRenderer = new google.maps.DirectionsRenderer();
        //this.directionsRenderer.setMap(map);
        this.placesService = new google.maps.places.PlacesService(map);
        this.infowindow = new google.maps.InfoWindow();
        this.infowindowContent = document.getElementById("infowindow-content");
        this.infowindow.setContent(this.infowindowContent);
        getExNovoStages(this);
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
            console.log(event);
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
                console.log(place.formatted_address);
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
        durataShow.textContent = "Quanto ore devi sostare questo nodo?"
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
            stage_index++;
            /*Inserire ex novo*/
            stage.index = stage_index
            //stage.latitudine = latLng.lat()
            //stage.longitudine = latLng.lng()
            stage.nome = StageName.value;
            stage.durata = parseInt(durataElement.value);
            stage.descrizione = descrElement.value
            console.log(PhotoFile)
            stage.placeId = placeId;
            stage.fotoURL = PhotoFile.value;
            to_send_stage.placeId = stage.placeId;
            to_send_stage.descrizione = stage.descrizione;
            to_send_stage.titolo = stage.titolo;
            to_send_stage.fotoURL = stage.fotoURL;
            to_send_stage.website = stage.website;
            to_send_stage.durata = stage.durata;
            to_send_stage.nome = stage.nome;
            roadmap.push(to_send_stage)

            //stage.placeId = generatePlaceIdExNovoNode(); //Gian Marco (c'era -1)
            //stage.formatted_addess = place.formatted_address; lo calcola placeAddress
            //addToRoadmapVisual(stage); // -1 = placeholder di UUID da fare
            document.getElementById('stage_list').innerHTML += "🏁" + stage.nome + " -> " + stage.durata + "<br>"

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
        durataShow.textContent = "Quanto ore devi sostare questo nodo?"
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
            stage_index++;
            /*inserire cose nodo gia esistente*/

            stage.durata = parseInt(durataElement.value);
            to_send_stage.durata = stage.durata;
            stage.placeId = placeId;
            to_send_stage.placeId = stage.placeId;
            stage.descrizione = desElement.value
            to_send_stage.descrizione = stage.descrizione;
            console.log(stage)
            roadmap.push(to_send_stage);
            //addToRoadmapVisual(stage);
            document.getElementById('stage_list').innerHTML += "🏁" + stage.nome + " -> " + stage.durata + "<br>"

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
                stage.citta = place.address_components[2].long_name
                if (place.website !== undefined) {
                    stage.website = place.website;
                }
                else {
                    stage.website = null
                }
                if (place.foto !== undefined) {
                    stage.fotoURL = place.foto
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