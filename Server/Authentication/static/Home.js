
function ricercaHome() {
    var ricerca = document.getElementById("search").value;
    if (ricerca == "") {
        alert(" campo nullo")
    }
    else {
        location.href = "/explore?ricerca=" + ricerca;
    }
}