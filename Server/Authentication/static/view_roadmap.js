var ok_in_rm = false
var id_user = null
var id_rm = 0
var insert_rec = 1
var points = 0
var commento_utente
var pref
var fatta
const numeroRoadmapCreate = 50;
const numeroRoadmapSeguite = 10;
const numeroCommenti = 10;
const numeroRecensioni = 10;
var testoAchievement = '';
var immagineAchievement = '';

window.onload = function () {
  check()
  if (document.referrer == 'http://localhost:3000/create') { //bisogna fare quando di viene da una roadmap forkata con link---> http://localhost:3000/create?roadmap_id=154
    getRoadmapAchievementsPopup();
  }
};

document.addEventListener('dbMarkerClicked', (e) => { ClickEventHandler.prototype.openInfoBox(e.placeId, e.latLng); }, false);

document.addEventListener('receivedUserInfo', (e) => {

  if (e.logged) {

    ok_in_rm = true
    id_user = e.user


    getCommmentsReviewByUserRoad(id_user, id_rm)
  }
  else {
    document.getElementById("container_funz").style.display = "none"
    document.getElementById("roadmap_funz").innerHTML = "<h2>Registrati o effettua il Log In per lasciare una tua impressione sulla roadmap come hanno fatto questi Roadmappers!<h2>"
  }

}, false);

document.addEventListener('receivedStageData', (e) => {

  var stage = e.stage;
  //console.log(stage)
  if (stage.reachTime != null) {
    var time = parseInt(stage.reachTime) / 60;
  } else {
    time = ''
  }

  //console.log(time)

  document.getElementById('lines').innerHTML += '<div class="dot" id="dot">' + time + '</div><div class="line" id="line"></div>'
  document.getElementById('cards').innerHTML += '<div class="card" id="card"> <h4>' + stage.nome + '</h4><p>' + stage.indirizzo + ' con durata di sosta: ' + stage.durata + ' min </p>'

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
    const html_cock = printBicchieri(roadmap.punteggio, 35, 'auto')
    document.getElementById("rating").innerHTML += html_cock
  }

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


function getCommmentsReviewByUserRoad(id_user, id_rm) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", '/getCommmentsReviewByUserRoad?id_user=' + id_user + '&id_rm=' + id_rm, true);

  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    //console.log(r.data)
    const chk_rec = r.data.results_rec.length
    const chk_com = r.data.results_com.length
    pref = r.data.pref
    fatta = r.data.fatta
    var posto_fav = document.getElementById("favorite")
    var posto_fatta = document.getElementById("checked")

    if (pref == 0 || pref == null) {
      posto_fav.innerHTML = '<img id="fav"  title="inseriscila tra i preferiti" onclick="favorite(1)"src="/storage/star0.png" style="width:50px; height:50px;cursor: pointer;"></img>'
    } else if (pref == 1) {
      posto_fav.innerHTML = '<img id="fav"  title="toglila tra i preferiti" onclick="favorite(0)" src="/storage/star' + pref + '.png" style="width:50px; height:50px;cursor: pointer;">'
    }

    if (fatta == 0 || fatta == null) {
      posto_fatta.innerHTML = '<img id="chk"  title="inseriscila tra le percorse" src="/storage/check0.png" onclick="checked(1)" style="width:50px; height:50px;cursor: pointer;">'
    } else if (fatta == 1) {
      posto_fatta.innerHTML = '<img id="chk"  title="toglila tra le percorse" onclick="checked(0)" src="/storage/check' + fatta + '.png" style="width:50px; height:50px;cursor: pointer;">'
    }

    if (r.ok == true) {
      if (chk_rec == 1) {
        const rec = r.data.results_rec[0]
        insert_rec = 0
        document.getElementById("save_recbtn").innerHTML = "Modifica/Aggiungi opinione/valutazione";
        const rating = rec.valutazione

        points = rating
        const html_cock = printBicchieri(rating, 50, 'auto')

        document.getElementById("cocks").innerHTML = html_cock
        var elements = document.getElementById('cocks').children;
        for (let i = 0; i < elements.length; i++) {
          elements[i].setAttribute("id", i)
          elements[i].setAttribute("title", i + 1)

        }

        if (rec.opinione != null) {
          document.getElementById("lab_rec").innerHTML = "La tua recensione!"
          document.getElementById("us_rec").innerText = rec.opinione
          document.getElementById("us_rec").setAttribute("disabled", "disabled")
          document.getElementById("save_recbtn").setAttribute("onclick", "abilitaRec()");
        }
      }
      if (chk_rec == 0) {
        const html_cock = '<img id="0" onclick="rating(0)" src="/storage/cocktailVuotoPiccolo.png" style="width:50px;height: 50px;cursor:pointer;"><img id="1" onclick="rating(1)" src="/storage/cocktailVuotoPiccolo.png" style="width:50px;height: 50px;cursor:pointer;"><img id="2" onclick="rating(2)" src="/storage/cocktailVuotoPiccolo.png" style="width:50px;height: 50px;cursor:pointer;"><img id="3" onclick="rating(3)" src="/storage/cocktailVuotoPiccolo.png" style="width:50px;height: 50px;cursor:pointer;"><img id="4" onclick="rating(4)" src="/storage/cocktailVuotoPiccolo.png" style="width:50px;height: 50px;cursor:pointer;">'
        document.getElementById("cocks").innerHTML = html_cock
      }


      if (chk_com > 0) {
        //console.log(r.data.results_com)
        commento_utente = r.data.results_com
        //console.log(commento_utente)


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
  var elements = document.getElementById('cocks').children;
  for (let i = 0; i < elements.length; i++) {

    elements[i].setAttribute('style', 'width: 50px; height: 50px;cursor: pointer')
    elements[i].setAttribute('onclick', 'rating(' + i + ')')
  }
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
    console.log(r.data.commenti)
    console.log(r.data.recensioni)
    if (r.ok == true) {
      if (len_rc !== undefined && len_rc > 0) {
        const recensioni = r.data.recensioni
        //console.log("quante recensioni:", recensioni)
        for (let i = 0; i < len_rc; i++) {
          var day = new Date(recensioni[i].dataPubblicazione)
          var month = day.getMonth() + 1;
          const dataHtml = ' 🗓 ' + day.getDate() + "/" + month + "/" + day.getFullYear()
          const cocksHtml = printBicchieri(recensioni[i].valutazione, 25)
          var opHtml = recensioni[i].opinione
          if (opHtml == null) {
            opHtml = '<div style="font-style: italic;">Non è stata lasciata una opinione insieme alla valutazione</div>'
          }
          const html_rec = '<div class="recensione" id="recensione"><div class="datirec" id="datirec' + recensioni[i].idRecensione + '"><a class="boxclose" id="segn' + recensioni[i].idRecensione + '" title="segnala recensione" onclick="segnalaRec(' + recensioni[i].idRecensione + ')">⚠️</a><div class="valutazione" id="valutazione">' + cocksHtml + '</div><div class="whoRec" id="whoRec">' + ' 👤' + recensioni[i].username + '</div><div class="data_pub" id="data_pub">' + dataHtml +'</div></div><div class="opinione" id="opinione">' + opHtml + '</div></div>'
          document.getElementById("recensioni").innerHTML += html_rec
        }
      }
      else {
        const html_recvuoto = '<h4 style="font-style: italic;">Non sono state ancora scritte recensioni per questa roadmap</h4>'
        document.getElementById("recensioni").innerHTML += html_recvuoto
      }
      if (len_com !== undefined && len_com > 0) {
        const commenti = r.data.commenti
        //console.log("quanti commenti:", commenti)
        for (let i = 0; i < len_com; i++) {
          var html_funz = '<a class="boxclose" id="segn' + commenti[i].idCommento + '" title="segnala commento" onclick="segnalaComm(' + commenti[i].idCommento + ')">⚠️</a>'
          if (r.data.commenti[i].id == id_user) {
            console.log(commenti[i].testo)
            html_funz += '<a class="boxclose" id="update' + commenti[i].idCommento + '" title="modifica commento" onclick="updPreview('+commenti[i].idCommento + ')">🔄</a><a class="boxclose" id="deleteCom' + commenti[i].idCommento + '" title="elimina commento" onclick="deleteCom(' + commenti[i].idCommento + ')">❌</a>'
          }
          var day = new Date(commenti[i].dataPubblicazione)
          var month = day.getMonth() + 1;
          const dataHtml = ' 🗓 ' + day.getDate() + "/" + month + "/" + day.getFullYear()
          const html_com = '<div class="commento" id="commento"><div class="daticomm" id="daticomm' + commenti[i].idCommento + '"><div class="text_commento" value="'+commenti[i].testo+'" id="text_commento'+commenti[i].idCommento +'">' + commenti[i].testo + '</div> ' + html_funz + '<div class="whoCom" id="whoCom">' + ' 👤' + commenti[i].username + '</div><div class="data_pub" id="data_pub">' + dataHtml + '</div></div></div>'
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

function printBicchieri(punteggio, grandezza, cursore) {
  /* prendo tutto il numero intero e stampo i cock pieni
     verifico poi se c'è parte decimale faccio il controllo e decido se aggiungere un cocktail pieno o mezzo
     verifico se ho fatto riferimento a 5 elementi, in caso contrario arrivo a 5 mettendo cocktail vuoti*/

  const html_cocktailPieno = '<img src="/storage/cocktailPieno.png" style="width:' + grandezza + 'px;height: ' + grandezza + 'px; cursor: ' + cursore + ';">'
  const html_cocktailMezzo = '<img src="/storage/cocktailMezzo.png" style="width:' + grandezza + 'px;height: ' + grandezza + 'px;cursor: ' + cursore + ';">'
  const html_cocktailVuoto = '<img src="/storage/cocktailVuotoPiccolo.png" style="width:' + grandezza + 'px;height: ' + grandezza + 'px;cursor: ' + cursore + ';">'
  var html_globale = " "
  var counterStamp = 0;
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

  while (counterStamp < 5) {
    counterStamp++;
    html_globale += html_cocktailVuoto
  }
  return html_globale
}

function rating(value) {
  points = value + 1
  const html_cock = printBicchieri(points, 50, 'pointer')
  document.getElementById("cocks").innerHTML = html_cock
  var elements = document.getElementById('cocks').children;
  for (let i = 0; i < elements.length; i++) {
    elements[i].setAttribute('onclick', 'rating(' + i + ')')
  }
}


function favorite(value) {
  //chiamate a db, con user, roadmap per inserire value la se c'è riga, se no update
  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/setFavorite', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    console.log(r)
    if (r.ok == true) {
      //uscita
      console.log("messo ", value, "in preferite")
      const prec_value = value
      var html
      if (value == 1) {
        value = 0
        html = '<img id="fav" title="toglila tra le preferite" onclick="favorite(' + value + ')"src="/storage/star' + prec_value + '.png" style="width:50px; height:50px;cursor: pointer;"></img>'
      } else {
        value = 1
        html = '<img id="fav" title="inseriscila tra le preferite" onclick="favorite(' + value + ')"src="/storage/star' + prec_value + '.png" style="width:50px; height:50px;cursor: pointer;"></img>'
      }
      var posto_fav = document.getElementById("favorite")
      posto_fav.innerHTML = html

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
    favorite: value
  }));
}

function checked(value) {
  //chiamate a db, con user, roadmap per inserire value la se c'è riga, se no update
  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/setChecked', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    console.log(r)
    if (r.ok == true) {
      console.log("messo ", value, "in seguite")
      getFollowedRoadmapAchievementPopup(r.data.numeroRoadmapSeguite)
      const prec_value = value;
      var html;
      if (value == 1) {
        value = 0
        html = '<img id="chk" title="toglila tra le percorse" onclick="checked(' + value + ')"src="/storage/check' + prec_value + '.png" style="width:50px; height:50px;cursor: pointer;"></img>'
      }
      else {
        value = 1
        html = '<img id="chk" title="inseriscila tra le percorse" onclick="checked(' + value + ')"src="/storage/check' + prec_value + '.png" style="width:50px; height:50px;cursor: pointer;"></img>'
      }
      var posto_chk = document.getElementById("checked")

      posto_chk.innerHTML = html
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
    check: value
  }));


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
          //alert("Compliementi!!")
          //location.reload()
          getReviewAchievementPopup(r.data.numRecensioni);
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


//if numero_commenti > X--> mostra achievements

function saveCom() {
  com = document.getElementById("us_com").value
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;

  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/setCommento', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    console.log(r)
    if (r.ok == true) {
      //alert("Complimenti!!")
      //location.reload()
      getCommentAchievementPopup(r.data);
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
function deleteCom(commento) {

  var xhr = new XMLHttpRequest();
  
  xhr.open("POST", '/deleteCommento', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    console.log(r)
    if (r.ok == true) {
      alert("Complimenti!!")
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
    commento: commento,
    roadmap: id_rm
  }));
}
function updPreview(id) {
  console.log(id)
  var txt
  for(let i=0;i<commento_utente.length;i++){
    if(commento_utente[i].idCommento==id){
      txt=commento_utente[i].testo
    }
  }
  
  console.log(txt)
  document.getElementById('daticomm' + id).innerHTML = ' <input type="text" style="width=90%" id="'+id+'"value="' + txt + '"size="20" /><a class="boxclose" id="update' + id + '" title="salva modifiche commento" onclick="updateCom(' + id + ')">✔️</a>'
  
}
function updateCom(id) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  var xhr = new XMLHttpRequest();
  testo=document.getElementById(id).value
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
    id_com: id,
    mod_com: testo,
    day: today
  }));
}
function writeCom() {
  document.getElementById("write_new_com").setAttribute("style", "display:block")
  document.getElementById("write_com").innerHTML = "Salva il tuo commento"
  document.getElementById("write_com").setAttribute("onclick", "saveCom()");
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

function getRoadmapAchievementsPopup() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", '/getRoadmapAchievementsPopup', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    if (r.ok == true) {
      if (r.data == numeroRoadmapCreate) {
        testoAchievement = "Hai creato " + numeroRoadmapCreate + " roadmap!";
        immagineAchievement = '/storage/achievements/topRoadmapper.png'
        showAchievementPopup(testoAchievement, immagineAchievement);
      }
      else if (r.data == 1) {
        testoAchievement = "Hai creato la tua prima roadmap!";
        immagineAchievement = '/storage/achievements/roadmap.png'
        showAchievementPopup(testoAchievement, immagineAchievement);
      }
    }
  }

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    id_user: id_user
  }));
}

function getFollowedRoadmapAchievementPopup(numeroRoadmapSeguiteDaQuery) { //NON VIENE CHIAMATA DA NESSUNA PARTE, chiedere a Matteo dove inserirla
  if (numeroRoadmapSeguiteDaQuery == numeroRoadmapSeguite) {
    testoAchievement = "Hai completato " + numeroRoadmapSeguite + " roadmap!";
    immagineAchievement = '/storage/achievements/followRoadmap.png';
    showAchievementPopup(testoAchievement, immagineAchievement);
  }
}

function getReviewAchievementPopup(numeroRecensioniDaQuery) {
  if (numeroRecensioniDaQuery == numeroRecensioni) {
    testoAchievement = "Hai lasciato " + numeroRecensioni + " recensioni!";
    immagineAchievement = '/storage/achievements/review.png';
    showAchievementPopup(testoAchievement, immagineAchievement);
  }
}

function getCommentAchievementPopup(numeroCommentiDaQuery) {
  if (numeroCommentiDaQuery == numeroCommenti) {
    testoAchievement = "Hai lasciato " + numeroCommenti + " commenti!";
    immagineAchievement = '/storage/achievements/comment.png';
    showAchievementPopup(testoAchievement, immagineAchievement);
  }
}

function showAchievementPopup(testo, immagine) {
  document.getElementById('textAchievement').innerText = testo;
  document.getElementById('imageAchievement').setAttribute('src', immagine);
  document.getElementById("roadmapAchievementPopup").style.display = "block";
  setTimeout(closePopup, 5000);
}

function closePopup() {
  document.getElementById("roadmapAchievementPopup").style.display = "none";
}