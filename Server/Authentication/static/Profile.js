
  // Script Avvio Pagina

  //fare che quando carica prende rispetto a chi sta sull'url
  window.onload=function(){
    document.getElementById("bar_roadmap_create").click();
    data_user();
    roadmap_create();
    roadmap_seguite();
    roadmap_preferite();
  };

  // Script Dati Utente

  function data_user(){ 
    var xhr = new XMLHttpRequest();

    xhr.open("GET", '/getDataUser', true);
  
    xhr.onload = function (event) {
      const r = JSON.parse(event.target.responseText);

      var day = new Date(r.data[0].birthdate);
      var month = day.getMonth()+1;
   
      if (r.ok == true) {
          document.getElementById("info_username").innerText = r.data[0].username;
          document.getElementById("info_email").innerText = "Email = "+r.data[0].email;
          document.getElementById("info_birthdate").innerText = "Compleanno = "+day.getDate()+"/"+month+"/"+day.getFullYear();
          document.getElementById("avatar").src = r.data[0].avatar;
      }
    }

    xhr.send();
  }

  // Script Numero di Roadmap create,seguite e preferite dall'utente

  function roadmap_create(){ 
    var xhr = new XMLHttpRequest();

    xhr.open("GET", '/getRoadmapCreate', true);
  
    xhr.onload = function (event) {
      const r = JSON.parse(event.target.responseText);

      if (r.ok == true) {
          document.getElementById("bar_roadmap_create").innerText = "Roadmap Create ("+r.data.length+")";

          for (var i = 0; i < r.data.length; i++) {
            var spazioRoadmap = document.createElement("div");
            spazioRoadmap.setAttribute("id","divRoadmap_0_" + i);
            spazioRoadmap.setAttribute("class","divRoadmap");
            spazioRoadmap.setAttribute("onMouseOver","conMouseOver(\"" + spazioRoadmap.id + "\")");
            spazioRoadmap.setAttribute("onMouseOut","conMouseOut(\"" + spazioRoadmap.id + "\")");
            document.getElementById("Section_Roadmap_Create").appendChild(spazioRoadmap);
            spazioRoadmap.innerHTML ="<a title=\"visualizza Roadmap\"href=\"view_roadmap?id="+r.data[i].id+"\"><span class=\"inEvidenza\">" + r.data[i].titolo + "</span></a>" + 
            "<p><span class=\"interno\">🏙 " + r.data[i].localita  + "</span><span class=\"interno\">⏱" + r.data[i].durataComplessiva + "</span></p>";
            funcCoktail(r.data[i].punteggio,0,i);
          }
      }
    }

    xhr.send();
  }

  function roadmap_seguite(){ 
    var xhr = new XMLHttpRequest();

    xhr.open("GET", '/getRoadmapSeguite', true);
  
    xhr.onload = function (event) {
      const r = JSON.parse(event.target.responseText);

      if (r.ok == true) {
          document.getElementById("bar_roadmap_seguite").innerText = "Roadmap Seguite ("+r.data.length+")";

          for (var i = 0; i < r.data.length; i++) {
            var spazioRoadmap = document.createElement("div");
            spazioRoadmap.setAttribute("id","divRoadmap_1_" + i);
            spazioRoadmap.setAttribute("class","divRoadmap");
            spazioRoadmap.setAttribute("onMouseOver","conMouseOver(\"" + spazioRoadmap.id + "\")");
            spazioRoadmap.setAttribute("onMouseOut","conMouseOut(\"" + spazioRoadmap.id + "\")");
            document.getElementById("Section_Roadmap_Seguite").appendChild(spazioRoadmap);
            spazioRoadmap.innerHTML ="<a title=\"visualizza Roadmap\"href=\"view_roadmap?id="+r.data[i].id+"\"><span class=\"inEvidenza\">" + r.data[i].titolo + "</span></a>" + 
            "<p><span class=\"interno\">🏙 " + r.data[i].localita  + "</span><span class=\"interno\">⏱" + r.data[i].durataComplessiva + "</span></p>";
            funcCoktail(r.data[i].punteggio,1,i);
          }
      }
    }

    xhr.send();
  }

  function roadmap_preferite(){ 
    var xhr = new XMLHttpRequest();

    xhr.open("GET", '/getRoadmapPreferite', true);
  
    xhr.onload = function (event) {
      const r = JSON.parse(event.target.responseText);

      if (r.ok == true) {
          document.getElementById("bar_roadmap_preferite").innerText = "Roadmap Preferite ("+r.data.length+")";

          for (var i = 0; i < r.data.length; i++) {
            console.log(i)
            var spazioRoadmap = document.createElement("div");
            spazioRoadmap.setAttribute("id","divRoadmap_2_" + i);
            spazioRoadmap.setAttribute("class","divRoadmap");
            spazioRoadmap.setAttribute("onMouseOver","conMouseOver(\"" + spazioRoadmap.id + "\")");
            spazioRoadmap.setAttribute("onMouseOut","conMouseOut(\"" + spazioRoadmap.id + "\")");
            document.getElementById("Section_Roadmap_Preferite").appendChild(spazioRoadmap);
            spazioRoadmap.innerHTML ="<a title=\"visualizza Roadmap\"href=\"view_roadmap?id="+r.data[i].id+"\"><span class=\"inEvidenza\">" + r.data[i].titolo + "</span></a>" + 
            "<p><span class=\"interno\">🏙 " + r.data[i].localita  + "</span><span class=\"interno\">⏱" + r.data[i].durataComplessiva + "</span></p>";
            funcCoktail(r.data[i].punteggio,2,i);
          }
      }
    }

    xhr.send();
  }

  // Funzioni Calcolo Cocktail, conMouseOver, conMouseOut

  function funcCoktail(media_valutazioni,number,i){
    /* prendo tutto il numero intero e stampo i cock pieni
      verifico poi se c'è parte decimale faccio il controllo e decido se aggiungere un cocktail pieno o mezzo
      verifico se ho fatto riferimento a 5 elementi, in caso contrario arrivo a 5 mettendo cocktail vuoti*/
      var spazioRoadmap = document.getElementById("divRoadmap_"+number+"_"+ i);
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

  // Cambio Profilo Provvisorio

  function load_choice_avatar(){
    document.getElementById('choice_avatar').style.display='block'
    document.getElementById("avatar_choice").setAttribute("src",document.getElementById("avatar").getAttribute("src"))
  }

  function choice(id){
    document.getElementById("avatar_choice").setAttribute("src","/avatar/"+id+".png")
  }

  function change_avatar(){
    var new_avatar = document.getElementById("avatar_choice").getAttribute("src");
    
    var xhr = new XMLHttpRequest();

    xhr.open("POST", '/updateAvatar', true);
  
    xhr.onload = function (event) {
      const r = JSON.parse(event.target.responseText);

      if (r.ok == true) {
        document.getElementById("avatar").setAttribute("src",new_avatar);
        document.getElementById('choice_avatar').style.display='none';
      }
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      new_avatar: new_avatar
    }));
  }

  // Script Blocco Roadmap

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