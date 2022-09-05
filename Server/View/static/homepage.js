var ok=false
var user_id=0

function check() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/isLogWho', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    if (r.ok == true) {
      console.log("sei loggato!!! con questo id", r.whoLog)
      console.log(r)
      ok=r.ok
      user_id=r.whoLog
      
      console.log(document.getElementById("firstButtLog"))
      document.getElementById("firstButtLog").innerHTML = "Logout";
      document.getElementById("firstButtLog").setAttribute("onclick","document.getElementById('logout').style.display='block'");

      console.log(document.getElementById("secondButtLog"))
      document.getElementById("secondButtLog").innerHTML = "Profilo";
      document.getElementById("secondButtLog").setAttribute("href","/profile?id="+user_id);
    }
    else if (r.ok == false) {
      console.log("non sei loggato!!!")
      console.log(r)
    }
  }
  xhr.send();
}

function logout(){
  var xhr = new XMLHttpRequest();
  
  xhr.open("POST", '/logout', true);
  
  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);
    if (r.ok == true) {
      location.href = "/";
    }
    else if(r.ok==false){
      console.log("ops problemi")
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({
        
      }));
}

function ricercaHome() {
  var ricerca = document.getElementById("search").value;
  if (ricerca == "") {
    document.getElementById("Response_Research").innerText = "❗Campo Vuoto. Riprovare";
  }
  else {
    location.href = "/explore?ricerca=" + ricerca;
  }
}

function caricaRoadmap() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", '/getBestRoadmap', true);
  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);
    const result = r.data

    if (r.ok == true) {

      for (var i = 0; i < result.length; i++) {
        var spazioRoadmap = document.createElement("div");
        spazioRoadmap.setAttribute("id","divRoadmap" + i);
        spazioRoadmap.setAttribute("class","divRoadmap");
        spazioRoadmap.setAttribute("onMouseOver","conMouseOver(\"" + spazioRoadmap.id + "\")");
        spazioRoadmap.setAttribute("onMouseOut","conMouseOut(\"" + spazioRoadmap.id + "\")");
        document.getElementById("containerRoadmap").appendChild(spazioRoadmap);
    
        var tempo = convertHMS(result[i].durata);
        var km = convertKM(result[i].distanza);

        var html = "<a title=\"visualizza Roadmap\"href=\"view_roadmap?id=" + result[i].id + "\">" +
                    "<span class=\"inEvidenza\">🌎 " + result[i].titolo + "</span><\a>" +
                    "<p><span class=\"interno\">🏙 "+ result[i].localita + "</span>" +
                    "<span class=\"interno\">⏱ " + tempo + " </span>";

        if(result[i].travelMode == "WALKING"){
          html += "<span class=\"interno\">🚶‍♂️ " + km + "</span>";
        }
        else{
          html += "<span class=\"interno\">🚗 " + km + "</span>";
        }
             
        document.getElementById("divRoadmap" + i).innerHTML = html;   
        printCocktail(result[i].punteggio,i);
      }
    }
    else if (r.ok == false) {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.send();
}

function printCocktail(media_valutazioni,i){
  /* prendo tutto il numero intero e stampo i cock pieni
    verifico poi se c'è parte decimale faccio il controllo e decido se aggiungere un cocktail pieno o mezzo
    verifico se ho fatto riferimento a 5 elementi, in caso contrario arrivo a 5 mettendo cocktail vuoti*/
    var spazioRoadmap = document.getElementById("divRoadmap" + i);
    const html_cocktailPieno = '<img src="/storage/cocktailPieno.png" style="width:25px;height: 25px;">'
    const html_cocktailMezzo = '<img src="/storage/cocktailMezzo.png" style="width:25px;height: 25px;">'
    const html_cocktailVuoto = '<img src="/storage/cocktailVuotoPiccolo.png" style="width:25px;height: 25px;">'
    var counterStamp = 0;
    if(media_valutazioni != null){
      if(Number.isInteger(media_valutazioni)){
        for (var iteratorInt = 0; iteratorInt < media_valutazioni; iteratorInt++) {
          spazioRoadmap.insertAdjacentHTML("beforeend", html_cocktailPieno);
          counterStamp++;
        }
      } else{
        for (var iteratorInt = 1; iteratorInt < media_valutazioni; iteratorInt++) {  //iteratorInt parte da 1 così da non inserire interi fino a 0.75
          spazioRoadmap.insertAdjacentHTML("beforeend", html_cocktailPieno);
          counterStamp++;
        }
        
        var decimal = media_valutazioni - Math.floor(media_valutazioni);
        decimal = decimal.toFixed(2);

        if (decimal >= 0.25 && decimal < 0.75) {
          spazioRoadmap.insertAdjacentHTML("beforeend", html_cocktailMezzo);
          counterStamp++;
        }
        else if (decimal >= 0.75) {
          spazioRoadmap.insertAdjacentHTML("beforeend", html_cocktailPieno);
          counterStamp++;
        }
      }
    }

    while (counterStamp < 5) {
      spazioRoadmap.insertAdjacentHTML("beforeend", html_cocktailVuoto);
      counterStamp++;
    }
}

  function conMouseOver(target){
    document.getElementById(target).firstChild.childNodes[0].style.fontSize='30px';
    for(i=2; i<=6; i++){
      document.getElementById(target).childNodes[i].style.width='35px';
      document.getElementById(target).childNodes[i].style.height='35px';
    }
  }

  function conMouseOut(target){
    document.getElementById(target).firstChild.childNodes[0].style.fontSize='20px';
    for(i=2; i<=6; i++){
      document.getElementById(target).childNodes[i].style.width='25px';
      document.getElementById(target).childNodes[i].style.height='25px';
    }
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
  