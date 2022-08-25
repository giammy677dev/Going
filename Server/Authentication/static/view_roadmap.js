var ok = false
var id_user = null
var id_rm = 0
window.onload = function () {
  check()
  loading_roadmap()
  check_nw()
  loadRecCom()
}



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
        document.getElementById("titolo").innerText = roadmap.titolo
        document.getElementById("data").innerText = ' 🗓 ' + day.getDate() + "/" + month + "/" + day.getFullYear()
        document.getElementById("durata").innerText = ' ⏱ ' + roadmap.durataComplessiva
        document.getElementById("citta").innerText = ' 🏙 ' + roadmap.localita
        document.getElementById("utente").innerText = ' 👤 ' + user[0].username
        document.getElementById("descrizione").innerText = roadmap.descrizione
        funcCoktail(roadmap.punteggio)

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
      ok = true
      id_user = r.whoLog
      //vedere se ha commenti/recensioni/cuore/seguito
    }
    else if (r.ok == false) {
      ok = false
      document.getElementById("container_funz").style.display = "none"
      document.getElementById("roadmap_funz").innerHTML = "<h2>Registrati o effettua il Log In per lasciare una tua impressione sulla roadmap come hanno fatto questi Roadmappers!<h2>"
    }
  }
  xhr.send();
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
          const dataHtml=' 🗓 ' + day.getDate() + "/" + month + "/" + day.getFullYear()
          const cocksHtml=cocksPrint(recensioni[i].valutazione)
          var opHtml=recensioni[i].opinione
          if(opHtml==null){
            opHtml='<div style="font-style: italic;">Non è stata lasciata una opinione insieme alla valutazione</div>'
          }
          const html_rec = '<div class="recensione" id="recensione"><div class="datirec" id="datirec'+recensioni[i].idRecensione+'"><div class="valutazione" id="valutazione">' + cocksHtml + '</div><div class="whoRec" id="whoRec">'+' 👤'+recensioni[i].username + '</div><div class="data_pub" id="data_pub">' + dataHtml + '<a id="segn' +recensioni[i].idRecensione + '" class="boxclose"  title="segnala commento" onclick="segnalaRec(' + recensioni[i].idRecensione + ')">x</a></div></div><div class="opinione" id="opinione">' + opHtml + '</div></div>'
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
          const dataHtml=' 🗓 ' + day.getDate() + "/" + month + "/" + day.getFullYear()
          const html_com = '<div class="commento" id="commento"><div class="daticomm" id="daticomm'+commenti[i].idCommento+'"><div class="text_commento" id="text_commento">' + commenti[i].testo + '<a class="boxclose" id="segn' +commenti[i].idCommento  + '" title="segnala commento" onclick="segnalaComm(' + commenti[i].idCommento + ')">x</a></div><div class="whoCom" id="whoCom">'+' 👤'+commenti[i].username + '</div><div class="data_pub" id="data_pub">' + dataHtml + '</div></div></div>'
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

function cocksPrint(punteggio){
  /* prendo tutto il numero intero e stampo i cock pieni
     verifico poi se c'è parte decimale faccio il controllo e decido se aggiungere un cocktail pieno o mezzo
     verifico se ho fatto riferimento a 5 elementi, in caso contrario arrivo a 5 mettendo cocktail vuoti*/
    
     const html_codePieno = '<img src="/storage/cocktailPieno.png" style="width:25px;height: 25px;">'
     const html_codeMezzo = '<img src="/storage/cocktailMezzo.png" style="width:25px;height: 25px;">'
     const html_codeVuoto = '<img src="/storage/cocktailVuotoPiccolo.png" style="width:25px;height: 25px;">'
     var html_globale=" "
     var counterStamp = 0;
     if (Number.isInteger(punteggio)) {
       for (var iteratorInt = 0; iteratorInt < punteggio; iteratorInt++) {
         counterStamp++;
         html_globale+=html_codePieno
       }
     } else {
       for (var iteratorInt = 1; iteratorInt < punteggio; iteratorInt++) {  //iteratorInt parte da 1 così da non inserire interi fino a 0.75
         counterStamp++;
         html_globale+=html_codePieno
       }
       //inizio controllo sul decimale
       const decimalStr = punteggio.toString().split('.')[1];
       var decimal = Number(decimalStr);
       if (decimal < 2.5) {
       } else if (decimal > 7.5) {
         html_globale+=html_codePieno
         counterStamp++;
       } else {
         html_globale+=html_codeMezzo
         counterStamp++;
       }
     }
     while (counterStamp < 5) {
       counterStamp++;
       html_globale+=html_codeVuoto
     }
     return html_globale
}

function rating(value) {
  if (ok == true) {
    var points = value
    //insert in tabella con id utente per la valutazione
    alert("Punteggio: " + points)

  }
  else {
    alert("non sei loggato!!! non puoi lasciare un reting")
  }
}

function heart() {

  if (ok == true) {
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
  else {
    alert("non sei loggato!!! non puoi metterla tra i preferiti")
  }
}

function checked() {
  if (ok == true) {
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
  } else {
    alert("non sei loggato!!! non puoi dirci di averla fatta sta roadmap")
  }
}
function funcCoktail(punteggio) {
  /* prendo tutto il numero intero e stampo i cock pieni
   verifico poi se c'è parte decimale faccio il controllo e decido se aggiungere un cocktail pieno o mezzo
   verifico se ho fatto riferimento a 5 elementi, in caso contrario arrivo a 5 mettendo cocktail vuoti*/
  var spazioRoadmap = document.getElementById("rating");
  const html_codePieno = '<img src="/storage/cocktailPieno.png" style="width:25px;height: 25px;">'
  const html_codeMezzo = '<img src="/storage/cocktailMezzo.png" style="width:25px;height: 25px;">'
  const html_codeVuoto = '<img src="/storage/cocktailVuotoPiccolo.png" style="width:25px;height: 25px;">'
  var counterStamp = 0;
  if (Number.isInteger(punteggio)) {
    for (var iteratorInt = 0; iteratorInt < punteggio; iteratorInt++) {
      spazioRoadmap.insertAdjacentHTML("beforeend", html_codePieno);
      counterStamp++;
    }
  } else {
    for (var iteratorInt = 1; iteratorInt < punteggio; iteratorInt++) {  //iteratorInt parte da 1 così da non inserire interi fino a 0.75
      spazioRoadmap.insertAdjacentHTML("beforeend", html_codePieno);
      counterStamp++;
    }
    //inizio controllo sul decimale
    const decimalStr = punteggio.toString().split('.')[1];
    var decimal = Number("0."+decimalStr);
    if (decimal < 0.25) {
    } else if (decimal > 0.75) {
      spazioRoadmap.insertAdjacentHTML("beforeend", html_codePieno);
      counterStamp++;
    } else {
      spazioRoadmap.insertAdjacentHTML("beforeend", html_codeMezzo);
      counterStamp++;
    }
  }
  while (counterStamp < 5) {
    spazioRoadmap.insertAdjacentHTML("beforeend", html_codeVuoto);
    counterStamp++;
  }
}
function saveRec() {
  //save in db
  console.log("Sito in costruzione: id: ", id_user)
}
function saveCom() {
  //save in db
  console.log("Sito in costruzione: id: ", id_user)
}

function forkaggio() {
  location.href = "/create?roadmap_id=" + id_rm
}
function segnalaRec(id_rec){
  alert(id_rec)
}
function segnalaComm(id_comm){
  alert(id_comm)
}