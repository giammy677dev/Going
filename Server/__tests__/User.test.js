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

describe("Test User (block #1)", () => {

    var agent = request.agent(app.app);

    const instance_data = {
        username: "giammy677",
        password: "asdf1234",
        email: "giammy677@gmail.com",
        birthdate: "1995-09-10"//html birthdate format (just like frontend does)
    }

    /*test("Test di registrazione", async () => { //ok test but one time-test. una volta registrato il test non va a buon fine. stesso username.
        const res = await request(app.app).post("/register").send({
            username: instance_data.username,
            password: instance_data.password,
            email: instance_data.email,
            birthdate: instance_data.birthdate
        });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);

    });*/

    test("test di register con email già utilizzata", async () => {
        const res = await agent.post("/register").send({
            userName: "ilmiousername",
            password: "lamiapassword",
            email: "giammy677@gmail.com",
            birthdate: "1995-09-10"
        })
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(false);
    });

    test("test di register con username già utilizzato", async () => {
        const res = await agent.post("/register").send({
            userName: "giammy677",
            password: "lamiapassword",
            email: "maildiversa@gmail.com",
            birthdate: "1995-09-10"
        })
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(false);
    });

    test("test di register con email bannata", async () => {
        const res = await agent.post("/register").send({
            userName: "ilmiousername",
            password: "lamiapassword",
            email: "mailbannata@gmail.com",
            birthdate: "1995-09-10"
        })
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(false);
    });

    test("Test user general info quando NON loggato", async () => {
        const res = await agent.get("/getUserStatus").send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0); //per testarla va cambiata la chiamata da array aj son. care.
        expect(json_response.data.logged).toEqual(false); //isme!
    });

    test("Test di login con credenziali errate", async () => {
        const res = await agent.post("/auth").send({
            username: "giammy677",
            password: "passwordacaso"
        })
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(false);
    });

    test("test di logout senza aver effettuato il login", async () => {

        const res = await agent.post("/logout").send({
            id: 5
        })
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)

        expect(json_response.ok).toEqual(false);
    });

    test("Test login (account esistente e dati corretti)", async () => {
        const res = await agent.post("/auth").send({
            username: instance_data.username,
            password: instance_data.password
        });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
        expect(json_response.data).toEqual({ id: 5, username: 'giammy677', isAdmin: 1 });

        //await new Promise((r) => setTimeout(r, 2000));
    });

    test("Test user general info quando loggato", async () => {

        const res = await agent.get("/getUserStatus").send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0); //per testarla va cambiata la chiamata da array aj son. care.
        expect(json_response.data.info.id).toEqual(5);
        expect(json_response.data.logged).toEqual(true);
    });


    test("Test preleva roadmap create da utente loggato", async () => {

        const user_id = 5;
        const res = await agent.get("/getRoadmapCreate?id=" + user_id).send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test preleva roadmap seguite da utente loggato", async () => {

        const user_id = 5;
        const res = await agent.get("/getRoadmapSeguite?id=" + user_id).send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });
    
    test("Test preleva roadmap preferite da utente loggato", async () => {
        const user_id = 5;
        const res = await agent.get("/getRoadmapPreferite?id=" + user_id).send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

});
