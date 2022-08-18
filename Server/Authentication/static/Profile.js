
  window.onload=function(){
    document.getElementById("Default").click();
    data_user();
  };

  function data_user(){ 
    var xhr = new XMLHttpRequest();

    xhr.open("GET", '/getDataUser', true);
  
    xhr.onload = function (event) {
      const r = JSON.parse(event.target.responseText);
  
      if (r.ok == true) {
          document.getElementById("info_username").innerText = r.data[0].username;
          document.getElementById("info_email").innerText = r.data[0].email;
          document.getElementById("info_birthdate").innerText = r.data[0].birthdate;
      }
    }

    xhr.send();
}

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