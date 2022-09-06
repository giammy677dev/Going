// Script Avvio Pagina
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id')
const number_create = 50;
const number_seguite = 10;
const number_reviews = 10;
const number_commenti = 10;
var isMe = 0;

document.addEventListener('receivedUserInfo', (e) => {
  roadmap_create()
  roadmap_seguite()
  roadmap_preferite()
  getAchievements()
}, false);

// Script Dati Utente

function data_user() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/getDataUser?id=' + id, true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);

    var age = Age(r.data.info.birthdate);

    if (r.ok == true) {
      console.log(r.data);
      document.getElementById("info_username").innerText = r.data.info.username;
      document.getElementById("info_email").innerHTML = "<span class=\"Evidenziato\">Email: </span>" + r.data.info.email;
      document.getElementById("info_birthdate").innerHTML = "<span class=\"Evidenziato\">Età: </span>" + age;
      document.getElementById("avatar").src = r.data.info.avatar;

      if (r.data.isMe) {
        isMe = 1;
        document.getElementById('avatar').setAttribute("onclick", "load_choice_avatar()");
        document.getElementById("avatar").addEventListener('mouseover', MouseUp);
        document.getElementById("avatar").addEventListener('mouseout', MouseOut);

        if (r.data.info.isAdmin) {
          var bottone = document.createElement("input");
          bottone.setAttribute("type", "button");
          bottone.setAttribute("id", "adminButton");
          bottone.setAttribute("onclick", "location.href = \"/adminPanel\"");
          bottone.setAttribute("value", "Pannello Admin");
          document.getElementById("infoBox").appendChild(bottone);
        }
      }
    }
  }

  xhr.send();
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

function MouseUp() {
  document.getElementById("avatar").style.setProperty("cursor", "pointer");
  document.getElementById("avatar").style.setProperty("filter", "brightness(105%)");
  document.getElementById("avatar").style.setProperty("border", "8px solid #31e8f1");
}

function MouseOut() {
  document.getElementById("avatar").style.setProperty("cursor", "default");
  document.getElementById("avatar").style.setProperty("filter", "brightness(100%)");
  document.getElementById("avatar").style.setProperty("border", "8px solid #2bcad2");
}

function convertHMS(value) {
  const sec = parseInt(value, 10); // convert value to number if it's string
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
  let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
  // add 0 if value < 10; Example: 2 => 02
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }
  return hours + ':' + minutes + ':' + seconds; // Return is HH : MM : SS
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

function roadmap_create() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/getRoadmapCreate?id=' + id, true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);

    if (r.ok == true) {
      console.log(isMe);

      document.getElementById("bar_roadmap_create").click()
      document.getElementById("bar_roadmap_create").innerText = "Roadmap Create (" + r.data.roadmaps.length + ")";

      for (var i = 0; i < r.data.roadmaps.length; i++) {
        var spazioRoadmap = document.createElement("div");
        spazioRoadmap.setAttribute("id", "divRoadmap_0_" + i);
        spazioRoadmap.setAttribute("class", "divRoadmap");
        spazioRoadmap.setAttribute("onMouseOver", "conMouseOver(\"" + spazioRoadmap.id + "\")");
        spazioRoadmap.setAttribute("onMouseOut", "conMouseOut(\"" + spazioRoadmap.id + "\")");
        document.getElementById("Section_Roadmap_Create").appendChild(spazioRoadmap);

        var tempo = convertHMS(r.data.roadmaps[i].durata);
        var km = convertKM(r.data.roadmaps[i].distanza);

        var html = "<a title=\"visualizza Roadmap\"href=\"view_roadmap?id=" + r.data.roadmaps[i].id + "\">";

        if (r.data.roadmaps[i].isPublic) {
          html += "<span class=\"inEvidenza\">🌎 " + r.data.roadmaps[i].titolo + "</span><\a>"
        } else {
          html += "<span class=\"inEvidenza\">🔒 " + r.data.roadmaps[i].titolo + "</span><\a>"
        }

        html += "<p><span class=\"interno\">🏙 " + r.data.roadmaps[i].localita + "</span>" +
          " <span class=\"interno\">⏱ " + tempo + " </span>";

        if (r.data.roadmaps[i].travelMode == "WALKING") {
          html += "<span class=\"interno\">🚶‍♂️ " + km + "</span>";
        }
        else {
          html += "<span class=\"interno\">🚗 " + km + "</span>";
        }

        document.getElementById("divRoadmap_0_" + i).innerHTML = html;
        printCocktail(r.data.roadmaps[i].punteggio, 0, i);

        if (isMe) {
          var paragrafo = document.createElement("p");
          paragrafo.setAttribute("class", "paragrafobutton");
          var bottone = document.createElement("input");
          bottone.setAttribute("type", "button");
          bottone.setAttribute("class", "roadmapbutton");
          bottone.setAttribute("onclick", "DeleteRoadmapCreata(" + i + "," + r.data.roadmaps[i].id + ")");
          bottone.setAttribute("value", "Elimina Roadmap");
          paragrafo.appendChild(bottone);
          spazioRoadmap.appendChild(paragrafo);
        }

      }
    }
  }
  xhr.send();
}

function roadmap_seguite() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/getRoadmapSeguite?id=' + id, true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);

    if (r.ok == true) {
      document.getElementById("bar_roadmap_seguite").innerText = "Roadmap Seguite (" + r.data.roadmaps.length + ")";

      for (var i = 0; i < r.data.roadmaps.length; i++) {
        var spazioRoadmap = document.createElement("div");
        spazioRoadmap.setAttribute("id", "divRoadmap_1_" + i);
        spazioRoadmap.setAttribute("class", "divRoadmap");
        spazioRoadmap.setAttribute("onMouseOver", "conMouseOver(\"" + spazioRoadmap.id + "\")");
        spazioRoadmap.setAttribute("onMouseOut", "conMouseOut(\"" + spazioRoadmap.id + "\")");
        document.getElementById("Section_Roadmap_Seguite").appendChild(spazioRoadmap);

        var tempo = convertHMS(r.data.roadmaps[i].durata);
        var km = convertKM(r.data.roadmaps[i].distanza);

        var html = "<a title=\"visualizza Roadmap\"href=\"view_roadmap?id=" + r.data.roadmaps[i].id + "\">";

        if (r.data.roadmaps[i].isPublic) {
          html += "<span class=\"inEvidenza\">🌎 " + r.data.roadmaps[i].titolo + "</span><\a>"
        } else {
          html += "<span class=\"inEvidenza\">🔒 " + r.data.roadmaps[i].titolo + "</span><\a>"
        }

        html += "<p><span class=\"interno\">🏙 " + r.data.roadmaps[i].localita + "</span>" +
          " <span class=\"interno\">⏱ " + tempo + " </span>";

        if (r.data.roadmaps[i].travelMode == "WALKING") {
          html += "<span class=\"interno\">🚶‍♂️ " + km + "</span>";
        }
        else {
          html += "<span class=\"interno\">🚗 " + km + "</span>";
        }


        document.getElementById("divRoadmap_1_" + i).innerHTML = html;
        printCocktail(r.data.roadmaps[i].punteggio, 1, i);

        if (isMe) {
          var paragrafo = document.createElement("p");
          paragrafo.setAttribute("class", "paragrafobutton");
          var bottone = document.createElement("input");
          bottone.setAttribute("type", "button");
          bottone.setAttribute("class", "roadmapbutton");
          bottone.setAttribute("onclick", "rimuoviRoadmapDaiSeguiti(" + i + "," + r.data.roadmaps[i].id + ")");
          bottone.setAttribute("value", "Rimuovi da Seguite");
          paragrafo.appendChild(bottone);
          spazioRoadmap.appendChild(paragrafo);
        }

      }
    }
  }

  xhr.send();
}

function roadmap_preferite() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/getRoadmapPreferite?id=' + id, true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);

    if (r.ok == true) {
      document.getElementById("bar_roadmap_preferite").innerText = "Roadmap Preferite (" + r.data.roadmaps.length + ")";

      for (var i = 0; i < r.data.roadmaps.length; i++) {
        var spazioRoadmap = document.createElement("div");
        spazioRoadmap.setAttribute("id", "divRoadmap_2_" + i);
        spazioRoadmap.setAttribute("class", "divRoadmap");
        spazioRoadmap.setAttribute("onMouseOver", "conMouseOver(\"" + spazioRoadmap.id + "\")");
        spazioRoadmap.setAttribute("onMouseOut", "conMouseOut(\"" + spazioRoadmap.id + "\")");
        document.getElementById("Section_Roadmap_Preferite").appendChild(spazioRoadmap);

        var tempo = convertHMS(r.data.roadmaps[i].durata);
        var km = convertKM(r.data.roadmaps[i].distanza);

        var html = "<a title=\"visualizza Roadmap\"href=\"view_roadmap?id=" + r.data.roadmaps[i].id + "\">";

        if (r.data.roadmaps[i].isPublic) {
          html += "<span class=\"inEvidenza\">🌎 " + r.data.roadmaps[i].titolo + "</span><\a>"
        } else {
          html += "<span class=\"inEvidenza\">🔒 " + r.data.roadmaps[i].titolo + "</span><\a>"
        }

        html += "<p><span class=\"interno\">🏙 " + r.data.roadmaps[i].localita + "</span>" +
          " <span class=\"interno\">⏱ " + tempo + " </span>";

        if (r.data.roadmaps[i].travelMode == "WALKING") {
          html += "<span class=\"interno\">🚶‍♂️ " + km + "</span>";
        }
        else {
          html += "<span class=\"interno\">🚗 " + km + "</span>";
        }

        document.getElementById("divRoadmap_2_" + i).innerHTML = html;
        printCocktail(r.data.roadmaps[i].punteggio, 2, i);

        if (isMe) {
          var paragrafo = document.createElement("p");
          paragrafo.setAttribute("class", "paragrafobutton");
          var bottone = document.createElement("input");
          bottone.setAttribute("type", "button");
          bottone.setAttribute("class", "roadmapbutton");
          bottone.setAttribute("onclick", "rimuoviRoadmapDaiPreferiti(" + i + "," + r.data.roadmaps[i].id + ")");
          bottone.setAttribute("value", "Rimuovi da Preferite");
          paragrafo.appendChild(bottone);
          spazioRoadmap.appendChild(paragrafo);
        }
      }
    }
  }

  xhr.send();
}

// Funzioni Calcolo Cocktail, conMouseOver, conMouseOut

function printCocktail(media_valutazioni, number, i) {
  /* prendo tutto il numero intero e stampo i cocktail pieni
    verifico poi se c'è parte decimale faccio il controllo e decido se aggiungere un cocktail pieno o mezzo
    verifico se ho fatto riferimento a 5 elementi, in caso contrario arrivo a 5 mettendo cocktail vuoti*/
  var spazioRoadmap = document.getElementById("divRoadmap_" + number + "_" + i);
  const html_cocktailPieno = '<img src="/storage/cocktailPieno.png" style="width:25px;height: 25px;">'
  const html_cocktailMezzo = '<img src="/storage/cocktailMezzo.png" style="width:25px;height: 25px;">'
  const html_cocktailVuoto = '<img src="/storage/cocktailVuotoPiccolo.png" style="width:25px;height: 25px;">'
  var counterStamp = 0;
  if (media_valutazioni != null) {
    if (Number.isInteger(media_valutazioni)) {
      for (var iteratorInt = 0; iteratorInt < media_valutazioni; iteratorInt++) {
        spazioRoadmap.insertAdjacentHTML("beforeend", html_cocktailPieno);
        counterStamp++;
      }
    }
    else {
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

//text-shadow: -1px 0 #000000, 0 1px #000000, 1px 0 #000000, 0 -1px #000000;

function conMouseOver(target) {
  document.getElementById(target).firstChild.childNodes[0].style.fontSize = '30px';
  for (i = 2; i <= 6; i++) {
    document.getElementById(target).childNodes[i].style.width = '35px';
    document.getElementById(target).childNodes[i].style.height = '35px';
  }
  if (isMe) {
    document.getElementById(target).childNodes[7].style.setProperty("display", "block");
  }
}

function conMouseOut(target) {
  document.getElementById(target).firstChild.childNodes[0].style.fontSize = '20px';
  for (i = 2; i <= 6; i++) {
    document.getElementById(target).childNodes[i].style.width = '25px';
    document.getElementById(target).childNodes[i].style.height = '25px';
  }
  if (isMe) {
    document.getElementById(target).childNodes[7].style.setProperty("display", "none");
  }
}


function DeleteRoadmapCreata(number, roadmap_id) {
  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/deleteRoadmap', true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);
    if (r.ok == true) {
      document.getElementById("bar_roadmap_create").innerText = "Roadmap Create (" + r.data + ")";
      document.getElementById("divRoadmap_0_" + number).remove();
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.send(JSON.stringify({ roadmap_id: roadmap_id }));
}

function rimuoviRoadmapDaiSeguiti(number, roadmap_id) {
  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/setRoadmapAsSeguita', true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);
    if (r.ok == true) {
      document.getElementById("bar_roadmap_seguite").innerText = "Roadmap Seguite (" + r.data + ")";
      document.getElementById("divRoadmap_1_" + number).remove();
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.send(JSON.stringify({ roadmap_id: roadmap_id, newStatus: 0 }));
}

function rimuoviRoadmapDaiPreferiti(number, roadmap_id) {
  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/setRoadmapAsFavourite', true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);
    if (r.ok == true) {
      document.getElementById("bar_roadmap_preferite").innerText = "Roadmap Preferite (" + r.data + ")";
      document.getElementById("divRoadmap_2_" + number).remove();
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');


  xhr.send(JSON.stringify({ roadmap_id: roadmap_id, newStatus: 0 }));
}

// Script Cambiamento Avatar

function load_choice_avatar() {
  document.getElementById('choice_avatar').style.display = 'block'
  document.getElementById("avatar_choice").setAttribute("src", document.getElementById("avatar").getAttribute("src"))
}

function choice(id) {
  //document.getElementById("avatar_choice").setAttribute("src", "/storage/avatar/" + id + ".png")
  document.getElementById("avatar_choice").setAttribute("src", "/storage/avatar/Avatar_" + id + ".png")
  document.getElementById("avatar_choice").setAttribute("avatarIndex", id)
}

function change_avatar() {
  //var new_avatar = document.getElementById("avatar_choice").getAttribute("src");
  var new_avatar_index = document.getElementById("avatar_choice").getAttribute("avatarIndex");
  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/updateAvatar', true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);

    if (r.ok == true) {
      document.getElementById("avatar").setAttribute("src", "/storage/avatar/Avatar_" + new_avatar_index + ".png");
      document.getElementById('choice_avatar').style.display = 'none';
    }
  }

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    new_avatar_index: Number(new_avatar_index)
  }));
}

// Script Creazione Blocco Roadmap

function open_view(pageName, elmnt, color) {
  // Hide all elements with class="tabcontent" by default */
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove the background color of all tablinks/buttons
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }

  // Show the specific tab content
  document.getElementById(pageName).style.display = "block";

  // Add the specific color to the button used to open the tab content
  elmnt.style.backgroundColor = color;
}

//Script Achievements

function getAchievements() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/getAchievements?id=' + id, true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);

    if (r.ok) {
      if (r.data.createdRoadmapCount >= 1) {
        document.getElementById("firstRoadmapAchievement").setAttribute("src", "/storage/achievements/roadmap.png");
      }

      if (r.data.createdRoadmapCount >= number_create) {
        document.getElementById("roadmapAchievement").setAttribute("src", "/storage/achievements/topRoadmapper.png");
      }

      if (r.data.followedRoadmapCount >= number_seguite) {
        document.getElementById("followedRoadmapAchievement").setAttribute("src", "/storage/achievements/followRoadmap.png");
      }

      if (r.data.reviewedRoadmapCount >= number_reviews) {
        document.getElementById("reviewAchievement").setAttribute("src", "/storage/achievements/review.png");
      }

      if (r.data.commentedRoadmapCount >= number_commenti) {
        document.getElementById("commentAchievement").setAttribute("src", "/storage/achievements/comment.png");
      }
    }
  }

  xhr.send();
}