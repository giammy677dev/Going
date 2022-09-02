
function richiestaDBRoadmap(ricerca) {
    var xhr = new XMLHttpRequest();

    var time = document.getElementById("durata").value;
    var distance = document.getElementById("distanza").value;

    xhr.open("POST", '/searchRoadmap?ricerca=' + ricerca, true);

    xhr.onload = function (event) {
        const r = JSON.parse(event.target.responseText);

        if (r.ok == true) {
            
            var element = document.getElementById("numero_rm");
            if (element != null) {
                element.outerHTML = "";
            }

            element = document.getElementById("result_rm");
            if (element != null) {
                element.outerHTML = "";
            }

            var elements = document.getElementsByClassName("roadmap");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""
            }

            elements = document.getElementsByClassName("link_rm");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""
            }

            if (r.data.roadmaps.length > 0) {
                document.getElementById("ricerca_roadmap").style.display = "block"
                document.getElementById("risultati_roadmap").style.display = "block"
                
                if(r.data.roadmaps.length > 1){
                    document.getElementById("titolo_info_roadmap").innerText = r.data.roadmaps.length + " RISULTATI" 
                }
                else{
                    document.getElementById("titolo_info_roadmap").innerText = "1 RISULTATO"
                }
    
                for (var i = 0; i < r.data.roadmaps.length; i++) {
                
                    var tempo = convertHMS(r.data.roadmaps[i].durata);
                    var km = convertKM(r.data.roadmaps[i].distanza);
                    var html_star = printCocktail(r.data.roadmaps[i].punteggio)
                    
                    var html = "<div class=\"new_item-roadmap\"> <a title=\"visualizza Roadmap\"href=\"view_roadmap?id=" + r.data.roadmaps[i].id + "\">" +
                                "<span class=\"inEvidenza\">🌎 " + r.data.roadmaps[i].titolo + "</span> </a> <br>" +
                                "<p><span class=\"interno\">🏙 "+ r.data.roadmaps[i].localita + "</span> <br>" +
                                "<span class=\"interno\">⏱ " + tempo + " </span> <br>";

                    if (r.data.roadmaps[i].travelMode == "WALKING") {
                        html += "<span class=\"interno\">🚶‍♂️ " + km + "</span> <br>";
                    }
                    else {
                        html += "<span class=\"interno\">🚗 " + km + "</span> <br>";
                    }

                    html += "<span class=\"interno\">"+ html_star+"</span>"
                                    
                    const posto = document.getElementById("items-roadmap");
                    posto.insertAdjacentHTML("beforeend", html)
                }
            }
            else {
                document.getElementById("ricerca_roadmap").style.display= "block"
                document.getElementById("risultati_roadmap").style.display = "none"
                document.getElementById("titolo_info_roadmap").innerText = "NESSUN RISULTATO";
            }
        }
        else if (r.ok == false) {
            console.log(r)
            alert("Problemi col db")
        }
    }
    
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        time: time,
        distance: distance
    }));
}

function richiestaDBUtente(ricerca) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/searchUser?username=' + ricerca, true);
    xhr.onload = function (event) {

        const r = JSON.parse(event.target.responseText);
        const result = r.data.results

        if (r.ok == true) {
            
            var element = document.getElementById("numero");
            if (element != null) {
                element.outerHTML = "";
            }

            element = document.getElementById("result");
            if (element != null) {
                element.outerHTML = "";
            }

            var elements = document.getElementsByClassName("user");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""
            }

            elements = document.getElementsByClassName("link_user");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""
            }

            if (result.length > 0) {
                document.getElementById("ricerca_utenti").style.display= "block"
                document.getElementById("risultati_utenti").style.display = "block"

                if(result.length > 1){
                    document.getElementById("titolo_info_utenti").innerText = result.length + " RISULTATI"; 
                }
                else{
                    document.getElementById("titolo_info_utenti").innerText = "1 RISULTATO";
                }
                
                var age=Age(result[i].birthdate);

                for (var i = 0; i < result.length; i++) {
                    const html_code = '<a class="link_user" href="/profile?id=' + result[i].id + '"><div class="new_item-user" ><img src="' + result[i].avatar + '"><br>' + result[i].username + '<br>' +age+' anni </div></a>'
                    const posto = document.getElementById("items-user");
                    posto.insertAdjacentHTML("beforeend", html_code);
                }
            }
            else {
                document.getElementById("ricerca_utenti").style.display= "block"
                document.getElementById("risultati_utenti").style.display = "none"
                document.getElementById("titolo_info_utenti").innerText = "NESSUN RISULTATO";
            }

        }
        else if (r.ok == false) {
            console.log(r)
            alert("Problemi col db")
        }
    }

    xhr.send()
}

function searchExplore() {
    var ricerca = document.getElementById("barra_ricerca").value;

    if (ricerca == "") {
        document.getElementById("ricerca_roadmap").style.display= "none"
        document.getElementById("risultati_roadmap").style.display = "none"
        document.getElementById("ricerca_utenti").style.display= "none"
        document.getElementById("risultati_utenti").style.display = "none"
        document.getElementById("Response_Research").innerText = "❗Campo Vuoto. Riprovare";
    }
    else {
        document.getElementById("Response_Research").innerText = "";
        richiestaDBRoadmap(ricerca);
        richiestaDBUtente(ricerca);
    }
}

function fromMain() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const ricerca = urlParams.get('ricerca')

    if (ricerca != null) {
        document.getElementById("barra_ricerca").value = ricerca;
        richiestaDBUtente(ricerca);
        richiestaDBRoadmap(ricerca);
    }
}

function printCocktail(punteggio) {
    const html_cocktailPieno = '<img src="/storage/cocktailPieno.png" style="width:25px;height: 25px;">'
    const html_cocktailMezzo = '<img src="/storage/cocktailMezzo.png" style="width:25px;height: 25px;">'
    const html_cocktailVuoto = '<img src="/storage/cocktailVuotoPiccolo.png" style="width:25px;height: 25px;">'
    var html_globale = " "
    var counterStamp = 0;
    if(punteggio!= null){
        if (Number.isInteger(punteggio)) {
            for (var iteratorInt = 0; iteratorInt < punteggio; iteratorInt++) {
                counterStamp++;
                html_globale += html_cocktailPieno
            }
        } else {
            for (var iteratorInt = 1; iteratorInt < punteggio; iteratorInt++) {  //iteratorInt parte da 1 così da non inserire interi fino a 0.75
                counterStamp++;
                html_globale += html_cocktailPieno
            }

            //Inizio controllo sul decimale
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
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours   = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds; // Return is HH : MM : SS
  }
  
  function convertKM(value){
    if(value<1000){
      var x=value+" m"
      return x;
    }
    else{
      var km = value / 1000;
      var x=km.toFixed(1)+" km"
      return x
    }
  }

  function Age(birthdate){
    var today = new Date();
    var birthDate = new Date(birthdate);
  
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age
  }
  