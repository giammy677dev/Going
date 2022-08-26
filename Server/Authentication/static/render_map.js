
window.onload = function () {
    check()
};

var ClickEventHandler = (function () {
    function ClickEventHandler(map, origin) {
        this.origin = origin;
        this.map = map;
        this.map.addListener("click", this.handleClick.bind(this));
    }
    ClickEventHandler.prototype.handleClick = function (event) {
        console.log("You clicked on: " + event.latLng);
        console.log(event)
        if ( "placeId" in event) { //POI
            console.log(event)
            console.log("You clicked on place:" + event.placeId);
            event.stop();
            if (event.placeId) {
                this.openInfoBox(event.placeId, event.latLng);
            }
        }
    };

    ClickEventHandler.prototype.openInfoBox = function (placeId, latLng) {
        var content = ""
        console.log("DIOASNGOIAD")
        for (var i = 0; i < roadmap.stages.length; i++) {
            console.log("test")
            if (roadmap.stages[i].placeId == placeId) {
                content += roadmap.stages[i].durata + "\n";
                console.log(roadmap.stages[i])
            }
        }
        infoWindow = new google.maps.InfoWindow({
            content: content
        });
        infoWindow.setPosition(latLng);
        infoWindow.open(map);
    };
    return ClickEventHandler;
}());