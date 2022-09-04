const Server = require('../Controller/HTTPinterface.js');

const request = require("supertest");
const assert = require('assert');

const app = new Server()
var agent = request.agent(app.app);

const instance_data = {
    username: "giammy677",
    password: "asdf1234",
    email: "giammy677@gmail.com",
    birthdate: "1995-09-10"//html birthdate format (just like frontend does)
}

const new_user = {
    username: (Math.random() + 1).toString(36).substring(7),
    password: (Math.random() + 1).toString(36).substring(7),
    email: (Math.random() + 1).toString(36).substring(7) + "@gmail.com",
    birthdate: "1995-09-10"//html birthdate format (just like frontend does)
}
var new_user_id;

beforeAll(async () => {
    const res = await request(app.app).post("/register").send({ //creazione utente random
        username: new_user.username,
        password: new_user.password,
        email: new_user.email,
        birthdate: "1995-09-10"
    });
    await agent.post("/auth").send({
        username: instance_data.username,
        password: instance_data.password
    });
    new_user_id = JSON.parse(res.text).data.idUser;
});

describe("Test User Autenticato (SEZIONE COMMENTI/RECENSIONI) (block #2)", () => {

    test("Test admin banna utente esistente", async () => {
        const res = await agent.post("/deleteUser").send({ user_id: new_user_id });
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0); //per testarla va cambiata la chiamata da array aj son. care.
    });

    test("Test admin banna inesistente/già bannato", async () => {
        const res = await agent.post("/deleteUser").send({ user_id: new_user_id });
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        console.log(json_response)
        expect(json_response.ok).toEqual(false);
        expect(json_response.error).toEqual(-1); //per testarla va cambiata la chiamata da array aj son. care.
    });

});
