const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});
const API_KEY = 'AIzaSyDkhHdG46Po1AyvEnEsk8PALxscMRpEYCs'
const FRONT_END_KEY = 'AIzaSyBPAAQaGDsfG0K4lksFbcEetDuNw85mlH8'
class MapsHandler {

    getPhotoUrl(photo_reference) {
        const MAX_HEIGHT = 500;
        const MAX_WIDTH = 500;
        var url = 'https://maps.googleapis.com/maps/api/place/photo?photoreference=' + photo_reference + '&sensor=false&maxheight=' + MAX_HEIGHT + '&maxwidth=' + MAX_WIDTH + '&key=' + FRONT_END_KEY
        return url
    }

    async getPlaceDetails(place_id) {
        try {
            var data_from_google = await client.placeDetails({
                params: {
                    place_id: place_id,
                    key: API_KEY,
                    //fields:['icon'] if necessary
                },
                timeout: 1000, // milliseconds
            });
            data_from_google = data_from_google.data.result;
            if(data_from_google.photos !== undefined)
                data_from_google.foto = this.getPhotoUrl(data_from_google.photos[0].photo_reference)
            else
                data_from_google.foto = "FOTO DI DEFAULT QUI"
            return [
                true, 0, data_from_google
            ]
        } catch (error) {
            console.log(error)
        }
        return { ok: false, error: -1 } //errore? -1?
    }

    async getPlaceFromCoords(lat,lng) {
        try {
            //var locat = new google.maps.LatLng(lat, lng);

            var data_from_google = await client.geocode({
                params: {
                    latlng:lat+","+lng,
                    key: API_KEY,
                    //fields:['icon'] if necessary
                },
                timeout: 1000, // milliseconds
            });
            const res = (data_from_google.data.results[0]);
            console.log(res)
            return [true,0, res]
        } catch (error) {
            console.log(error)
        }
        return [false,-1,{}] //errore? -1?
    }


}
module.exports = MapsHandler