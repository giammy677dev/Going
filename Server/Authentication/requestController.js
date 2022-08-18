const DAO = require('./DAO.js');
const MapsHandler = require('./MapsHandler.js');
const md5 = require('md5');
const { ExitStatus } = require('typescript');

class RequestController {

    constructor() {
        this.dao = new DAO();
        this.mapsHandler = new MapsHandler();
    }

    async register(username, password, email, birthdate) {
        //Ensure the input fields exists and are not empty
        if (username && password && email && birthdate) {
            password = md5(password);
            const data = await this.dao.register(username, password, email, birthdate);
            return { ok: data[0], error: data[1] };
        }
        else {
            return { ok: false, error: -2 }
        }
    }

    async login(username, password) {
        //Ensure the input fields exists and are not empty
        if (username && password) {
            password = md5(password);
            const data = await this.dao.login(username, password);
            console.log({ ok: data[0], error: data[1], data: data[2] })
            return { ok: data[0], error: data[1], data: data[2] }
        }
        else {
            return { ok: false, error: -1, data: { username: '' } };
        }
    }

    async createRoadmap(user_id, roadmap) {
        console.log(user_id)
        console.log(roadmap)
        if (roadmap.titolo && roadmap.isPublic != null && roadmap.localita && roadmap.dataCreazione && user_id){// && roadmap.stages) { //la roadmap è non nulla
            //dao params: titolo, visibilità, durataComplessiva, localita, descrizione, punteggio, dataCreazione, utenteRegistrato_id
            console.log("te\n\n\nst")
            //fatte in blocco. se succede qualcosa va fatto il revert di tutto. ROLLBACK SI PUO' FARE???
            roadmap.durataComplessiva = -1
            const data1 = await this.dao.addRoadmap(roadmap.titolo, roadmap.isPublic, roadmap.durataComplessiva, roadmap.localita, roadmap.descrizione, roadmap.dataCreazione, user_id);
            const roadmap_id = data1[2].insertId
            
            await this.dao.addNewStages(roadmap.stages);
            const data3 = await this.dao.instantiateRoadmap(roadmap_id, user_id, roadmap.stages);
            return {ok: data3[0], error:data3[1]}
        }

        return {ok: false, error:-5} //return error!
    }

    async searchUser(username) {
        if (!username || username == null) { //username nullo
            return { ok: false, error: -4, data: { username: '' } }
        }
        else {
            const data = await this.dao.searchUser(username);
            return { ok: true, error: data[1], data: data[2] };
        }
    }

    async getBestRoadmap() {
        const data = await this.dao.getBestRoadmap();
        return { ok: data[0], error: data[1], data: data[2]}
    }


    async getExNovoStages() {
        const data = await this.dao.getExNovoStages();
        return { ok: data[0], error: data[1], data: data[2]}
    }

    async getDataUser(id) {
        const data = await this.dao.getDataUser(id);
        return { ok: data[0], error: data[1], data: data[2]}
    }

    async getPlaceInfo(id) {
        const data = await this.mapsHandler.getPlaceDetails(id);
        console.log(data)
        return { ok: data[0], error: data[1], data: data[2]}
    }


    async getRoadmapUser(id) {
        const data = await this.dao.getRoadmapUser(id);
        return { ok: data[0], error: data[1], data: data[2]}
    }

}

module.exports = RequestController;