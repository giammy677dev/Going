const Server = require('../Controller/HTTPinterface.js');

const request = require("supertest");
const assert = require('assert');
const { TravelMode } = require('@googlemaps/google-maps-services-js');

const app = new Server()
var agent = request.agent(app.app);

const instance_data = {
    username: "giammy677",
    password: "asdf1234",
    email: "giammy677@gmail.com",
    birthdate: "1995-09-10"//html birthdate format (just like frontend does)
}
const user_id = 5;

beforeAll(async () => {
    await agent.post("/auth").send({
        username: instance_data.username,
        password: instance_data.password
    })
});

const new_stages = []

describe("Test ROADMAP (block #4)", () => {

    var roadmap_id1;

    var roadmap_id2;
    var exNovoPlaceId;

    test("Test migliori roadmap", async () => {

        const res = await agent.get("/getBestRoadmap").send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test prendi i marker da finestra scorrevole rettangolare", async () => {

        const res = await agent.post("/getMarkersFromRect").send({ "centerLatInf": 40.813354913605515, "centerLatSup": 40.815197985411224, "centerLngInf": 14.336033813155709, "centerLngSup": 14.337597541011391 });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test calcola percorso tra 2 posti raggiungibili tra loro", async () => {
        const placeId1 = 'ChIJAZDSTRYJJRMRd_Pb9R40qxE' // Il Fogliano Hotel
        const placeId2 = 'ChIJRVrC_g0JJRMRPPX7J7jcuCU' // Marechiaro Ristorante Pizzeria

        const res = await agent.post("/getRoute").send({ origin: placeId1, destination: placeId2, travelMode: 'walking' });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test calcola percorso tra 2 posti irraggiungibili tra loro", async () => {

        const placeId1 = 'ChIJAZDSTRYJJRMRd_Pb9R40qxE' // Il Fogliano Hotel
        const placeId2 = 'ChIJJawZrLbWmoAR8WzNS0A4x1I' // "Capitol Bowl" (Sacramento)

        const res = await agent.post("/getRoute").send({ origin: placeId1, destination: placeId2, travelMode: 'walking' });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(false);
        expect(json_response.error).toEqual(-3);

    });


    test("Test prendi info di un posto esistente (e già nel database)", async () => {
        const placeId = 'ChIJAZDSTRYJJRMRd_Pb9R40qxE'
        const res = await agent.get("/getPlaceInfo?placeId=" + placeId).send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test prendi info di un posto esistente (e non nel database)", async () => {
        const placeId = 'ChIJJawZrLbWmoAR8WzNS0A4x1I' // "Capitol Bowl" (Sacramento)
        const res = await agent.get("/getPlaceInfo?placeId=" + placeId).send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });


    test("Test prendi info di un posto inesistente", async () => {
        const placeId = 'invalidplaceId'
        const res = await agent.get("/getPlaceInfo?placeId=" + placeId).send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(false);
        expect(json_response.error).toEqual(-1);
    });

    test("Test prendi info di un posto dalle sue coordinate", async () => {
        const lat = 40.90549941758875
        const lng = 14.113208379225245

        const res = await agent.get("/getPlaceFromCoords?lat=" + lat + "&lng=" + lng).send();

        const expected_placeId = 'ChIJxSy2bEYFOxMRqnL7lQ1pOUQ'

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
        expect(json_response.data.place_id).toEqual(expected_placeId);
    });

    test("Test creazione roadmap con nodi ex-novo + non nel db (cache miss) (driving)", async () => {
        //TRAVELMODE: DRIVING
        const travelMode = 'DRIVING'; //to be set one time at beginning of roadmap creation

        //EX NOVO NODE
        const lat1 = 39.882687856056144
        const lng1 = -3.9775724709033966
        const exNovoResponse = await agent.get("/getPlaceFromCoords?lat=" + lat1 + "&lng=" + lng1).send();
        const exNovoResponseJSON = JSON.parse(exNovoResponse.text)
        exNovoPlaceId = exNovoResponseJSON.data.place_id;

        //GOOGLE POI (NOT IN DB YET)
        const POIplaceId = 'ChIJp_DwHJEJag0Rt1arlDMk8vc'; "El Tajo Garden Center"
        await agent.get("/getPlaceInfo?placeId=" + POIplaceId).send();

        //distance session population
        await agent.post("/getRoute").send({ origin: exNovoPlaceId, destination: POIplaceId, travelMode: travelMode });

        var stages = []
        stages.push({ nome: 'testName', durata: 1500, placeId: exNovoPlaceId }) //nodo Ex Novo
        stages.push({ durata: 1000, placeId: POIplaceId }) //nodo POI

        const roadmapObj = { titolo: 'test', descrizione: 'test', isPublic: 1, stages: stages }
        //console.log(roadmapObj)
        const res = await agent.post("/createRoadmap").send(roadmapObj);

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
        expect(json_response.data.roadmapId > 0).toEqual(true);
        roadmap_id1 = json_response.data.roadmapId
    });

    test("Test prendi info della roadmap appena creata", async () => {
        const res = await agent.get("/getRoadmapData?id=" + roadmap_id1).send();
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test creazione roadmap con nodi pre-esistenti (cache hit) (walking)", async () => {
        const travelMode = 'WALKING';
        //alcuni nodi già esistenti (ma nel db)
        const POIplaceId = 'ChIJp_DwHJEJag0Rt1arlDMk8vc'; "El Tajo Garden Center"

        await agent.get("/getPlaceInfo?placeId=" + POIplaceId).send();
        await agent.get("/getPlaceInfo?placeId=" + exNovoPlaceId).send(); //stored in db thanks to last roadmap

        //distance session population
        await agent.post("/getRoute").send({ origin: POIplaceId, destination: exNovoPlaceId, travelMode: travelMode });

        var stages = []
        stages.push({ durata: 950, placeId: exNovoPlaceId }) //nodo Ex Novo (cache hit)
        stages.push({ durata: 1050, placeId: POIplaceId }) //nodo POI (cache hit)

        const roadmapObj = { titolo: 'test', descrizione: 'test', isPublic: 0, stages: stages }
        console.log(roadmapObj)
        const res = await agent.post("/createRoadmap").send(roadmapObj);

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
        expect(json_response.data.roadmapId > 0).toEqual(true);
        roadmap_id2 = json_response.data.roadmapId
    });

    test("Test rimozione roadmap", async () => {

        const res = await agent.post("/deleteRoadmap").send({ roadmap_id: roadmap_id2 });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test delete stage", async () => {
        const POIplaceId = 'ChIJp_DwHJEJag0Rt1arlDMk8vc'; "El Tajo Garden Center"
        const res = await agent.post("/deleteStage").send({placeId:POIplaceId});
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

});
