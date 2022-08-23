
  // Script Avvio Pagina

  //fare che quando carica prende rispetto a chi sta sull'url
  window.onload=function(){
    document.getElementById("bar_roadmap_create").click();
    data_user();
    number_roadmap_create();
    number_roadmap_seguite();
    number_roadmap_preferite();
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

  function number_roadmap_create(){ 
    var xhr = new XMLHttpRequest();

    xhr.open("GET", '/getNumberRoadmapCreate', true);
  
    xhr.onload = function (event) {
      const r = JSON.parse(event.target.responseText);

      if (r.ok == true) {
          document.getElementById("bar_roadmap_create").innerText = "Roadmap Create ("+r.data[0].Roadmap_Utente+")";
      }
    }

    xhr.send();
  }

  function number_roadmap_seguite(){ 
    var xhr = new XMLHttpRequest();

    xhr.open("GET", '/getNumberRoadmapSeguite', true);
  
    xhr.onload = function (event) {
      const r = JSON.parse(event.target.responseText);

      if (r.ok == true) {
          document.getElementById("bar_roadmap_seguite").innerText = "Roadmap Seguite ("+r.data[0].Roadmap_Seguite+")";
      }
    }

    xhr.send();
  }

  function number_roadmap_preferite(){ 
    var xhr = new XMLHttpRequest();

    xhr.open("GET", '/getNumberRoadmapPreferite', true);
  
    xhr.onload = function (event) {
      const r = JSON.parse(event.target.responseText);

      if (r.ok == true) {
          document.getElementById("bar_roadmap_preferite").innerText = "Roadmap Preferite ("+r.data[0].Roadmap_Preferite+")";
      }
    }

    xhr.send();
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