function isLogWho() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/isLogWho', true);
  xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);
    console.log(r)

    if (r.ok == true) {
      console.log("sei loggato!!! con questo id", r.whoLog)
      return r
    }
    else if (r.ok == false) {
      console.log("non sei loggato!!!")
      return r
    }
  }
  xhr.send();
}