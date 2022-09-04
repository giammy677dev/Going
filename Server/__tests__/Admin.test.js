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

function generateRandomUserData() {
    return { username: (Math.random() + 1).toString(36).substring(7), password: (Math.random() + 1).toString(36).substring(7), email: (Math.random() + 1).toString(36).substring(7) + "@gmail.com", birthdate: "1995-09-10" }
}

const new_user = generateRandomUserData();
var new_user_id;


beforeAll(async () => {
    await agent.post("/auth").send({
        username: instance_data.username,
        password: instance_data.password
    });
    
});

describe("Test User Autenticato (SEZIONE COMMENTI/RECENSIONI) (block #2)", () => {

    /*test("Test admin banna utente esistente", async () => {

        const reg = await request(app.app).post("/register").send({ //creazione utente random
            username: new_user.username,
            password: new_user.password,
            email: new_user.email,
            birthdate: new_user.birthdate
        });
        new_user_id = JSON.parse(reg.text).data.idUser;

        const res = await agent.post("/deleteUser").send({ user_id: new_user_id });
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0); //per testarla va cambiata la chiamata da array aj son. care.
    });

    test("Test admin banna inesistente/già bannato", async () => {
        const res = await agent.post("/deleteUser").send({ user_id: new_user_id });
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(false);
        expect(json_response.error).toEqual(-1); //per testarla va cambiata la chiamata da array aj son. care.
    });*/

    /*test("Test admin process bulk segnalazioni", async () => {
        //crea roadmap a caso e aggiungerlo al db
        const roadmap = {titolo:'test',descrizione:'test',isPublic:1,stages:[]};

        //crea utente a caso e aggiungerlo al db
        const new_user2 = generateRandomUserData();
        const register_response = JSON.parse((await agent.post("/register").send(new_user2)).text);
        const user_id = register_response.data.idUser;

        //crea commento a caso e aggiungerlo al db
        const roadmap_id = 154;
        const commento_response = JSON.parse((await agent.post("/createCommento").send({ roadmap_id: roadmap_id, messaggio: 'TestMessage' })).text);
        const commento_id = commento_response.data.idCommento;

        //crea recensione a caso e aggiungerlo al db
        //const recensione_response =  await agent.post("/createRecensione").send({ roadmapId: roadmap_id, opinione: 'TestRecensione1', valutazione: 5 });
        //const recensione_id = commento_response.data.idRecensione;


        //effettua segnalazioni
        const r = await agent.post("/report").send({tipo:2,idOggetto:user_id,motivazione:"motivation1"})
        await agent.post("/report").send({tipo:4,idOggetto:commento_id,motivazione:"motivation2"})

        const segnalazioni_response = await agent.get("/getSegnalazioni").send()
        var segnalazioni = (JSON.parse(segnalazioni_response.text)).data.segnalazioni
        console.log(segnalazioni[0])
        //creare file bulk che riceve il backend e aggiungerlo al db
        var segnalazioni_body = []


        segnalazioni_body.push({idSegnalazione: segnalazioni[0].idSegnalazione,action:'accept'}) 
        segnalazioni_body.push({idSegnalazione: segnalazioni[1].idSegnalazione,action:'accept'}) 

        //console.log(segnalazioni_body)
        
        //deleteSegnalazioni vedere se funziona
        const res = await agent.post("/updateSegnalazioni").send(segnalazioni_body);
        expect(res.statusCode).toEqual(200);
        json_response = JSON.parse(res.text)
        //console.log(json_response)
        expect(json_response.ok).toEqual(true);
        expect(json_response.error).toEqual(0); //per testarla va cambiata la chiamata da array aj son. care.
    });*/

});
