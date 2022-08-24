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
      document.getElementById("secondButtLog").innerHTML = "Profile";
      document.getElementById("secondButtLog").setAttribute("href","/profile");
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
        id: user_id
      }));
}

function ricercaHome() {
  var ricerca = document.getElementById("search").value;
  if (ricerca == "") {
    alert(" campo nullo")
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
        spazioRoadmap.innerHTML ="<a title=\"visualizza Roadmap\"href=\"view_roadmap?id="+result[i].id+"\"><span class=\"inEvidenza\">" + result[i].titolo + "</span></a>" + 
        "<p><span class=\"interno\">🏙 " + result[i].localita  + "</span><span class=\"interno\">⏱" + result[i].durataComplessiva + "</span></p>";
        funcCoktail(result[i].punteggio,i);
      }
      
    }
    else if (r.ok == false) {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.send();
}

function funcCoktail(media_valutazioni,i){
  /* prendo tutto il numero intero e stampo i cock pieni
    verifico poi se c'è parte decimale faccio il controllo e decido se aggiungere un cocktail pieno o mezzo
    verifico se ho fatto riferimento a 5 elementi, in caso contrario arrivo a 5 mettendo cocktail vuoti*/
    var spazioRoadmap = document.getElementById("divRoadmap" + i);
    const html_codePieno = '<img src="/storage/cocktailPieno.png" style="width:25px;height: 25px;">'
    const html_codeMezzo = '<img src="/storage/cocktailMezzo.png" style="width:25px;height: 25px;">'
    const html_codeVuoto = '<img src="/storage/cocktailVuotoPiccolo.png" style="width:25px;height: 25px;">'
    var counterStamp = 0;
    if(Number.isInteger(media_valutazioni)){
      for (var iteratorInt = 0; iteratorInt < media_valutazioni; iteratorInt++) {
        spazioRoadmap.insertAdjacentHTML("beforeend", html_codePieno);
        counterStamp++;
      }
    } else{
      for (var iteratorInt = 1; iteratorInt < media_valutazioni; iteratorInt++) {  //iteratorInt parte da 1 così da non inserire interi fino a 0.75
        spazioRoadmap.insertAdjacentHTML("beforeend", html_codePieno);
        counterStamp++;
      }
      //inizio controllo sul decimale
      const decimalStr = media_valutazioni.toString().split('.')[1];
      var decimal = Number("0."+decimalStr);
      if (decimal < 0.25) {
      } else if (decimal > 0.75){
        spazioRoadmap.insertAdjacentHTML("beforeend", html_codePieno);
        counterStamp++;
      } else{
        spazioRoadmap.insertAdjacentHTML("beforeend", html_codeMezzo);
        counterStamp++;
      }
    }

    while(counterStamp<5){
      spazioRoadmap.insertAdjacentHTML("beforeend", html_codeVuoto);
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
  