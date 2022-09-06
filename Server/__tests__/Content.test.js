const Server = require('../Controller/HTTPinterface.js');

const request = require("supertest");
const assert = require('assert');

const app = new Server()

beforeAll(done => {
    done()
})

afterAll(done => {
    // Closing the DB connection allows Jest to exit successfully.

    done()
})

describe("Test Achievement (block #5)", () => {

    var agent = request.agent(app.app);

    const instance_data = {
        username: "giammy677",
        password: "asdf1234",
        email: "giammy677@gmail.com",
        birthdate: "1995-09-10"//html birthdate format (just like frontend does)
    }

    test("Test preleva achievement completati da user", async () => {
        const user_id = 5;
        const res = await agent.get("/getAchievements?id=" + user_id).send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test preleva achievement numero roadmap create da utente", async () => {
        const user_id = 5;
        const res = await agent.get("/getRoadmapAchievementsPopup").send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test ricerca utente vuota", async () => {
        const username = ''
        const res = await agent.get("/searchUser?username=" + username).send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(false);
        expect(json_response.error).toEqual(-1);
    });

    test("Test ricerca utente valida", async () => {
        const username = 'giammy'
        const res = await agent.get("/searchUser?username=" + username).send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test suggestedRoadmap", async () => {
        const res = await agent.post("/suggestedRoadmap").send({numberRoadmapToDisplay:5,rating:4});

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test suggestedRoadmap invalid params", async () => {
        const res = await agent.post("/suggestedRoadmap").send({numberRoadmapToDisplay:-1,rating:4});

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        
        expect(json_response.ok).toEqual(false);
        expect(json_response.error).toEqual(-1);
    });

    test("Test stato like/follow su roadmap fissato utente", async () => {
        const roadmap_id = 154;
        const user_id = 5;
        const res = await agent.get("/getPreferredFavouriteStatusByUserByRoadmap?user_id="+user_id+"&roadmap_id"+roadmap_id).send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test preleva commenti e recensioni da roadmap", async () => {
        const roadmap_id = 154;
        const res = await agent.get("/getCommentiRecensioni?id="+roadmap_id).send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

});
