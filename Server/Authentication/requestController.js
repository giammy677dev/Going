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
            return { ok: data[0], error: data[1], data: data[2]};
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

    async createRoadmap(user_id, roadmap, session_data) {
        console.log(roadmap)
        if (roadmap.titolo && roadmap.isPublic !== null && user_id !== null){// && roadmap.stages) { //la roadmap è non nulla
            //dao params: titolo, visibilità, durataComplessiva, localita, descrizione, punteggio, dataCreazione, utenteRegistrato_id


            //fatte in blocco. se succede qualcosa va fatto il revert di tutto. ROLLBACK SI PUO' FARE???
            roadmap.durataComplessiva = -1 //si calcola con una ulteriore chiamata a google maps
            roadmap.localita = "TEST";//session_data[roadmap.stages[0].placeId].formatted_address;
            roadmap.dataCreazione = new Date().toISOString().slice(0, 19).replace("T", " ");
            const data1 = await this.dao.addRoadmap(roadmap.titolo, roadmap.isPublic, roadmap.durataComplessiva, roadmap.localita, roadmap.descrizione, roadmap.dataCreazione, user_id);
            const roadmap_id = data1[2].insertId
            
            await this.dao.addNewStages(roadmap.stages,session_data);
            const data3 = await this.dao.instantiateRoadmap(roadmap_id, user_id, roadmap.stages); //salvo solo la sessione. e la rimozione?
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
    async searchRoadmap(ricerca) {
        
        if (!ricerca || ricerca == null) { //ricerca nulla
            return { ok: false, error: -4, data: { ricerca: '' } }
        }
        else {
            const data = await this.dao.searchRoadmap(ricerca);

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
        return { ok: data[0], error: data[1], data: data[2]}
    }

    async getPlaceFromCoords(lat,lng) {
        const data = await this.mapsHandler.getPlaceFromCoords(lat,lng);
        return { ok: data[0], error: data[1], data: data[2]}
    }

    async getNumberRoadmapCreate(id) {
        const data = await this.dao.getNumberRoadmapCreate(id);
        return { ok: data[0], error: data[1], data: data[2]}
    }

    async getNumberRoadmapSeguite(id) {
        const data = await this.dao.getNumberRoadmapSeguite(id);
        return { ok: data[0], error: data[1], data: data[2]}
    }

    async getNumberRoadmapPreferite(id) {
        const data = await this.dao.getNumberRoadmapPreferite(id);
        return { ok: data[0], error: data[1], data: data[2]}
    }

    async updateAvatar(id, new_avatar) {
        const data = await this.dao.updateAvatar(id, new_avatar);
        return { ok: data[0], error: data[1], data: data[2] }
    }

}

module.exports = RequestController;