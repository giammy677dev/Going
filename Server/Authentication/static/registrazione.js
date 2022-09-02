function validation_registration() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var confirm_password = document.getElementById("confirmpassword").value;
    var email = document.getElementById("email").value;
    var birthdate = document.getElementById("birthdate").value;
    var flag = 0;
    document.getElementById("errorText").innerHTML = "";

    if (username == "" || password == "" || confirm_password == "" || email == "" || birthdate == "") {
        flag = 1;
        document.getElementsByClassName("second")[0].style.display = "block";
        var vuoto = document.createElement("span");
        vuoto.setAttribute("id", "campiNulli");
        vuoto.innerHTML = "Alcuni campi sono nulli";
        document.getElementById("errorText").appendChild(vuoto)
        if (username == "") {
            document.getElementById("username").focus();
        } else if (password == "") {
            document.getElementById("password").focus();
        } else if (confirm_password == "") {
            document.getElementById("confirmpassword").focus();
        } else if (email == "") {
            document.getElementById("email").focus();
        } else if (birthdate == "") {
            document.getElementById("birthdate").focus();
        }

        if (username == "") {
            document.getElementById("username").style.setProperty("background-color", "#4212126b");
            document.getElementById("username").style.setProperty("color", "#757575");
        }
        if (password == "") {
            document.getElementById("password").style.setProperty("background-color", "#4212126b");
            document.getElementById("password").style.setProperty("color", "#757575");
        }
        if (confirm_password == "") {
            document.getElementById("confirmpassword").style.setProperty("background-color", "#4212126b");
            document.getElementById("confirmpassword").style.setProperty("color", "#757575");
        }
        if (email == "") {
            document.getElementById("email").style.setProperty("background-color", "#4212126b");
            document.getElementById("email").style.setProperty("color", "#757575");
        }
        if (birthdate == "") {
            document.getElementById("birthdate").style.setProperty("background-color", "#4212126b");
            document.getElementById("birthdate").style.setProperty("color", "#757575");
        }
    }

    if (password != confirm_password) {
        flag = 1;
        document.getElementsByClassName("second")[0].style.display = "block";
        var differentPass = document.createElement("span");
        differentPass.setAttribute("id", "differentPass");
        differentPass.innerHTML = "Le Password non corrispondono";
        document.getElementById("errorText").appendChild(differentPass)
    }

    if (password.length < 8) {
        flag = 1;
        document.getElementsByClassName("second")[0].style.display = "block";
        var passwLenght = document.createElement("span");
        passwLenght.setAttribute("id", "passwLenght");
        passwLenght.innerHTML = "Password troppo corta. Inserire una password di almeno 8 caratteri";
        document.getElementById("errorText").appendChild(passwLenght)
    }

    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!document.getElementById("email").value.match(mailformat)) {
        flag = 1;
        document.getElementsByClassName("second")[0].style.display = "block";
        var mailValid = document.createElement("span");
        mailValid.setAttribute("id", "mailValid");
        mailValid.innerHTML = "Indirizzo e-mail inserito non valido";
        document.getElementById("errorText").appendChild(mailValid)
    }

    if (flag == 0) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/register', true);
        xhr.onload = function (event) {

            const r = JSON.parse(event.target.responseText);

            if (r.ok == true) {
                document.getElementById('errorBox').remove();
                document.getElementById('infoH').innerHTML = "Registrazione avvenuta con successo!";
                document.getElementById('inputText').remove();
                document.getElementById('infoH').style.setProperty("padding", "0px");
                document.getElementById('infoH').style.setProperty("border-bottom", "0px");
                document.getElementById('changeButton').value = "Login";
                document.getElementById('changeButton').setAttribute("onclick","document.getElementById('log').style.display='block'");
            }
            else if (r.ok == false) {
                document.getElementsByClassName("second")[0].style.display = "block";
                var errorMsg = "";
                switch (r.error) {
                    case 1062:
                        errorMsg = "Username o Email già usato. Riprovare"
                        break;
                    case -777:
                        errorMsg = "Email bannata" 
                        break;
                }

                document.getElementById("errorText").innerHTML = errorMsg;
            }
        }

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            username: username,
            password: password,
            email: email,
            birthdate: birthdate
        }));
    }

    document.getElementById("username").addEventListener('input', textVoid);
    document.getElementById("password").addEventListener('input', passLenght);
    document.getElementById("confirmpassword").addEventListener('input', passCheck);
    document.getElementById("email").addEventListener('input', ValidateEmail);
    document.getElementById("email").addEventListener('input', textVoid2);
    document.getElementById("birthdate").addEventListener('input', textVoid);
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

    document.getElementById("birthdate").setAttribute("min", "1900-01-01");
    document.getElementById("birthdate").setAttribute("max", today);
}

function goTo(num, id) {
    if (num == 0) {
        location.href = '/';
    }
    else if (num == 6) {
        location.href = "/profile?id=" + id;
    }
}

function mostraInfo() {
    var infoBox = document.getElementById("infoBox");
    if (infoBox.style.display == "block") {
        infoBox.style.display = "none";
    }
    else {
        infoBox.style.display = "block";
    }
}


function textVoid() {
    if (this.value == "") {
        this.style.setProperty("background-color", "#761d1d6b");
    } else {
        this.style.setProperty("background-color", "#1b57286b");
        this.style.setProperty("color", "white");
    }

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var confirm_password = document.getElementById("confirmpassword").value;
    var email = document.getElementById("email").value;
    var birthdate = document.getElementById("birthdate").value;


    if (username != "" && password != "" && confirm_password != "" && email != "" && birthdate != "") {
        document.getElementById("campiNulli").remove()
    }

    if (username == "" || password == "" || confirm_password == "" || email == "" || birthdate == "") {
        if (document.getElementById("campiNulli") == null) {
            document.getElementsByClassName("second")[0].style.display = "block";
            var vuoto = document.createElement("span");
            vuoto.setAttribute("id", "campiNulli");
            vuoto.innerHTML = "Alcuni campi sono nulli";
            document.getElementById("errorText").appendChild(vuoto)
        }
    }
}

function textVoid2() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var confirm_password = document.getElementById("confirmpassword").value;
    var email = document.getElementById("email").value;
    var birthdate = document.getElementById("birthdate").value;

    if (username == "" || password == "" || confirm_password == "" || email == "" || birthdate == "") {
        if (document.getElementById("campiNulli") == null) {
            document.getElementsByClassName("second")[0].style.display = "block";
            var vuoto = document.createElement("span");
            vuoto.setAttribute("id", "campiNulli");
            vuoto.innerHTML = "Alcuni campi sono nulli";
            document.getElementById("errorText").appendChild(vuoto)
        }
    }

    if (username != "" && password != "" && confirm_password != "" && email != "" && birthdate != "") {
        document.getElementById("campiNulli").remove()
    }
}

function passCheck() {
    if (this.value != document.getElementById("password").value) {
        this.style.setProperty("background-color", "#761d1d6b");

        if (document.getElementById("differentPass") == null) {
            document.getElementsByClassName("second")[0].style.display = "block";
            var differentPass = document.createElement("span");
            differentPass.setAttribute("id", "differentPass");
            differentPass.innerHTML = "Le Password non corrispondono";
            document.getElementById("errorText").appendChild(differentPass)
        }

    } else {
        if (this.value.length >= 8) {
            this.style.setProperty("background-color", "#1b57286b");
            this.style.setProperty("color", "white");
        }
        document.getElementById("differentPass").remove();
    }
}

function ValidateEmail() {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (this.value.match(mailformat)) {
        this.style.setProperty("background-color", "#1b57286b");
        this.style.setProperty("color", "white");
        document.getElementById("mailValid").remove();
    }
    else {
        this.style.setProperty("background-color", "#761d1d6b");

        if (document.getElementById("mailValid") == null) {
            document.getElementsByClassName("second")[0].style.display = "block";
            var mailValid = document.createElement("span");
            mailValid.setAttribute("id", "mailValid");
            mailValid.innerHTML = "Indirizzo e-mail inserito non valido";
            document.getElementById("errorText").appendChild(mailValid)
        }
    }
}

function passLenght() {
    if (this.value.length < 8) {
        this.style.setProperty("background-color", "#761d1d6b");
        if (document.getElementById("passwLenght") == null) {
            document.getElementsByClassName("second")[0].style.display = "block";
            var passwLenght = document.createElement("span");
            passwLenght.setAttribute("id", "passwLenght");
            passwLenght.innerHTML = "Password troppo corta. Inserire una password di almeno 8 caratteri";
            document.getElementById("errorText").appendChild(passwLenght)
        }
    } else {
        this.style.setProperty("background-color", "#1b57286b");
        this.style.setProperty("color", "white");
        document.getElementById("passwLenght").remove();
    }

    if (document.getElementById("differentPass") == null && this.value != document.getElementById("confirmpassword").value) {
        document.getElementsByClassName("second")[0].style.display = "block";
        var differentPass = document.createElement("span");
        differentPass.setAttribute("id", "differentPass");
        differentPass.innerHTML = "Le Password non corrispondono";
        document.getElementById("errorText").appendChild(differentPass)
    }
}