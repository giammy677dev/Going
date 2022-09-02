
/* Script Login */

function validation_login() {
    var username = document.getElementById("username_login").value;
    var password = document.getElementById("password_login").value;

    if (username == "" && password == "") {
        document.getElementById("Response_Login").innerText = "❗Username e Password Vuoti. Riprovare";
    }
    else if (username == "") {
        document.getElementById("Response_Login").innerText = "❗Campo Username Vuoto. Riprovare";
    }
    else if (password == "") {
        document.getElementById("Response_Login").innerText = "❗Campo Password Vuoto. Riprovare";
    }
    else{
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/auth', true);
    xhr.onload = function (event) {

    const r = JSON.parse(event.target.responseText);

    if (r.ok == true) {
        window.location.reload();
    }
    else if (r.ok == false && r.error == "-3") {
        document.getElementById("Response_Login").innerText = "❗Username o Password Errati. Riprovare";
       }
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        username: username,
        password: password
    }));
    }
}
