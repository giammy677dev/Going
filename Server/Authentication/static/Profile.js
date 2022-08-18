
  // Script Avvio Pagina

  window.onload=function(){
    document.getElementById("Default").click();
    data_user();
    roadmap_user();
  };

  // Script Visualizzazione Data Corretta

  function correct_day(day){
    return day.substring(8,10)+"/"+day.substring(5,7)+"/"+day.substring(0,4)
  }

  // Vedere bene formato data

  // Script Dati Utente

  function data_user(){ 
    var xhr = new XMLHttpRequest();

    xhr.open("GET", '/getDataUser', true);
  
    xhr.onload = function (event) {
      const r = JSON.parse(event.target.responseText);

      if (r.ok == true) {
          document.getElementById("info_username").innerText = r.data[0].username;
          document.getElementById("info_email").innerText = "Email = "+r.data[0].email;
          document.getElementById("info_birthdate").innerText = "Compleanno = "+correct_day(r.data[0].birthdate);
          document.getElementById("avatar").src = "/avatar/"+r.data[0].username+".jpg";
      }
    }

    xhr.send();
  }

  // Script Roadmap Utente

  function roadmap_user(){ 
    var xhr = new XMLHttpRequest();

    xhr.open("GET", '/getRoadmapUser', true);
  
    xhr.onload = function (event) {
      const r = JSON.parse(event.target.responseText);

      if (r.ok == true) {
          document.getElementById("info_roadmap_user").innerText = "Roadmap Create = "+r.data[0].Roadmap_Utente;
      }
    }

    xhr.send();
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