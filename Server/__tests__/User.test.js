const Server = require('../HTTPinterface.js');
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

    const instance_data = {
        username: "tesastol1ino",
        password: "trottolino",
        email: "2we1casmio0@gmail.com",
        birthdate: "1999-05-01"//html birthdate format (just like frontend does)
    }

    /*test("Test di registrazione", async () => {
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

    test("Test auth", async () => {
        const res = await request(app.app).post("/auth").send({
            username: instance_data.username,
            password: instance_data.password
        });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
        
        //await new Promise((r) => setTimeout(r, 2000));
    });

    test("Test getDataUser", async () => {
        const res = await request(app.app).get("/getDataUser").send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0); //per testarla va cambiata la chiamata da array aj son. care.
        expect(json_response.data[1]).toEqual(true); //isme!
    });

    /*test("Test di login prima di aver verificato l'account", async () => {
        const res = await request(app.app).post("/login").send({
            userName: "test",
            password: "test"
        })
        .expect(200).expect((res) => {
            res.body.ok = false;
            })
    });

    test("Verifica dell'account", async () =>{
        const res = await request(app.app).post("/activate").send({
            id: id,
        })
        .expect(200).expect((res) => {
            res.body.ok = true;
        })
    });

    test("Test di login correttamente eseguito", async () => {
        const res = await request(app.app).post("/login").send({
            userName: "test",
            password: "test"
        })
        .expect(200).expect((res) => {
            res.body.ok = true;
            res.body.id != null;
            res.body.token != null;
            res.body.prk != 'test';
            res.body.puk != 'test';
        })
        id = res.body.id;
        token = res.body.token;
        console.log(token)
    });

    test("Test di login con credenziali errate", async () => {
        const res = await request(app.app).post("/login").send({
            userName: "test",
            password: "test1"
        })
        .expect(200).expect((res) => {
            res.body.ok = false;
        })
    });

    test("test di register con email già utilizzata", async () => {
        const res = await request(app.app).post("/register").send({
            userName: "test2",
            password: "test",
            email: "test@test.it",
            prk: "test",
            puk: "test"
        })
        .expect(200).expect((res) => {
            res.body.ok = false;
        });
    });

    test("test di register con username già utilizzato", async () => {
        const res = await request(app.app).post("/register").send({
            userName: "test",
            password: "test1",
            email: "test1@test.it",
            prk: "test",
            puk: "test"
        })
        .expect(200).expect((res) => {
            res.body.ok = false;
        })});

    test("test checktoken con token non valido", async () => {
        const res = await request(app.app).post("/checktoken").send({
            id: id,
            token: "test"
        })
        .expect(200).expect((res) => {
            res.body.ok = false;
        })}
    );

    test("test checktoken con token valido", async () => {
        const res = await request(app.app).post("/checktoken").send({
            id: id,
            token: token
        })
        .expect(200).expect((res) => {
            res.body.ok = true;

        })});

    test("test di logout", async () => {
        const res = await request(app.app).post("/logout").send({
            id: id
        })
        .expect(200).expect((res) => {
            res.body.ok = true;
        })});*/
});
