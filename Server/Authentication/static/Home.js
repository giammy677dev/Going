
function ricercaHome() {
    var ricerca = document.getElementById("search").value;
    if (ricerca == "") {
        alert(" campo nullo")
    }
    else {
        location.href = "/explore?ricerca=" + ricerca;
    }
}

function caricaRoadmap(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/getBestRoadmap', true);
    xhr.onload = function (event) {
        const r = JSON.parse(event.target.responseText);
        const result = r.data
  
        if (r.ok == true) {
          for (var i = 0; i < result.length; i++) {
            const html_code = '<span class="titolo-contatti">' + result[i].titolo +'</span>';
            const posto = document.getElementById("prova");
            posto.insertAdjacentHTML("beforeend", html_code)
          }
        }
        else if (r.ok == false) {
            console.log(r)
            alert("Problemi col db")
          }
    }
    xhr.send();
}
