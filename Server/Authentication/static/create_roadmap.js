// Initialize and add the map
function initMap() {
    // The location of Uluru
    const uluru = {lat:40.733334, lng:14.533333};
    // The map, centered at Uluru
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: uluru,
        disableDefaultUI: true,
    });
    // The marker, positioned at Uluru
    var stages=[]
    map.addListener('click', function (e) {
        console.log(e);
        if(e.placeId)
        { //nodo già esistente su google maps

            //stages.add({})
            alert("already existing")
        }else{
            alert("ex novo")
            //nodo ex novo
        }
        let marker = new google.maps.Marker({
            map: map,
            position: e.latLng,
            draggable: false
        });
    });
}
  
  window.initMap = initMap;