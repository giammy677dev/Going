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

describe("Test retrieving html (block #6)", () => {

    var agent = request.agent(app.app);

    test("Test HomePage retrieving", async () => {
        const res = await agent.get("/").send();
        expect(res.statusCode).toEqual(200);
    });

    test("Test info_page retrieving", async () => {
        const res = await agent.get("/info").send();
        expect(res.statusCode).toEqual(200);
    });

    test("Test about_page retrieving", async () => {
        const res = await agent.get("/about").send();
        expect(res.statusCode).toEqual(200);
    });

    test("Test create_page retrieving", async () => {
        const res = await agent.get("/create").send();
        expect(res.statusCode).toEqual(200);
    });

    test("Test explore_page retrieving", async () => {
        const res = await agent.get("/explore").send();
        expect(res.statusCode).toEqual(200);
    });

    test("Test view_roadmap retrieving", async () => {
        const res = await agent.get("/view_roadmap").send();
        expect(res.statusCode).toEqual(200);
    });

    test("Test signup_page retrieving", async () => {
        const res = await agent.get("/signup").send();
        expect(res.statusCode).toEqual(200);
    });

    test("Test profile_page retrieving", async () => {
        const res = await agent.get("/profile").send();
        expect(res.statusCode).toEqual(200);
    });

    test("Test admin_page retrieving", async () => {
        const res = await agent.get("/profile").send();
        expect(res.statusCode).toEqual(200);
    });
});
