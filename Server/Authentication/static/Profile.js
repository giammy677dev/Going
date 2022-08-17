
  window.onload=function(){
    document.getElementById("Default").click();
    
    var x=get_data();
  };

  function get_data(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/getDataUser', true);

    xhr.onload = function (event) {
      const r = JSON.parse(event.target.responseText);
      
      console.log(r.ok);
      if (r.ok == true) {
        alert("Ho i dati di " + username)
      }
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        username: username,
        password: password
    }));
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