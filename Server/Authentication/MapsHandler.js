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
        console.log(place_id)
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
            console.log(data_from_google)
            data_from_google.foto = this.getPhotoUrl(data_from_google.photos[0].photo_reference)
            return [
                true, 0, data_from_google
            ]
        } catch (error) {
            console.log(error)
        }
        return { ok: false, error: -1 } //errore? -1?
    }

}
module.exports = MapsHandler