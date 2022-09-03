const numeroRoadmapCreate = 50;
const numeroRoadmapSeguite = 10;
const numeroCommenti = 10;
const numeroRecensioni = 10;
var testoAchievement = '';
var immagineAchievement = '';

window.onload = function () {
  getRoadmapAchievementsPopup();
};

document.addEventListener('dbMarkerClicked', (e) => { ClickEventHandler.prototype.openInfoBox(e.placeId, e.latLng); }, false);

document.addEventListener('receivedUserInfo', (e) => {
  if (e.logged) {
    id_user = e.user
    username = e.username
    document.getElementById("segnal_rm").setAttribute("onclick", "segnalaRoadmap(" + roadmapId + ")")
    getPreferredFavouriteStatusByUserByRoadmap(id_user, roadmapId);
  }

  drawCommentiERecensioni()
}, false);


function drawVisualFavouriteSeguitaBottoni(roadmap_id) {
  var favouriteObj = document.getElementById("favorite")
  var checkedObj = document.getElementById("checked")
  favouriteObj.innerHTML = '<img id="fav"  title="toglila tra i preferiti" onclick="pressLikeButton(' + roadmap_id + ',0)" src="/storage/star0.png"/>'
  checkedObj.innerHTML = '<img id="chk"  title="toglila tra le percorse" onclick="pressSeguitaButton(' + roadmap_id + ',0)" src="/storage/check0.png"/>'
}

document.addEventListener('receivedStageData', (e) => {
  drawVisualStage(e.stage);
}, false);

document.addEventListener('receivedRoadmapData', (e) => {

  var day = new Date(roadmap.dataCreazione)
  var minuti = convertHMS(roadmap.durata)
  var distance = convertKM(roadmap.distanza)
  
  if(roadmap.travelmode == "WALKING"){
    document.getElementById("distanza").innerText = ' 🚶 ' + distance;
  }
  else{
    document.getElementById("distanza").innerText = ' 🚗 ' + distance;
  }

  document.getElementById("titolo").innerText = roadmap.titolo
  document.getElementById("data").innerText = ' 🗓 ' + day.getDate() + "/" + (day.getMonth()+1) + "/" + day.getFullYear()
  document.getElementById("durata").innerText = ' ⏱ ' + minuti;
  document.getElementById("citta").innerText = ' 🏙 ' + roadmap.localita
  document.getElementById("utente").innerText = ' 👤 ' + roadmapCreator
  document.getElementById("descrizione").innerText = roadmap.descrizione
  document.getElementById("rating").innerHTML += roadmap.punteggio != null ? generateRating(roadmap.punteggio, 35, 'auto') : ""
  drawVisualFavouriteSeguitaBottoni(roadmap.id)
}, false);


//isMe permette di customizzare la recensione o il commento esteticamente in base al flag se sei tu o no.
// per come è pensato, i tuoi commenti e recensioni vanno tutti al top grazie all'if in drawCommentiERecensioni()

//popups for recensioni e commenti

function openRecensioniPopup(roadmap_id,value) {
  if (user_id > 0) { //loggato. qua va il popup per aggiungere recensioni
    //createRecensione(roadmap_id,"test",5)
  } else {
    //classico popup di login
  }
}

function openCommentoPopup(roadmap_id,value) {
  if (user_id > 0) { //loggato. qua va il popup per aggiungere commenti
    //createCommento(roadmap_id,"messaggio commento")
  } else {
    //classico popup di login
  }
}

function pressLikeButton(roadmap_id, value) {
  if (user_id > 0) { //loggato. qua va il popup per aggiungere commenti
    setRoadmapAsFavourite(roadmap_id, value)
  } else {
    console.log("non sei loggato")
    //classico popup di login
  }
}

function pressSeguitaButton(roadmap_id, value) {
  if (user_id > 0) { //loggato. qua va il popup per aggiungere commenti
    setRoadmapAsSeguita(roadmap_id, value)
  } else {
    console.log("non sei loggato")
    //classico popup di login
  }
}

//build di HTML di recensione e commento

function generateRecensione(recensione, isMe) {
  recensioneObj = ""
  console.log(recensione)
  date = new Date(recensione.dataPubblicazione);
  const dataPubblicazione = ' 🗓 ' + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
  const cocksHtml = generateRating(recensione.valutazione, 25) //cursore?
  recensioneObj = '<div class="recensione" id="recensione' + recensione.idRecensione + '"><div class="datirec" id="datirec' + recensione.idRecensione + '"><a class="boxclose" id="segn' + recensione.idRecensione + '" title="segnala recensione" onclick="openSegnRec(' + recensione.idRecensione + ')">⚠️</a><div class="valutazione" id="valutazione' + recensione.idRecensione + '">' + cocksHtml + '</div><div class="whoRec" id="whoRec">' + ' 👤' + recensione.username + '</div><div class="data_pub" id="data_pub_recensione' + recensione.idRecensione + '">' + dataPubblicazione + '</div></div><div class="opinione" id="opinione' + recensione.idRecensione + '">' + recensione.opinione + '</div></div>'
  recensioneObj += '<div class="popup_segnal" id="segnal_rec' + recensione.idRecensione + '"><label>Inserisci motivazione (opzionale)</label><input type="text" id="motiv_rec' + recensione.idRecensione + '"></input><div onclick="segnalaRec(' + recensione.idRecensione + ')"  class="btn">Segnala</div><div class="btn" onclick="closeSegnRec(' + recensione.idRecensione + ')">Chiudi</div></div>'
  return recensioneObj
}

function generateCommento(commento, isMe) {
  console.log(commento)
  var commentoObj = '<a class="boxclose" id="segn' + commento.idCommento + '" title="segnala commento" onclick=""openSegnCom(' + commento.idCommento + ')">⚠️</a>'

  if (commento.idUtente == user_id) { // commento.id bro???
    commentoObj += '<a class="boxclose" id="update' + commento.idCommento + '" title="modifica commento" onclick="updPreview(' + commento.idCommento + ')">🔄</a><a class="boxclose" id="deleteCom' + commento.idCommento + '" title="elimina commento" onclick="deleteCom(' + commento.idCommento + ')">❌</a>'
  }
  var date = new Date(commento.dataPubblicazione)
  const dataPubblicazione = ' 🗓 ' + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
  commentoObj = '<div class="commento" id="commento' + commento.idCommento + '"><div class="daticomm" id="daticomm' + commento.idCommento + '"><div class="text_commento" value="' + commento.testo + '" id="text_commento' + commento.idCommento + '">' + commento.testo + '</div> ' + commentoObj + '<div class="whoCom" id="whoCom">' + ' 👤' + commento.username + '</div><div class="data_pub" id="data_pub_commento' + commento.idCommento + '">' + dataPubblicazione + '</div></div></div>'
  commentoObj += '<div class="popup_segnal" id="segnal_com' + commento.idCommento + '"><label>Inserisci motivazione (opzionale)</label><input type="text" id="motiv_com' + commento.idCommento + '"></input><div onclick="m(' + commento.idCommento + ')"  class="btn">Segnala</div><div class="btn" onclick="closeSegnCom(' + commento.idCommento + ')">Chiudi</div></div>'
  return commentoObj
}

function generateRating(punteggio, grandezza, cursore) {
  /*prendo tutto il numero intero e stampo i cock pieni
    verifico poi se c'è parte decimale faccio il controllo e decido se aggiungere un cocktail pieno o mezzo
    verifico se ho fatto riferimento a 5 elementi, in caso contrario arrivo a 5 mettendo cocktail vuoti*/

  const html_cocktailPieno = '<img src="/storage/cocktailPieno.png" style="width:' + grandezza + 'px;height: ' + grandezza + 'px; cursor: ' + cursore + ';">'
  const html_cocktailMezzo = '<img src="/storage/cocktailMezzo.png" style="width:' + grandezza + 'px;height: ' + grandezza + 'px;cursor: ' + cursore + ';">'
  const html_cocktailVuoto = '<img src="/storage/cocktailVuotoPiccolo.png" style="width:' + grandezza + 'px;height: ' + grandezza + 'px;cursor: ' + cursore + ';">'
  var ratingObj = ""
  var counterStamp = 0;

  if (Number.isInteger(punteggio)) {
    for (var iteratorInt = 0; iteratorInt < punteggio; iteratorInt++) {
      counterStamp++;
      ratingObj += html_cocktailPieno
    }
  } else {
    for (var iteratorInt = 1; iteratorInt < punteggio; iteratorInt++) {  //iteratorInt parte da 1 così da non inserire interi fino a 0.75
      counterStamp++;
      ratingObj += html_cocktailPieno
    }

    //Inizio controllo sul decimale
    var decimal = punteggio - Math.floor(punteggio);
    decimal = decimal.toFixed(2);

    if (decimal >= 0.25 && decimal < 0.75) {
      ratingObj += html_cocktailMezzo
      counterStamp++;
    }
    else if (decimal >= 0.75) {
      ratingObj += html_cocktailPieno
      counterStamp++;
    }
  }

  while (counterStamp < 5) {
    counterStamp++;
    ratingObj += html_cocktailVuoto
  }
  return ratingObj
}

//stampare/modificare/rimuovere da HTML gli oggetti

function drawVisualStage(stage) {
  document.getElementById('lines').innerHTML += '<div class="dot" id="dot">' + parseInt(stage.reachTime) / 60 + '</div><div class="line" id="line"></div>'
  document.getElementById('cards').innerHTML += '<div class="card" id="card"> <h4>' + stage.nome + '</h4><p>' + stage.indirizzo + ' con durata di sosta: ' + stage.durata + ' min </p>'
}

function drawVisualRecensione(recensione, isMe) {
  if (isMe) { //è tuo
    document.getElementById("recensioni").innerHTML += generateRecensione(recensione, true)
  } else {
    document.getElementById("recensioni").innerHTML = generateRecensione(recensione, false) + document.getElementById("recensioni").innerHTML
  }
}

function drawVisualCommento(commento, isMe) {
  if (isMe) { //tuo commento va sopra
    document.getElementById("commenti").innerHTML += generateCommento(commento, true)
  } else {
    document.getElementById("commenti").innerHTML = generateCommento(commento, false) + document.getElementById("commenti").innerHTML
  }
}

function removeVisualCommento(idCommento) {
  //'<div class="commento" id="commento'+commento.idCommento+'">
  document.getElementById('commento' + idCommento).remove();
}

function updateVisualCommento(idCommento, messaggio, dataPubblicazione) {
  document.getElementById('text_commento' + idCommento).innerText = messaggio;
  document.getElementById('data_pub_commento' + idCommento).innerText = dataPubblicazione;
}

function removeVisualRecensione(idRecensione) {
  document.getElementById('recensione' + idRecensione).remove();
  //<div class="recensione" id="recensione'+recensione.idRecensione+'">
}

function updateVisualRecensione(idRecensione, messaggio, dataPubblicazione, valutazione) {
  document.getElementById('opinione' + idRecensione).innerText = messaggio;
  document.getElementById('data_pub_recensione' + idRecensione).innerText = dataPubblicazione;
  document.getElementById('valutazione' + idRecensione).innerHTML = generateRating(valutazione, 25)
}

//richiesta backend di commenti e recensioni


function drawCommentiERecensioni() { //prende da backend i commenti e recensioni e li stampa a video. nome da cambiare
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/getCommentiRecensioni?id=' + roadmapId, true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);
    const lengthRecensioni = r.data.recensioni.length
    const lengthCommenti = r.data.commenti.length

    if (r.ok) {
      if (lengthRecensioni > 0) {
        const recensioni = r.data.recensioni
        recensioni.forEach(recensione => {
          drawVisualRecensione(recensione, recensione.idUtente == user_id);
        });
      }
      else {
        const html_recvuoto = '<h4 style="font-style: italic;">Non sono state ancora scritte recensioni per questa roadmap</h4>'
        document.getElementById("recensioni").innerHTML += html_recvuoto
      }

      if (lengthCommenti > 0) {
        const commenti = r.data.commenti
        commenti.forEach(commento => {
          drawVisualCommento(commento, commento.idUtente == user_id);

        });
      }
      else {
        const html_comvuoto = '<h4 style="font-style: italic;">Non sono stati ancora scritti commenti per questa roadmap</h4>'
        document.getElementById("commenti").innerHTML += html_comvuoto
      }
    }
    else {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.send();
}

function getPreferredFavouriteStatusByUserByRoadmap(user_id, roadmap_id) {
  var favouriteObj = document.getElementById("favorite")
  var checkedObj = document.getElementById("checked") //roadmap "seguita"
  var xhr = new XMLHttpRequest();
  xhr.open("GET", '/getPreferredFavouriteStatusByUserByRoadmap?user_id=' + user_id + '&roadmap_id=' + roadmap_id, true);
  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);
    if (r.ok) {
      favouriteObj.innerHTML = '<img id="fav"  title="toglila tra i preferiti" onclick="setRoadmapAsFavourite(' + roadmap_id + "," + Math.abs(r.data.preferita - 1) + ')" src="/storage/star' + r.data.preferita + '.png" style="width:50px; height:50px;cursor: pointer;">'
      checkedObj.innerHTML = '<img id="chk"  title="toglila tra le percorse" onclick="setRoadmapAsSeguita(' + roadmap_id + "," + Math.abs(r.data.seguita - 1) + ')" src="/storage/check' + r.data.seguita + '.png" style="width:50px; height:50px;cursor: pointer;">'
    }
  }
  xhr.send();
}

function setRoadmapAsFavourite(roadmap_id, value) {
  //chiamate a db, con user, roadmap per inserire value la se c'è riga, se no update
  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/setRoadmapAsFavourite', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    console.log(r)
    if (r.ok) {
      //uscita
      console.log("messo ", value, "in preferite")
      const prec_value = value
      var html
      if (value == 1) {
        value = 0
        html = '<img id="fav" title="toglila tra le preferite" onclick="setRoadmapAsFavourite(' + roadmap_id + "," + value + ')"src="/storage/star' + prec_value + '.png" style="width:50px; height:50px;cursor: pointer;"></img>'
      } else {
        value = 1
        html = '<img id="fav" title="inseriscila tra le preferite" onclick="setRoadmapAsFavourite(' + roadmap_id + "," + value + ')"src="/storage/star' + prec_value + '.png" style="width:50px; height:50px;cursor: pointer;"></img>'
      }
      var posto_fav = document.getElementById("favorite")
      posto_fav.innerHTML = html

    }
    else {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    roadmap_id: roadmapId,
    newStatus: value
  }));
}

//funzioni su recensione backend

function createRecensione(roadmap_id, opinione, valutazione) {
  //var opinione = document.getElementById("us_rec").value
  console.log("test")

  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/createRecensione', true);
  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);

    if (r.ok) {
      const newRecensione = { idRecensione: r.data.idRecensione, dataPubblicazione: r.data.now, valutazione: valutazione, username: username, opinione: opinione } //da popolare..
      drawVisualRecensione(newRecensione, true) //isme!
      getReviewAchievementPopup(r.data.numRecensioniUtente);
    }
    else {
      console.log(r)
      alert("Problemi col db")
    }
  }

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    roadmapId: roadmap_id,
    opinione: opinione || "",
    valutazione: valutazione
  }));
}

function updateRecensione(idRecensione, opinione, valutazione) {
  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/updateRecensione', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    console.log(r)
    if (r.ok == true) {

      updateVisualRecensione(idRecensione, opinione, r.data.now, valutazione)
      alert("Compliementi!!")
    }
    else if (r.ok == false) {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    idRecensione: idRecensione,
    opinione: opinione,
    valutazione: valutazione
  }));
}

function deleteRecensione(idRecensione) {
  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/deleteRecensione', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    if (r.ok) {
      removeVisualRecensione(idRecensione);
      //qui va cambiata dinamicamente la pagina elimiando il commento con codice idCommento 
      alert("Complimenti!!")

    }
    else {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    idRecensione: idRecensione
  }));
}

//funzioni su commento backend

function createCommento(roadmap_id, messaggioCommento) {
  //var messaggioCommento = document.getElementById("us_com").value
  if (messaggioCommento == "") return;

  var xhr = new XMLHttpRequest();
  xhr.open("POST", '/createCommento', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    console.log(r)
    if (r.ok) {
      //in realtà la data pubblicazione va presa dal server. per il momento ho messo quella locale
      //altrimenti se si hanno gmt diversi non c'è coerenza con la View dell'utente.
      const newCommento = { idCommento: r.data.idCommento, dataPubblicazione: r.data.now, testo: messaggioCommento, username: username }
      console.log(newCommento)
      drawVisualCommento(newCommento, true);
      getCommentAchievementPopup(r.data);
    }
    else {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    roadmap_id: roadmap_id,
    messaggio: messaggioCommento
  }));
}

function updateCommento(id_commento, messaggioCommento) {
  var xhr = new XMLHttpRequest();
  //testo = document.getElementById(id).value
  xhr.open("POST", '/updateCommento', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    //il ritortno di update commento non ha senso
    console.log(r)
    if (r.ok == true) {
      updateVisualCommento(id_commento, messaggioCommento, r.data.now);
      //qui va cambiata dinamicamente la pagina aggiungendo il commento con codice idCommento 
      alert("Compliementi!!")
      //location.reload() no refresh!
    }
    else if (r.ok == false) {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    idCommento: id_commento,
    messaggio: messaggioCommento
  }));
}

function deleteCommento(idCommento) {

  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/deleteCommento', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    console.log(r)
    if (r.ok == true) {
      removeVisualCommento(idCommento);
      //qui va cambiata dinamicamente la pagina elimiando il commento con codice idCommento 
      alert("Complimenti!!")

    }
    else if (r.ok == false) {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    idCommento: idCommento
  }));
}

//segnalazioni 

function segnalaOggetto(user_id, recensione_id, motivazione, tipo) {
  /*testo = document.getElementById("motiv_rec" + id_rec).value
  if (testo == ' ' || testo == '') {
    testo = null
  }*/

  /*
  TYPE ENUM:
    1 : ROADMAP
    2 : PROFILO
    3: RECENSIONE 
    4 : COMMENTO
    */
  var xhr = new XMLHttpRequest();
  xhr.open("POST", '/report', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    console.log(r)
    if (r.ok) {
      alert("Hai segnalato questo oggetto!!")
    }
    else {
      console.log(r)
      alert("Hai già segnalato!")
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    tipo: tipo, //hardcoded type 3 = recensione
    idOggetto: recensione_id,
    motivazione: motivazione
  }));
}

//achievements

function getRoadmapAchievementsPopup() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", '/getRoadmapAchievementsPopup', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    if (r.ok == true) {
      if (r.data == numeroRoadmapCreate) {
        testoAchievement = "Hai creato " + numeroRoadmapCreate + " roadmap!";
        immagineAchievement = '/storage/achievements/topRoadmapper.png'
        showVisualAchievementPopup(testoAchievement, immagineAchievement);
      }
      else if (r.data == 1) {
        testoAchievement = "Hai creato la tua prima roadmap!";
        immagineAchievement = '/storage/achievements/roadmap.png'
        showVisualAchievementPopup(testoAchievement, immagineAchievement);
      }
    }
  }

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    id_user: id_user
  }));
}

function showVisualAchievementPopup(testo, immagine) {
  document.getElementById('textAchievement').innerText = testo;
  document.getElementById('imageAchievement').setAttribute('src', immagine);
  document.getElementById("roadmapAchievementPopup").style.display = "block";
  setTimeout(closeVisualPopup, 5000);
}

function setRoadmapAsSeguita(roadmap_id, value) {
  //chiamate a db, con user, roadmap per inserire value la se c'è riga, se no update
  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/setRoadmapAsSeguita', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    console.log(r)
    if (r.ok == true) {
      console.log("messo ", value, "in seguite")
      getFollowedRoadmapAchievementPopup(r.data)
      const prec_value = value;
      var html;
      if (value == 1) {
        value = 0
        html = '<img id="chk" title="toglila tra le percorse" onclick="setRoadmapAsSeguita(' + roadmap_id + "," + value + ')"src="/storage/check' + prec_value + '.png" style="width:50px; height:50px;cursor: pointer;"></img>'
      }
      else {
        value = 1
        html = '<img id="chk" title="inseriscila tra le percorse" onclick="setRoadmapAsSeguita(' + roadmap_id + "," + value + ')"src="/storage/check' + prec_value + '.png" style="width:50px; height:50px;cursor: pointer;"></img>'
      }
      var posto_chk = document.getElementById("checked")

      posto_chk.innerHTML = html
    }
    else {
      console.log(r)
      alert("Problemi col db")
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    roadmap_id: roadmap_id,
    newStatus: value
  }));
}

function getFollowedRoadmapAchievementPopup(numeroRoadmapSeguiteDaQuery) { //NON VIENE CHIAMATA DA NESSUNA PARTE, chiedere a Matteo dove inserirla
  if (numeroRoadmapSeguiteDaQuery == numeroRoadmapSeguite) {
    testoAchievement = "Hai completato " + numeroRoadmapSeguite + " roadmap!";
    immagineAchievement = '/storage/achievements/followRoadmap.png';
    showVisualAchievementPopup(testoAchievement, immagineAchievement);
  }
}

function getReviewAchievementPopup(numeroRecensioniDaQuery) {
  if (numeroRecensioniDaQuery == numeroRecensioni) {
    testoAchievement = "Hai lasciato " + numeroRecensioni + " recensioni!";
    immagineAchievement = '/storage/achievements/review.png';
    showVisualAchievementPopup(testoAchievement, immagineAchievement);
  }
}

function getCommentAchievementPopup(numeroCommentiDaQuery) {
  if (numeroCommentiDaQuery == numeroCommenti) {
    testoAchievement = "Hai lasciato " + numeroCommenti + " commenti!";
    immagineAchievement = '/storage/achievements/comment.png';
    showVisualAchievementPopup(testoAchievement, immagineAchievement);
  }
}

function closeVisualPopup() {
  document.getElementById("roadmapAchievementPopup").style.display = "none";
}

//other

function forkaggio() {
  location.href = "/create?id=" + roadmapId
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