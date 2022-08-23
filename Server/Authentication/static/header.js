var ok=false
var user_id=0

function check() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/isLogWho', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);


    if (r.ok == true) {
      console.log("sei loggato!!! con questo id", r.whoLog)
      console.log(r)
      ok=r.ok
      user_id=r.whoLog
      
      console.log(document.getElementById("firstButtLog"))
      document.getElementById("firstButtLog").innerHTML = "Logout";
      document.getElementById("firstButtLog").setAttribute("onclick","document.getElementById('logout').style.display='block'");

      console.log(document.getElementById("secondButtLog"))
      document.getElementById("secondButtLog").innerHTML = "Profile";
      document.getElementById("secondButtLog").setAttribute("href","/profile");
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
} 