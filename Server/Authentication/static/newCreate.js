var percorrenza = "WALKING";

function addListner(){
    document.getElementById("titolo").addEventListener('input',attivaBottone);
}

function attivaBottone(){
    var bottone=document.getElementById("bottoneImpostazioni");
    if(this.value != ""){
        bottone.disabled = false;
        bottone.style.border= "thin #07b7c4 solid";
        bottone.style.backgroundColor= "#238a8a";
        bottone.style.color= "white";
        bottone.style.cursor= "pointer";
    }
    else{
        bottone.disabled= true;
        bottone.style.border= "thin #526264 solid";
        bottone.style.backgroundColor= "#082020";
        bottone.style.color= "rgb(132, 132, 132)";
        bottone.style.cursor= "default";
    }
}

function mostraCreate(){
    var textarea= document.getElementById("areaDescrizione");
    document.getElementById("avviso").remove();
    textarea.disabled = false;
    textarea.style.cursor = "text";
    document.getElementById("mapBox").style.display = "block";
    document.getElementById("titleValue").innerText= document.getElementById("titolo").value;
    
    if (document.getElementById("priv").checked) {
        document.getElementById("visiblitaValue").innerText= "Privata🔒";
    }
    else {
        document.getElementById("visiblitaValue").innerText= "Pubblica🌎";
    }
    
    if (document.getElementById("driving_mode").checked) {
        document.getElementById("percorrenzaValue").innerText= "In macchina🚗";
    }
    else {
        document.getElementById("percorrenzaValue").innerText= "A piedi🚶‍♂️";
    }
    document.getElementById("titolo").remove();
    percorrenza = document.querySelector('input[name="mobilitazione"]:checked').value
    document.getElementById("inputVisibilitaBox").remove();
    document.getElementById("inputPercorrenzaBox").remove();
    document.getElementById("bottoneImpostazioni").remove();
}