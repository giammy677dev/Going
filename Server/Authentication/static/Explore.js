window.onload=function(){
    fromMain()
    check()
  };
function richiestaDBRoadmap(ricerca) {
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/searchRoadmap?ricerca=' + ricerca, true);
    console.log("db roadmap",ricerca)
    xhr.onload = function (event) {
        console.log("onload db roadmap",ricerca)
        const r = JSON.parse(event.target.responseText);
        const result = r.data.results

        if (r.ok == true) {
            element = document.getElementById("numero_rm");
            if (element != null) {
                element.outerHTML = "";
            }

            var elements = document.getElementsByClassName("item");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""

            }

            elements = document.getElementsByClassName("link_rm");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""
            }

            element = document.getElementById("result_rm");
            if (element != null) {
                element.outerHTML = "";
            }
            if (result.length > 0) {
                const html_code = '<div id="numero_rm" style="text-align: center; font-size:25px"><h4>Ricerca roadmap ha prodotto <div>' + result.length + ' risultato/i</div></h4></div>'
                const posto = document.getElementById("pop_res_rm");
                posto.insertAdjacentHTML("beforeend", html_code)
                for (var i = 0; i < result.length; i++) {
                    const html_star=funcCoktail(result[i].punteggio)
                    const html_code = '<a class="link_rm" href="/view_roadmap?id=' + result[i].id + '"><div class="item">'+result[i].titolo+'<br>🏙' +result[i].localita+'<br>⏱'+result[i].durataComplessiva+'min<br>'+html_star
                    const posto = document.getElementById("items");
                    posto.insertAdjacentHTML("beforeend", html_code)
                }
            }
            else {
                const html_code = '<div id="result_rm" style="font-size:25px">Nothing roadmap con ricerca: ' + ricerca + '!!!</div>'
                const posto = document.getElementById("items");
                posto.insertAdjacentHTML("beforeend", html_code)
            }

        }
        else if (r.ok == false) {
            console.log(r)
            alert("Problemi col db")
        }
    }
    xhr.send()
    console.log("fine db rm",ricerca)
}
function richiestaDBUtente(ricerca) {
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/searchUser?username=' + ricerca, true);
    xhr.onload = function (event) {

        const r = JSON.parse(event.target.responseText);
        const result = r.data.results

        if (r.ok == true) {


            element = document.getElementById("numero");
            if (element != null) {
                element.outerHTML = "";
            }

            var elements = document.getElementsByClassName("item-user");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""

            }

            elements = document.getElementsByClassName("link_user");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""
            }

            element = document.getElementById("result");
            if (element != null) {
                element.outerHTML = "";
            }

            if (result.length > 0) {
                const html_code = '<div id="numero" style="text-align: center; font-size:25px"><h4>Ricerca utenti ha prodotto <div>' + result.length + ' risultato/i</div></h4></div>'
                const posto = document.getElementById("pop_res");
                posto.insertAdjacentHTML("beforeend", html_code)
                for (var i = 0; i < result.length; i++) {
                    const html_code = '<a class="link_user" href="/profile?id=' + result[i].id + '"><div class="item-user" ><img src="/avatar/' + result[i].username + '" style="width:40px;height: 40px;"><br>' + result[i].username + '<br></div></a>'
                    const posto = document.getElementById("items-user");
                    posto.insertAdjacentHTML("beforeend", html_code)
                }
            }
            else {
                const html_code = '<div id="result" style="font-size:25px">Nothing con username ' + ricerca + '!!!</div>'
                const posto = document.getElementById("items-user");
                posto.insertAdjacentHTML("beforeend", html_code)
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
        alert(" campo  nullo")
    }
    else {
        
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
        richiestaDBUtente(ricerca)
        richiestaDBRoadmap(ricerca)
    }
}

function funcCoktail(punteggio) {
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