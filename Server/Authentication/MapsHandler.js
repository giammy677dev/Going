const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});
const key = 'AIzaSyDkhHdG46Po1AyvEnEsk8PALxscMRpEYCs'
class MapsHandler {
    async getPlaceDetails(place_id) {
        console.log(place_id)
        try {
            return [
                true, 0, {data:(await client.placeDetails({
                    params: {
                        place_id: place_id,
                        key: key,
                        //fields:['icon'] if necessary
                    },
                    timeout: 1000, // milliseconds
                })).data.result
        }]
        } catch (error) {
            console.log(error)
        }
        return { ok: false, error: -1 } //errore? -1?
    }

}
module.exports = MapsHandler