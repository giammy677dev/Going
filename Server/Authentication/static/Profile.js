// Script Avvio Pagina
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id')
const number_create = 50;
const number_seguite = 10;
const number_reviews = 10;
const number_commenti = 10;

document.addEventListener('receivedUserInfo', (e) => { 
  data_user(); 
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

    var day = new Date(r.data[0][0].birthdate);
    var month = day.getMonth() + 1;

    if (r.ok == true) {
      console.log(r.data);
      document.getElementById("info_username").innerText = r.data[0][0].username;
      document.getElementById("info_email").innerText = "Email = " + r.data[0][0].email;
      document.getElementById("info_birthdate").innerText = "Compleanno = " + day.getDate() + "/" + month + "/" + day.getFullYear();
      document.getElementById("avatar").src = r.data[0][0].avatar;

      if (r.data[1] == 1) {
        document.getElementById('button_choice_avatar').style.display = 'block';
      }
      else {
        document.getElementById('button_choice_avatar').style.display = 'none';
      }
    }
  }

  xhr.send();
}

// Script Numero di Roadmap create, seguite e preferite dall'utente

function roadmap_create() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/getRoadmapCreate?id=' + id, true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);

    if (r.ok == true) {
      document.getElementById("bar_roadmap_create").click()
      document.getElementById("bar_roadmap_create").innerText = "Roadmap Create (" + r.data[0].length + ")";

      for (var i = 0; i < r.data[0].length; i++) {
        var spazioRoadmap = document.createElement("div");
        spazioRoadmap.setAttribute("id", "divRoadmap_0_" + i);
        spazioRoadmap.setAttribute("class", "divRoadmap");
        spazioRoadmap.setAttribute("onMouseOver", "conMouseOver(\"" + spazioRoadmap.id + "\")");
        spazioRoadmap.setAttribute("onMouseOut", "conMouseOut(\"" + spazioRoadmap.id + "\")");
        document.getElementById("Section_Roadmap_Create").appendChild(spazioRoadmap);

        var html_string = "<a title=\"visualizza Roadmap\"href=\"view_roadmap?id=" + r.data[0][i].id + "\"><span class=\"inEvidenza\">" + r.data[0][i].titolo + "</span></a>" +
          "<p><span class=\"interno\">🏙 " + r.data[0][i].localita + "</span><span class=\"interno\">⏱" + r.data[0][i].durataComplessiva + "</span></p>"

        if (r.data[1] == 1 && r.data[0][i].isPublic == 0) {
          html_string += "<p><input type=\"button\" onclick=\"DeleteRoadmapCreata(" + i + "," + r.data[0][i].id + ")\" value=\"X\"></p> <p><span class=\"interno\">❗</span>";
        }
        else if (r.data[1] == 1 && r.data[0][i].isPublic == 1) {
          html_string += "<p><input type=\"button\" onclick=\"DeleteRoadmapCreata(" + i + "," + r.data[0][i].id + ")\" value=\"X\"></p>";
        }

        document.getElementById("divRoadmap_0_" + i).innerHTML = html_string;
        printCocktail(r.data[0][i].punteggio, 0, i);
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
      document.getElementById("bar_roadmap_seguite").innerText = "Roadmap Seguite (" + r.data[0].length + ")";

      for (var i = 0; i < r.data[0].length; i++) {
        var spazioRoadmap = document.createElement("div");
        spazioRoadmap.setAttribute("id", "divRoadmap_1_" + i);
        spazioRoadmap.setAttribute("class", "divRoadmap");
        spazioRoadmap.setAttribute("onMouseOver", "conMouseOver(\"" + spazioRoadmap.id + "\")");
        spazioRoadmap.setAttribute("onMouseOut", "conMouseOut(\"" + spazioRoadmap.id + "\")");
        document.getElementById("Section_Roadmap_Seguite").appendChild(spazioRoadmap);

        var html_string = "<a title=\"visualizza Roadmap\"href=\"view_roadmap?id=" + r.data[0][i].id + "\"><span class=\"inEvidenza\">" + r.data[0][i].titolo + "</span></a>" +
          "<p><span class=\"interno\">🏙 " + r.data[0][i].localita + "</span><span class=\"interno\">⏱" + r.data[0][i].durataComplessiva + "</span></p>"

        if (r.data[1] == 1 && r.data[0][i].isPublic == 0) {
          html_string += "<p><input type=\"button\" onclick=\"updateRoadmapSeguite(" + i + "," + r.data[0][i].id + ")\" value=\"X\"></p> <p><span class=\"interno\">❗</span>";
        }

        else if (r.data[1] == 1 && r.data[0][i].isPublic == 1) {
          html_string += "<p><input type=\"button\" onclick=\"updateRoadmapSeguite(" + i + "," + r.data[0][i].id + ")\" value=\"X\"></p>";
        }

        document.getElementById("divRoadmap_1_" + i).innerHTML = html_string;
        printCocktail(r.data[0][i].punteggio, 1, i);
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
      document.getElementById("bar_roadmap_preferite").innerText = "Roadmap Preferite (" + r.data[0].length + ")";

      for (var i = 0; i < r.data[0].length; i++) {
        var spazioRoadmap = document.createElement("div");
        spazioRoadmap.setAttribute("id", "divRoadmap_2_" + i);
        spazioRoadmap.setAttribute("class", "divRoadmap");
        spazioRoadmap.setAttribute("onMouseOver", "conMouseOver(\"" + spazioRoadmap.id + "\")");
        spazioRoadmap.setAttribute("onMouseOut", "conMouseOut(\"" + spazioRoadmap.id + "\")");
        document.getElementById("Section_Roadmap_Preferite").appendChild(spazioRoadmap);

        var html_string = "<a title=\"visualizza Roadmap\"href=\"view_roadmap?id=" + r.data[0][i].id + "\"><span class=\"inEvidenza\">" + r.data[0][i].titolo + "</span></a>" +
          "<p><span class=\"interno\">🏙 " + r.data[0][i].localita + "</span><span class=\"interno\">⏱" + r.data[0][i].durataComplessiva + "</span></p>"

        if (r.data[1] == 1 && r.data[0][i].isPublic == 0) {
          html_string += "<p><input type=\"button\" onclick=\"updateRoadmapPreferite(" + i + "," + r.data[0][i].id + ")\" value=\"X\"></p> <p><span class=\"interno\">❗</span>";
        }

        else if (r.data[1] == 1 && r.data[0][i].isPublic == 1) {
          html_string += "<p><input type=\"button\" onclick=\"updateRoadmapPreferite(" + i + "," + r.data[0][i].id + ")\" value=\"X\"></p>";
        }

        document.getElementById("divRoadmap_2_" + i).innerHTML = html_string;
        printCocktail(r.data[0][i].punteggio, 2, i);
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

function conMouseOver(target) {
  document.getElementById(target).firstChild.childNodes[0].style.fontSize = '30px';
  for (i = 2; i <= 6; i++) {
    document.getElementById(target).childNodes[i].style.width = '35px';
    document.getElementById(target).childNodes[i].style.height = '35px';
  }
}

function conMouseOut(target) {
  document.getElementById(target).firstChild.childNodes[0].style.fontSize = '20px';
  for (i = 2; i <= 6; i++) {
    document.getElementById(target).childNodes[i].style.width = '25px';
    document.getElementById(target).childNodes[i].style.height = '25px';
  }
}


function DeleteRoadmapCreata(number, id) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/deleteRoadmapCreata?id=' + id, true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);
    if (r.ok == true) {
      document.getElementById("bar_roadmap_create").innerText = "Roadmap Create (" + r.data + ")";
      document.getElementById("divRoadmap_0_" + number).remove();
    }
  }

  xhr.send();
}

function updateRoadmapSeguite(number, id) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/updateRoadmapSeguite?id=' + id, true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);
    if (r.ok == true) {
      document.getElementById("bar_roadmap_seguite").innerText = "Roadmap Seguite (" + r.data + ")";
      document.getElementById("divRoadmap_1_" + number).remove();
    }
  }

  xhr.send();
}

function updateRoadmapPreferite(number, id) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/updateRoadmapPreferite?id=' + id, true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);
    if (r.ok == true) {
      document.getElementById("bar_roadmap_preferite").innerText = "Roadmap Seguite (" + r.data + ")";
      document.getElementById("divRoadmap_2_" + number).remove();
    }
  }

  xhr.send();
}

// Script Cambiamento Avatar

function load_choice_avatar() {
  document.getElementById('choice_avatar').style.display = 'block'
  document.getElementById("avatar_choice").setAttribute("src", document.getElementById("avatar").getAttribute("src"))
}

function choice(id) {
  document.getElementById("avatar_choice").setAttribute("src", "/avatar/" + id + ".png")
}

function change_avatar() {
  var new_avatar = document.getElementById("avatar_choice").getAttribute("src");

  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/updateAvatar', true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);

    if (r.ok == true) {
      document.getElementById("avatar").setAttribute("src", new_avatar);
      document.getElementById('choice_avatar').style.display = 'none';
    }
  }

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    new_avatar: new_avatar
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

    if (r.ok == true) {
      if (r.data[0] >= 1) {
        document.getElementById("firstRoadmapAchievement").setAttribute("src", "/storage/achievements/roadmap.png");
      }

      if (r.data[0] >= number_create) {
        document.getElementById("roadmapAchievement").setAttribute("src", "/storage/achievements/topRoadmapper.png");
      }

      if (r.data[1] >= number_seguite) {
        document.getElementById("followedRoadmapAchievement").setAttribute("src", "/storage/achievements/followRoadmap.png");
      }

      if (r.data[2] >= number_reviews) {
        document.getElementById("reviewAchievement").setAttribute("src", "/storage/achievements/review.png");
      }

      if (r.data[3] >= number_commenti) {
        document.getElementById("commentAchievement").setAttribute("src", "/storage/achievements/comment.png");
      }
    }
  }

  xhr.send();
}