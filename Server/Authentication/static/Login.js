
/* Script Login */

function validation_login() {
    var username = document.getElementById("username_login").value;
    var password = document.getElementById("password_login").value;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/auth', true);
    xhr.onload = function (event) {

        const r = JSON.parse(event.target.responseText);

        if (r.ok == true) {
            alert("Benvenuto " + username)
            location.href = "/profile";
        }
        else if (r.ok == false && r.error == "-1") {
            alert("Username o Password Vuoti. Riprovare")
        }
        else if (r.ok == false && r.error == "-3") {
            alert("Username o Password Errati. Riprovare")
        }
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        username: username,
        password: password
    }));
}
