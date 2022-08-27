var ok_in_rm = false
var id_user = null
var id_rm = 0
var insert_rec = 1
var points = 0
var commento_utente
var chk_com




document.addEventListener('dbMarkerClicked', (e) => { ClickEventHandler.prototype.openInfoBox(e.placeId, e.latLng); }, false);

document.addEventListener('receivedUserInfo', (e) => {
  console.log("jcncjsdnjcdn",e)
  if (e.logged) {
    console.log("ok:", r.ok, "=>sei loggato!!! con questo id", r.whoLog)
    ok_in_rm = true
    id_user = r.whoLog
    loadLoggedRoad(id_user,id_rm)

  }
  else {
    document.getElementById("container_funz").style.display = "none"
    document.getElementById("roadmap_funz").innerHTML = "<h2>Registrati o effettua il Log In per lasciare una tua impressione sulla roadmap come hanno fatto questi Roadmappers!<h2>"
  }

}, false);

document.addEventListener('receivedStageData', (e) => {

  var stage = e.stage;

  var time = stage.reachTime;
  if (time == null) {
    time = " "
  }
  document.getElementById('lines').innerHTML += '<div class="dot" id="dot">' + time + '</div><div class="line" id="line"></div>'
  document.getElementById('cards').innerHTML += '<div class="card" id="card"> <h4>' + stage.nome + '</h4><p>' + stage.indirizzo + ' con durata di sosta: ' + stage.durata + '; facendo ste cose: ' + stage.descrizione_st + '</p></div>'

}, false);

document.addEventListener('receivedRoadmapData', (e) => {
  var day = new Date(roadmap.dataCreazione)
  var month = day.getMonth() + 1;

  var minuti = Math.round(roadmap.durata / 60)

  document.getElementById("titolo").innerText = roadmap.titolo
  document.getElementById("data").innerText = ' 🗓 ' + day.getDate() + "/" + month + "/" + day.getFullYear()
  document.getElementById("durata").innerText = ' ⏱ ' + minuti + ' minuti'
  document.getElementById("citta").innerText = ' 🏙 ' + roadmap.localita
  document.getElementById("utente").innerText = ' 👤 ' + user[0].username
  document.getElementById("distanza").innerText = '🚶 ' + roadmap.distanza + ' metri'
  document.getElementById("descrizione").innerText = roadmap.descrizione
  if (roadmap.punteggio != null) {
    const html_cock = printBicchieri(roadmap.punteggio, 35)
    document.getElementById("rating").innerHTML += html_cock
  }
  /*for (let i = 0; i < quanti_stage; i++) {
    var time = roadmap.stages[i].reachTime
    if (time == null) {
      time = " "
    }
    document.getElementById('lines').innerHTML += '<div class="dot" id="dot">' + time + '</div><div class="line" id="line"></div>'
    document.getElementById('cards').innerHTML += '<div class="card" id="card"> <h4>' + roadmap.stages[i].nome + '</h4><p>' + roadmap.stages[i].indirizzo + ' con durata di sosta: ' + roadmap.stages[i].durata + '; facendo ste cose: ' + roadmap.stages[i].descrizione_st + '</p></div>'
  }*/
  loadRecCom();
}, false);

/*
function loading_roadmap() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get('id')

  if (id != null && id >= 0) {
    id_rm = id
    richiestaRoadmap(id)
  }
  else {
    location.href = "/explore"
  }
}
function richiestaRoadmap(id) {

  var xhr = new XMLHttpRequest();
  xhr.open("GET", '/viewrm?id=' + id, true);

  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);
    if (r.data === undefined) {
      location.href = "/explore"
    }
    const quanti_stage = r.data.roadmap.stages.length
    const roadmap = r.data.roadmap
    const user = r.data.user
    console.log("quanti stage rm:", quanti_stage)
    console.log("dati rm:", roadmap)
    console.log("dati user:", user)

    if (r.ok == true) {
      if (quanti_stage < 0) {
        location.href = "/explore"
      }
      else {
        var day = new Date(roadmap.dataCreazione)
        var month = day.getMonth() + 1;

        var minuti = Math.round(roadmap.durata / 60)

        document.getElementById("titolo").innerText = roadmap.titolo
        document.getElementById("data").innerText = ' 🗓 ' + day.getDate() + "/" + month + "/" + day.getFullYear()
        document.getElementById("durata").innerText = ' ⏱ ' + minuti + ' minuti'
        document.getElementById("citta").innerText = ' 🏙 ' + roadmap.localita
        document.getElementById("utente").innerText = ' 👤 ' + user[0].username
        document.getElementById("distanza").innerText = '🚶 ' + roadmap.distanza + ' metri'
        document.getElementById("descrizione").innerText = roadmap.descrizione
        if (roadmap.punteggio != null) {
          const html_cock = printBicchieri(roadmap.punteggio, 35)
          document.getElementById("rating").innerHTML += html_cock
        }
        for (let i = 0; i < quanti_stage; i++) {
          var time = roadmap.stages[i].reachTime
          if (time == null) {
            time = " "
          }
          document.getElementById('lines').innerHTML += '<div class="dot" id="dot">' + time + '</div><div class="line" id="line"></div>'
          document.getElementById('cards').innerHTML += '<div class="card" id="card"> <h4>' + roadmap.stages[i].nome + '</h4><p>' + roadmap.stages[i].indirizzo + ' con durata di sosta: ' + roadmap.stages[i].durata + '; facendo ste cose: ' + roadmap.stages[i].descrizione_st + '</p></div>'

        }


      }
    }
    else if (r.ok == false) {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.send()
}
function check_nw() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/isLogWho', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    console.log(r)
    if (r.ok == true) {
      console.log("ok:", r.ok, "=>sei loggato!!! con questo id", r.whoLog)
      ok_in_rm = true
      id_user = r.whoLog
      loadLoggedRoad(id_user,id_rm)

    }
    else if (r.ok == false) {
      document.getElementById("container_funz").style.display = "none"
      document.getElementById("roadmap_funz").innerHTML = "<h2>Registrati o effettua il Log In per lasciare una tua impressione sulla roadmap come hanno fatto questi Roadmappers!<h2>"
    }
  }
  xhr.send();
<<<<<<< Updated upstream
}*/


function loadLoggedRoad(id_user,id_rm) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/allLoggedRoadmap?id_user=' + id_user+'&id_rm='+id_rm, true);

  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    console.log(r.data)
    const chk_rec = r.data.results_rec.length
    chk_com = r.data.results_com.length


    if (r.ok == true) {
      if (chk_rec == 1) {
        const rec = r.data.results_rec[0]
        insert_rec = 0
        document.getElementById("save_recbtn").innerHTML = "Modifica/Aggiungi opinione/valutazione";
        const rating = rec.valutazione

        points=rating
        const html_cock = printBicchieri(rating, 50)

        document.getElementById("cocks").innerHTML = html_cock
        var elements = document.getElementById('cocks').children;
        for (let i = 0; i < elements.length; i++) {
          elements[i].setAttribute("id", i)
          elements[i].setAttribute("onclick", "rating(" + i + ")")
        }
        document.getElementById('cocks').setAttribute("disabled", "disabled")
        if (rec.opinione != null) {
          document.getElementById("lab_rec").innerHTML = "La tua recensione!"
          document.getElementById("us_rec").innerText = rec.opinione
          document.getElementById("us_rec").setAttribute("disabled", "disabled")
          document.getElementById("save_recbtn").setAttribute("onclick", "abilitaRec()");
        }
      }
      if (chk_rec == 0) {
        const html_cock = '<img id="0" onclick="rating(0)" src="/storage/cocktailVuotoPiccolo.png" style="width:50px;height: 50px;"><img id="1" onclick="rating(1)" src="/storage/cocktailVuotoPiccolo.png" style="width:50px;height: 50px;"><img id="2" onclick="rating(2)" src="/storage/cocktailVuotoPiccolo.png" style="width:50px;height: 50px;"><img id="3" onclick="rating(3)" src="/storage/cocktailVuotoPiccolo.png" style="width:50px;height: 50px;"><img id="4" onclick="rating(4)" src="/storage/cocktailVuotoPiccolo.png" style="width:50px;height: 50px;">'
        document.getElementById("cocks").innerHTML = html_cock
      }


      if (chk_com > 0) {
        for(let i=0;i<chk_com;i++){
          commento_utente[i].testo = r.data.results_com[i].testo
          commento_utente[i].data=r.data.results_com[i].dataPubblicazione
        }

      }
    }
    else if (r.ok == false) {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.send();
}

function abilitaRec() {
  document.getElementById("us_rec").removeAttribute("disabled")
  document.getElementById("save_recbtn").innerHTML = "Salva Valutazione e/o opinione";
  document.getElementById("save_recbtn").setAttribute("onclick", "saveRec()");

}
function abilitaCom() {
  document.getElementById("us_com").removeAttribute("disabled")
  document.getElementById("save_combtn").innerHTML = "Salva Commento";
  document.getElementById("save_combtn").setAttribute("onclick", "saveCom()");
}

function loadRecCom() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/getRecCom?id=' + id_rm, true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);
    const len_rc = r.data.recensioni.length
    const len_com = r.data.commenti.length


    if (r.ok == true) {
      if (len_rc !== undefined && len_rc > 0) {
        const recensioni = r.data.recensioni
        console.log("quante recensioni:", recensioni)
        for (let i = 0; i < len_rc; i++) {
          var day = new Date(recensioni[i].dataPubblicazione)
          var month = day.getMonth() + 1;
          const dataHtml = ' 🗓 ' + day.getDate() + "/" + month + "/" + day.getFullYear()
          const cocksHtml = printBicchieri(recensioni[i].valutazione, 25)
          var opHtml = recensioni[i].opinione
          if (opHtml == null) {
            opHtml = '<div style="font-style: italic;">Non è stata lasciata una opinione insieme alla valutazione</div>'
          }
          const html_rec = '<div class="recensione" id="recensione"><div class="datirec" id="datirec' + recensioni[i].idRecensione + '"><div class="valutazione" id="valutazione">' + cocksHtml + '</div><div class="whoRec" id="whoRec">' + ' 👤' + recensioni[i].username + '</div><div class="data_pub" id="data_pub">' + dataHtml + '<a id="segn' + recensioni[i].idRecensione + '" class="boxclose" style="margin-top: -50px; title="segnala commento" onclick="segnalaRec(' + recensioni[i].idRecensione + ')">x</a></div></div><div class="opinione" id="opinione">' + opHtml + '</div></div>'
          document.getElementById("recensioni").innerHTML += html_rec
        }
      }
      else {
        const html_recvuoto = '<h4 style="font-style: italic;">Non sono state ancora scritte recensioni per questa roadmap</h4>'
        document.getElementById("recensioni").innerHTML += html_recvuoto
      }
      if (len_com !== undefined && len_com > 0) {
        const commenti = r.data.commenti
        console.log("quanti commenti:", commenti)
        for (let i = 0; i < len_com; i++) {

          var day = new Date(commenti[i].dataPubblicazione)
          var month = day.getMonth() + 1;
          const dataHtml = ' 🗓 ' + day.getDate() + "/" + month + "/" + day.getFullYear()
          const html_com = '<div class="commento" id="commento"><div class="daticomm" id="daticomm' + commenti[i].idCommento + '"><div class="text_commento" id="text_commento">' + commenti[i].testo + '<a class="boxclose" id="segn' + commenti[i].idCommento + '" title="segnala commento" onclick="segnalaComm(' + commenti[i].idCommento + ')">x</a></div><div class="whoCom" id="whoCom">' + ' 👤' + commenti[i].username + '</div><div class="data_pub" id="data_pub">' + dataHtml + '</div></div></div>'
          document.getElementById("commenti").innerHTML += html_com
        }
      }
      else {
        const html_comvuoto = '<h4 style="font-style: italic;">Non sono stati ancora scritti commenti per questa roadmap</h4>'
        document.getElementById("commenti").innerHTML += html_comvuoto
      }
    }
    else if (r.ok == false) {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.send();
}

function printBicchieri(punteggio, grandezza) {
  /* prendo tutto il numero intero e stampo i cock pieni
     verifico poi se c'è parte decimale faccio il controllo e decido se aggiungere un cocktail pieno o mezzo
     verifico se ho fatto riferimento a 5 elementi, in caso contrario arrivo a 5 mettendo cocktail vuoti*/

  const html_codePieno = '<img src="/storage/cocktailPieno.png" style="width:' + grandezza + 'px;height: ' + grandezza + 'px;">'
  const html_codeMezzo = '<img src="/storage/cocktailMezzo.png" style="width:' + grandezza + 'px;height: ' + grandezza + 'px;">'
  const html_codeVuoto = '<img src="/storage/cocktailVuotoPiccolo.png" style="width:' + grandezza + 'px;height: ' + grandezza + 'px;">'
  var html_globale = " "
  var counterStamp = 0;
  if (Number.isInteger(punteggio)) {
    for (var iteratorInt = 0; iteratorInt < punteggio; iteratorInt++) {
      counterStamp++;
      html_globale += html_codePieno
    }
  } else {
    for (var iteratorInt = 1; iteratorInt < punteggio; iteratorInt++) {  //iteratorInt parte da 1 così da non inserire interi fino a 0.75
      counterStamp++;
      html_globale += html_codePieno
    }
    //inizio controllo sul decimale
    const decimalStr = punteggio.toString().split('.')[1];
    var decimal = Number(decimalStr);
    if (decimal < 2.5) {
    } else if (decimal > 7.5) {
      html_globale += html_codePieno
      counterStamp++;
    } else {
      html_globale += html_codeMezzo
      counterStamp++;
    }
  }
  while (counterStamp < 5) {
    counterStamp++;
    html_globale += html_codeVuoto
  }
  return html_globale
}

function rating(value) {
  points = value + 1
  const html_cock = printBicchieri(points, 50)
  document.getElementById("cocks").innerHTML = html_cock
  var elements = document.getElementById('cocks').children;
  for (let i = 0; i < elements.length; i++) {
    elements[i].setAttribute("id", i)
    elements[i].setAttribute("onclick", "rating(" + i + ")")
  }
}

function heart() {


  const button = document.querySelector(".heart-like-button");
  var point = 0;
  //insert in tabella con id utente per dire se preferita
  if (button.classList.contains("liked")) {
    button.classList.remove("liked");
    point = 0
    alert("Non mi piace più, Punteggio=" + point)
  } else {
    button.classList.add("liked");
    point = 1
    alert("Mi piace, Punteggio=" + point)
  }

}

function checked() {

  const button = document.querySelector(".checked-like-button");
  var point = 0;
  //insert in tabella con id utente per dire se effettuata
  if (button.classList.contains("liked")) {
    button.classList.remove("liked");
    point = 0
    alert("Non la seguo più, Punteggio=" + point)
  } else {
    button.classList.add("liked");
    point = 1
    alert("La seguo, Punteggio=" + point)
  }

}
function saveRec() {

  if (points > 0) {
    var opinione = document.getElementById("us_rec").value
    if (opinione == "") {
      opinione = null
    }
    var valutazione = points
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    console.log(insert_rec)
    console.log(today)
    console.log(valutazione)
    console.log(opinione)
    console.log(id_rm)
    console.log(id_user)


    if (insert_rec == 1) {
      var xhr = new XMLHttpRequest();

      xhr.open("POST", '/setRecensione', true);
      xhr.onload = function (event) {

        const r = JSON.parse(event.target.responseText);

        console.log(r)
        if (r.ok == true) {
          alert("Compliementi!!")
          location.reload()
        }
        else if (r.ok == false) {
          console.log(r)
          alert("Problemi col db")
        }
      }
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({
        user: id_user,
        roadmap: id_rm,
        mod_opinione: opinione,
        mod_valutazione: valutazione,
        day: today
      }));
    }
    if (insert_rec == 0) {
      var xhr = new XMLHttpRequest();

      xhr.open("POST", '/updateRecensione', true);
      xhr.onload = function (event) {

        const r = JSON.parse(event.target.responseText);

        console.log(r)
        if (r.ok == true) {
          alert("Compliementi!!")
          location.reload()
        }
        else if (r.ok == false) {
          console.log(r)
          alert("Problemi col db")
        }
      }
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({
        user: id_user,
        roadmap: id_rm,
        mod_opinione: opinione,
        mod_valutazione: valutazione,
        day: today
      }));

    }
  }
  else {
    alert("nooooooooo")
  }
}
function saveCom() {
  com = document.getElementById("us_com").value
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;

  if (insert_com == 1) {
    var xhr = new XMLHttpRequest();

    xhr.open("POST", '/setCommento', true);
    xhr.onload = function (event) {

      const r = JSON.parse(event.target.responseText);

      console.log(r)
      if (r.ok == true) {
        alert("Compliementi!!")
        location.reload()
      }
      else if (r.ok == false) {
        console.log(r)
        alert("Problemi col db")
      }
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      user: id_user,
      roadmap: id_rm,
      mod_com: com,
      day: today
    }));
  }
  if (insert_com == 0) {
    var xhr = new XMLHttpRequest();

    xhr.open("POST", '/updateCommento', true);
    xhr.onload = function (event) {

      const r = JSON.parse(event.target.responseText);

      console.log(r)
      if (r.ok == true) {
        alert("Compliementi!!")
        location.reload()
      }
      else if (r.ok == false) {
        console.log(r)
        alert("Problemi col db")
      }
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      user: id_user,
      roadmap: id_rm,
      mod_com: com,
      day: today
    }));



  }
}

function forkaggio() {
  location.href = "/create?roadmap_id=" + id_rm
}
function segnalaRec(id_rec) {
  //piccola conferma, poi insert in tabella nel db delle segnalazioni,
  //vedendo anche se già presente 
  //dicendo (id_rm, id_user,cosa è, id_della_cosa)
  alert(id_rec)
}
function segnalaComm(id_comm) {
  //piccola conferma, poi insert in tabella nel db delle segnalazioni,
  //vedendo anche se già presente 
  //dicendo (id_rm, id_user, cosa è, id_della_cosa)
  alert(id_comm)
}


var ClickEventHandler = (function () {
  function ClickEventHandler(map, origin) {
    this.origin = origin;
    this.map = map;
    this.map.addListener("click", this.handleClick.bind(this));
  }
  ClickEventHandler.prototype.handleClick = function (event) {
    console.log("You clicked on: " + event.latLng);
    console.log(event)
    if ("placeId" in event) { //POI
      console.log(event)
      console.log("You clicked on place:" + event.placeId);
      event.stop(); //fa fare la chiamata di default se non stoppiamo. 
      if (event.placeId) {
        this.openInfoBox(event.placeId, event.latLng);
      }
    }
  };

  ClickEventHandler.prototype.openInfoBox = function (placeId, latLng) {
    var content = ""
    console.log("DIOASNGOIAD")
    for (var i = 0; i < roadmap.stages.length; i++) {
      console.log("test")
      if (roadmap.stages[i].placeId == placeId) {
        content += roadmap.stages[i].durata + "\n";
        console.log(roadmap.stages[i])
      }
    }
    if (content == "") {
      content = "not in roadmap. possiamo mettere qua quello che vogliamo"
    }
    infoWindow = new google.maps.InfoWindow({
      content: content
    });
    infoWindow.setPosition(latLng);
    infoWindow.open(map);
  };
  return ClickEventHandler;
}());
