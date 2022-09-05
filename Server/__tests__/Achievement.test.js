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
        const res = await agent.get("/getRoadmapAchievementsPopup?id=" + user_id).send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

});
