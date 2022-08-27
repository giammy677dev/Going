var ok = false
var user_id = 0

window.onload=function(){
  check()
};

const receivedUserInfo = new CustomEvent('receivedUserInfo');



function check() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/getDataUser?id='+ user_id, true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    if (r.ok == true && r.data.length == 1) {
      ok = r.ok
      user_id = r.data[0].id
      console.log("sei loggato!!! con questo id", ok)

      console.log("sei loggato!!! con questo id", user_id)
      document.getElementById("image_topnav").setAttribute("src", r.data[0].avatar);

      var image = document.createElement("img");
      image.setAttribute("src", "/storage/logoutTransp.png");
      image.setAttribute("display", "block");
      image.setAttribute("id", "image_topnav0");
      image.setAttribute("onclick", "document.getElementById('logout').style.display='block'");
      document.getElementById("topnav_image0").appendChild(image);
      document.getElementById("topnav_image0").style.setProperty("display", "block");
      document.getElementById("topnav_image").style.setProperty("width", "5%");
      document.getElementById("image_topnav").setAttribute("onclick", "location.href=\"/profile?id="+r.data[0].id+"\"");
      receivedUserInfo.logged=true; //passiamo valore tramite evento! wow!
      receivedUserInfo.user=user_id
      document.dispatchEvent(receivedUserInfo);
    }
    else if (r.ok == true && r.data.length == 0) {
      console.log("non sei loggato!!!")
      console.log(r)
      //wagliu qua serve un ritorno. tipo logged:false
      receivedUserInfo.logged=false;
      receivedUserInfo.user=0
      document.dispatchEvent(receivedUserInfo);
    }
  }
  xhr.send();
}

function logout() {
  var xhr = new XMLHttpRequest();
  console.log("inizio")
  xhr.open("POST", '/logout', true);
  console.log("dopo open")
  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);
    console.log(r)
    console.log(ok)
    console.log(user_id)
    if (r.ok == true) {
      location.href = "/";
    }
    else if (r.ok == false) {
      console.log("ops problemi")
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    id: user_id
  }));
}