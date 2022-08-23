var ok=false
var user_id=0

function check() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/getDataUser', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);


    if (r.ok == true) {
      console.log("sei loggato!!! con questo id", r.whoLog)
      console.log(r)
      ok=r.ok
      user_id=r.whoLog
      document.getElementById("image_topnav").setAttribute("src",r.data[0].avatar);

      var image = document.createElement("img");
      image.setAttribute("src","/storage/logoutTransp.png");
      image.setAttribute("display", "block");
      image.setAttribute("id", "image_topnav0");
      image.setAttribute("onclick","document.getElementById('logout').style.display='block'");
      document.getElementById("topnav_image0").appendChild(image);      
      document.getElementById("topnav_image0").style.setProperty("display","block"); 
      document.getElementById("topnav_image").style.setProperty("width","5%"); 
      document.getElementById("image_topnav").style.setProperty("margin-top","27%"); 
      document.getElementById("image_topnav").setAttribute("onclick","location.href=\"/profile\"");
    }
    else if (r.ok == false) {
      console.log("non sei loggato!!!")
      console.log(r)
    }
  }
  xhr.send();
}

function logout(){
  var xhr = new XMLHttpRequest();
  
  xhr.open("POST", '/logout', true);
  
  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);
    if (r.ok == true) {
      location.href = "/";
    }
    else if(r.ok==false){
      console.log("ops problemi")
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({
        id: user_id
      }));
}