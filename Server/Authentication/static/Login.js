/*Script Verifica Password*/

function validation_Password(){
    var password = document.getElementById("password")
    var confirm_password = document.getElementById("confirmpassword");

    if(password.value != confirm_password.value) {
        confirm_password.setCustomValidity("Password non uguali");
    }
    else {
        confirm_password.setCustomValidity('');
    }
}

/*Script Data di Registrazione*/

function date_registration(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear()-3;

    if (dd < 10) {dd = '0' + dd;}
    if (mm < 10) {mm = '0' + mm;} 

    today = yyyy + '-' + mm + '-' + dd;

    document.getElementById("birthdate").setAttribute("max", today);
}