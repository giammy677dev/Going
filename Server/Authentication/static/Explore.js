
function richiestaDBRoadmap(ricerca) {
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/searchRoadmap?ricerca=' + ricerca, true);
    console.log("db roadmap",ricerca)
    xhr.onload = function (event) {
        console.log("onload db roadmap",ricerca)
        const r = JSON.parse(event.target.responseText);
        const result = r.data.results

        if (r.ok == true) {
            element = document.getElementById("numero_rm");
            if (element != null) {
                element.outerHTML = "";
            }

            var elements = document.getElementsByClassName("item");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""

            }

            elements = document.getElementsByClassName("link_rm");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""
            }

            element = document.getElementById("result_rm");
            if (element != null) {
                element.outerHTML = "";
            }
            if (result.length > 0) {
                const html_code = '<div id="numero_rm" style="text-align: center; font-size:25px"><h4>Risultati sulle roadmap ha prodotto <div>' + result.length + ' risultato/i</div></h4></div>'
                const posto = document.getElementById("pop_res_rm");
                posto.insertAdjacentHTML("beforeend", html_code)
                for (var i = 0; i < result.length; i++) {
                    const html_code = '<a class="link_rm" href="/view_roadmap/' + result[i].id + '"><div class="item">'+result[i].titolo+'<br>🏙' +result[i].localita+'<br>⏱'+result[i].durataComplessiva+'min<br><img src="/storage/star.jpg" style="width:20px;height: 20px;">Qua stelline solo:'+result[i].punteggio+'<br></div></a>'
                    const posto = document.getElementById("items");
                    posto.insertAdjacentHTML("beforeend", html_code)
                }
            }
            else {
                const html_code = '<div id="result_rm" style="font-size:25px">Nothing roadmap con ricerca: ' + ricerca + '!!!</div>'
                const posto = document.getElementById("item");
                posto.insertAdjacentHTML("beforeend", html_code)
            }

        }
        else if (r.ok == false) {
            console.log(r)
            alert("Problemi col db")
        }
    }

    console.log("fine db rm",ricerca)
}
function richiestaDBUtente(ricerca) {
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/searchUser?username=' + ricerca, true);
    xhr.onload = function (event) {

        const r = JSON.parse(event.target.responseText);
        const result = r.data.results

        if (r.ok == true) {


            element = document.getElementById("numero");
            if (element != null) {
                element.outerHTML = "";
            }

            var elements = document.getElementsByClassName("item-user");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""

            }

            elements = document.getElementsByClassName("link_user");
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = ""
            }

            element = document.getElementById("result");
            if (element != null) {
                element.outerHTML = "";
            }

            if (result.length > 0) {
                const html_code = '<div id="numero" style="text-align: center; font-size:25px"><h4>Risultati utenti ha prodotto <div>' + result.length + ' risultato/i</div></h4></div>'
                const posto = document.getElementById("pop_res");
                posto.insertAdjacentHTML("beforeend", html_code)
                for (var i = 0; i < result.length; i++) {
                    const html_code = '<a class="link_user" href="/profile/' + result[i].username + '"><div class="item-user" ><img src="/avatar/' + result[i].username + '.jpg" style="width:40px;height: 40px;"><br>' + result[i].username + '<br></div></a>'
                    const posto = document.getElementById("items-user");
                    posto.insertAdjacentHTML("beforeend", html_code)
                }
            }
            else {
                const html_code = '<div id="result" style="font-size:25px">Nothing con username ' + ricerca + '!!!</div>'
                const posto = document.getElementById("items-user");
                posto.insertAdjacentHTML("beforeend", html_code)
            }

        }
        else if (r.ok == false) {
            console.log(r)
            alert("Problemi col db")
        }
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send()
}

function searchExplore() {
    var ricerca = document.getElementById("barra_ricerca").value;

    if (ricerca == "") {
        alert(" campo  nullo")
    }
    else {
        
        richiestaDBRoadmap(ricerca);
        
        richiestaDBUtente(ricerca);
    }
}

function fromMain() {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const ricerca = urlParams.get('ricerca')

    if (ricerca != null) {
        document.getElementById("barra_ricerca").value = ricerca;
        richiestaDBUtente(ricerca)
        richiestaDBRoadmap(ricerca)
    }
}