/* Script Verifica Password */
var flag=0;

function validation_registration() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var confirm_password = document.getElementById("confirmpassword").value;
    var email = document.getElementById("email").value;
    var birthdate = document.getElementById("birthdate").value;

    flag++;

    if (username == "" || password == "" || confirm_password =="" || email == "" || birthdate == "") {
        document.getElementsByClassName("second")[0].style.display = "block";
        document.getElementById("errorText").innerHTML="Alcuni campi sono nulli"
        if(username == ""){
            document.getElementById("username").focus();
            /*document.getElementById("username").style.setProperty("background-color","rgba(120,55,55,0.5)");
            document.getElementById("username").style.setProperty("color","rgba(255,255,255,1)");*/
        }else if(password == ""){
            document.getElementById("password").focus();
        }else if(confirm_password == ""){
            document.getElementById("confirmpassword").focus();
        }else if(email == ""){
            document.getElementById("email").focus();
        }else if(birthdate == ""){
            document.getElementById("birthdate").focus();
        }
    }
    else if (password != confirm_password) {
        document.getElementsByClassName("second")[0].style.display = "block";
        document.getElementById("errorText").innerHTML="Le Password non corrispondono. Riprovare"
    }
    else if (password.length < 8) {
        document.getElementsByClassName("second")[0].style.display = "block";
        document.getElementById("errorText").innerHTML="Password troppo corta. Inserire una password di almeno 8 caratteri"
    }
    else {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/register', true);
        xhr.onload = function (event) {

            const r = JSON.parse(event.target.responseText);

            if (r.ok == true) {
                document.getElementById('errorBox').remove();
                document.getElementById('infoH').innerHTML="Registrazione avvenuta con successo!";
                document.getElementById('inputText').remove();
                document.getElementById('infoH').style.setProperty("padding","0px");
                document.getElementById('infoH').style.setProperty("border-bottom","0px");
                document.getElementById('changeButton').value = "Visita Profilo";
                document.getElementById('changeButton').setAttribute("onclick","goTo(6,"+r.data.insertId+")");
            }
            else if (r.ok == false && r.error == "1062") {
                document.getElementsByClassName("second")[0].style.display = "block";
                document.getElementById("errorText").innerHTML= "Username o Email già usato. Riprovare";
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

    function goTo(num,id){
        if(num==0){
            location.href = '/';
        }
        else if(num==6){
            location.href = "/profile?id="+id;
        }
    }

    function mostraInfo(){
        var infoBox= document.getElementById("infoBox");
        if(infoBox.style.display=="block"){
            infoBox.style.display="none";
        }
        else {
            infoBox.style.display="block";
        }
    }

  
    document.addEventListener('on', function(e){
        var input = e.target;
        if (!$.nodeName(input, 'input')) return;
        input.checkValidity();
        var element = $(input).parent();
        if(input.validity.valid) {
            element.removeClass('invalid');
            element.parent().removeClass('invalid');
        } else { //Remove the lines below if you don't want to automatically add
                 // classes when they're invalid.
            element.addClass('invalid');
            element.parent().removeClass('invalid');
        }
    });

    document.getElementById("username").addEventListener('focusout',userWarning);

    function userWarning(){
        if(document.getElementById("username").value==""){
            document.getElementById("username").style.setProperty("background-color","rgba(120,55,55,0.5)");
        }
        
    }