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

beforeAll(async () => {
    await agent.post("/auth").send({
        username: instance_data.username,
        password: instance_data.password
    })
});

describe("Test User Autenticato (SEZIONE COMMENTI/RECENSIONI) (block #2)", () => {

    const roadmap_id = 154;
    var commento_id = -1;
    var recensione_id = -1;

    test("Test user general info quando loggato", async () => {

        const res = await agent.get("/getUserStatus").send();

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0); //per testarla va cambiata la chiamata da array aj son. care.
        expect(json_response.data.logged).toEqual(true);
        expect(json_response.data.info.id).toEqual(5);
    });

    test("Test creazione commento invalido (messaggio vuoto)", async () => {

        const res = await agent.post("/createCommento").send({ roadmap_id: roadmap_id, messaggio: '' }); //messaggio vuoto

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(false);
        expect(json_response.error).toEqual(-4);
    });

    test("Test creazione commento valido", async () => {

        const res = await agent.post("/createCommento").send({ roadmap_id: roadmap_id, messaggio: 'TestMessage' });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        ////console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0); //per testarla va cambiata la chiamata da array aj son. care.
        expect(json_response.data.idCommento > 0).toEqual(true);
        commento_id = json_response.data.idCommento;
    });


    test("Test modifica commento", async () => {
        const res = await agent.post("/updateCommento").send({ idCommento: commento_id, messaggio: 'secondoTestMessaggio!' });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);

    });

    test("Test creazione recensione invalida", async () => {
        const res = await agent.post("/createRecensione").send({ roadmap_id: roadmap_id, opinione: 'TestRecensione1', valutazione: -1 });
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(false);
        //expect(json_response.error).toEqual(0); 

    });


    test("Test creazione recensione valida", async () => {

        const res = await agent.post("/createRecensione").send({ roadmapId: roadmap_id, opinione: 'TestRecensione1', valutazione: 5 });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
        expect(json_response.data.idRecensione > 0).toEqual(true);
        recensione_id = json_response.data.idRecensione;
    });

    test("Test creazione recensione valida (ma già pubblicata)", async () => {

        const res = await agent.post("/createRecensione").send({ roadmapId: roadmap_id, opinione: 'TestRecensione1', valutazione: 5 });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(false);
        //expect(json_response.error).toEqual(0); 
    });


    test("Test modifica recensione", async () => {

        const res = await agent.post("/updateRecensione").send({ idRecensione: recensione_id, opinione: 'TestRecensione2', valutazione: 5 });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test delete commento valida", async () => {

        const res = await agent.post("/deleteCommento").send({ idCommento: commento_id });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    });

    test("Test delete recensione valida", async () => {

        //console.log(recensione_id)
        const res = await agent.post("/deleteRecensione").send({ idRecensione: recensione_id });

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
    });
    /*
        test("Test delete commento valida di un altro utente", async () => {
    
            var commentoAltruiId=8;
            const res = await agent.post("/deleteCommento").send({idCommento:commentoAltruiId});
    
            expect(res.statusCode).toEqual(200);
            json_response = JSON.parse(res.text)
            //console.log(json_response)
            expect(json_response.ok).toEqual(false);
            //expect(json_response.error).toEqual(0); 
        });    
        
        test("Test delete recensione valida di un altro utente", async () => {
            var recensioneAltruiId=21;
            const res = await agent.post("/deleteRecensione").send({idRecensione:recensioneAltruiId});
    
            expect(res.statusCode).toEqual(200);
            json_response = JSON.parse(res.text)
            //console.log(json_response)
            expect(json_response.ok).toEqual(false);
        });
    
        */

    test("test di logout avendo effettuato il login", async () => {
        const res = await agent.post("/logout").send({})

        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0);
    })
});
