function searchRoadmap(ricerca) {
    var xhr = new XMLHttpRequest();

    var time = document.getElementById("durata").value;
    var distance = document.getElementById("distanza").value;

    xhr.open("POST", '/searchRoadmap?ricerca=' + ricerca, true);

    xhr.onload = function (event) {
        const r = JSON.parse(event.target.responseText);

        if (r.ok == true) {

            var elements = document.getElementsByClassName("roadmap");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""
            }

            document.getElementById("info_roadmap").innerText = "RICERCA ROADMAP";

            if (r.data.roadmaps.length > 0) {
                document.getElementById("ricerca_roadmap").style.display = "block"
                document.getElementById("risultati_roadmap").style.display = "block"

                if (r.data.roadmaps.length > 1) {
                    document.getElementById("titolo_info_roadmap").innerText = r.data.roadmaps.length + " RISULTATI"
                }
                else {
                    document.getElementById("titolo_info_roadmap").innerText = "1 RISULTATO"
                }

                for (var i = 0; i < r.data.roadmaps.length; i++) {

                    var tempo = convertHMS(r.data.roadmaps[i].durata);
                    var km = convertKM(r.data.roadmaps[i].distanza);
                    var html_star = printCocktail(r.data.roadmaps[i].punteggio)

                    var html = "<div class=\"new_item-roadmap\"> <a title=\"visualizza Roadmap\"href=\"view_roadmap?id=" + r.data.roadmaps[i].id + "\">" +
                        "<span class=\"inEvidenza\">🌎 " + r.data.roadmaps[i].titolo + "</span> </a> <br>" +
                        "<p><span class=\"interno\">🏙 " + r.data.roadmaps[i].localita + "</span> <br>" +
                        "<span class=\"interno\">⏱ " + tempo + " </span> <br>";

                    if (r.data.roadmaps[i].travelMode == "WALKING") {
                        html += "<span class=\"interno\">🚶‍♂️ " + km + "</span> <br>";
                    }
                    else {
                        html += "<span class=\"interno\">🚗 " + km + "</span> <br>";
                    }

                    html += "<span class=\"interno\">" + html_star + "</span>"

                    const posto = document.getElementById("items-roadmap");
                    posto.insertAdjacentHTML("beforeend", html)
                }
            }
            else {
                document.getElementById("ricerca_roadmap").style.display = "block"
                document.getElementById("risultati_roadmap").style.display = "none"
                document.getElementById("titolo_info_roadmap").innerText = "NESSUN RISULTATO";
            }
        }
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        time: time,
        distance: distance
    }));
}

function searchUser(ricerca) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/searchUser?username=' + ricerca, true);
    xhr.onload = function (event) {

        const r = JSON.parse(event.target.responseText);

        if (r.ok == true) {
            var elements = document.getElementsByClassName("user");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""
            }

            elements = document.getElementsByClassName("link_user");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""
            }

            if (r.data.users.length > 0) {
                document.getElementById("ricerca_utenti").style.display = "block"
                document.getElementById("risultati_utenti").style.display = "block"

                if (r.data.users.length > 1) {
                    document.getElementById("titolo_info_utenti").innerText = r.data.users.length + " RISULTATI";
                }
                else {
                    document.getElementById("titolo_info_utenti").innerText = "1 RISULTATO";
                }

                for (var i = 0; i < r.data.users.length; i++) {
                    var age = Age(r.data.users[i].birthdate);
                    const html_code = '<a class="link_user" href="/profile?id=' + r.data.users[i].id + '"><div class="new_item-user" ><img src="' + r.data.users[i].avatar + '"><br>' + r.data.users[i].username + '<br>' + age + ' anni </div></a>'
                    const posto = document.getElementById("items-user");
                    posto.insertAdjacentHTML("beforeend", html_code);
                }
            }
            else {
                document.getElementById("ricerca_utenti").style.display = "block"
                document.getElementById("risultati_utenti").style.display = "none"
                document.getElementById("titolo_info_utenti").innerText = "NESSUN RISULTATO";
            }
        }
    }
    xhr.send()
}

function searchExplore() {
    var ricerca = document.getElementById("barra_ricerca").value;

    if (ricerca == "") {
        document.getElementById("ricerca_roadmap").style.display = "none"
        document.getElementById("risultati_roadmap").style.display = "none"
        document.getElementById("ricerca_utenti").style.display = "none"
        document.getElementById("risultati_utenti").style.display = "none"
        document.getElementById("Response_Research").innerText = "❗ Campo Vuoto. Riprovare";
    }
    else {
        document.getElementById("Response_Research").innerText = "";
        searchRoadmap(ricerca);
        searchUser(ricerca);
    }
}

function searchFromMain() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const ricerca = urlParams.get('ricerca')

    if (ricerca != null) {
        document.getElementById("barra_ricerca").value = ricerca;
        searchRoadmap(ricerca);
        searchUser(ricerca);
    }
    else {
        suggestedRoadmap();
    }
}

function suggestedRoadmap() {
    var xhr = new XMLHttpRequest();

    var numberRoadmapToDisplay = 4;
    var rating = 3;

    xhr.open("POST", '/suggestedRoadmap', true);

    xhr.onload = function (event) {
        const r = JSON.parse(event.target.responseText);

        if (r.ok == true) {

            var elements = document.getElementsByClassName("roadmap");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""
            }

            if (r.data.roadmaps.length > 0) {
                document.getElementById("ricerca_roadmap").style.display = "block"
                document.getElementById("risultati_roadmap").style.display = "block"

                document.getElementById("info_roadmap").innerText = "ROADMAP SUGGERITE"
                document.getElementById("titolo_info_roadmap").innerText = ""

                for (var i = 0; i < r.data.roadmaps.length; i++) {

                    var tempo = convertHMS(r.data.roadmaps[i].durata);
                    var km = convertKM(r.data.roadmaps[i].distanza);
                    var html_star = printCocktail(r.data.roadmaps[i].punteggio)

                    var html = "<div class=\"new_item-roadmap\"> <a title=\"visualizza Roadmap\"href=\"view_roadmap?id=" + r.data.roadmaps[i].id + "\">" +
                        "<span class=\"inEvidenza\">🌎 " + r.data.roadmaps[i].titolo + "</span> </a> <br>" +
                        "<p><span class=\"interno\">🏙 " + r.data.roadmaps[i].localita + "</span> <br>" +
                        "<span class=\"interno\">⏱ " + tempo + " </span> <br>";

                    if (r.data.roadmaps[i].travelMode == "WALKING") {
                        html += "<span class=\"interno\">🚶‍♂️ " + km + "</span> <br>";
                    }
                    else {
                        html += "<span class=\"interno\">🚗 " + km + "</span> <br>";
                    }

                    html += "<span class=\"interno\">" + html_star + "</span>"

                    const posto = document.getElementById("items-roadmap");
                    posto.insertAdjacentHTML("beforeend", html)
                }
            }
            else {
                document.getElementById("ricerca_roadmap").style.display = "none"
                document.getElementById("risultati_roadmap").style.display = "none"
            }
        }
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        numberRoadmapToDisplay: numberRoadmapToDisplay,
        rating: rating
    }));
}

function printCocktail(punteggio) {
    const html_cocktailPieno = '<img src="/storage/cocktailPieno.png" style="width:25px;height: 25px;">'
    const html_cocktailMezzo = '<img src="/storage/cocktailMezzo.png" style="width:25px;height: 25px;">'
    const html_cocktailVuoto = '<img src="/storage/cocktailVuotoPiccolo.png" style="width:25px;height: 25px;">'
    var html_globale = " "
    var counterStamp = 0;
    if (punteggio != null) {
        if (Number.isInteger(punteggio)) {
            for (var iteratorInt = 0; iteratorInt < punteggio; iteratorInt++) {
                counterStamp++;
                html_globale += html_cocktailPieno
            }
        } else {
            for (var iteratorInt = 1; iteratorInt < punteggio; iteratorInt++) { 
                counterStamp++;
                html_globale += html_cocktailPieno
            }
            var decimal = punteggio - Math.floor(punteggio);
            decimal = decimal.toFixed(2);

            if (decimal >= 0.25 && decimal < 0.75) {
                html_globale += html_cocktailMezzo
                counterStamp++;
            }
            else if (decimal >= 0.75) {
                html_globale += html_cocktailPieno
                counterStamp++;
            }
        }
    }
    while (counterStamp < 5) {
        counterStamp++;
        html_globale += html_cocktailVuoto
    }
    return html_globale
}

function convertHMS(value) {
    const sec = parseInt(value, 10); 
    let hours = Math.floor(sec / 3600); 
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds; 
}

function convertKM(value) {
    if (value < 1000) {
        var x = value + " m"
        return x;
    }
    else {
        var km = value / 1000;
        var x = km.toFixed(1) + " km"
        return x
    }
}

function Age(birthdate) {
    var today = new Date();
    var birthDate = new Date(birthdate);

    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age
}