/* Script Verifica Password */

function validation_registration() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var confirm_password = document.getElementById("confirmpassword").value;
    var email = document.getElementById("email").value;
    var birthdate = document.getElementById("birthdate").value;

    if (username == "" || password == "" || email == "" || birthdate == "") {
        alert("Alcuni campi sono nulli")
    }
    else if (password != confirm_password) {
        alert("Password sbagliate")
    }
    else if (password == confirm_password && password.length < 8) {
        alert("Password troppo corta. Inserire una password di almeno 8 caratteri")
    }
    else {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/register', true);
        xhr.onload = function (event) {

            const r = JSON.parse(event.target.responseText);
            
            if (r.ok == true) {
                alert("Benvenuto " + username)
                location.href = "/profile";
            }
            else if (r.ok == false && r.error == "1062") {
                alert("Username o Email già usato. Riprovare")
            }
        }

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            username: username,
            password: password,
            email:email,
            birthdate:birthdate
        }));
    }
}

/* Script Data di Registrazione */

function date_registration() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear() - 3;

    if (dd < 10) { dd = '0' + dd; }
    if (mm < 10) { mm = '0' + mm; }

    today = yyyy + '-' + mm + '-' + dd;

    document.getElementById("birthdate").setAttribute("min","1900-01-01");
    document.getElementById("birthdate").setAttribute("max", today);
}