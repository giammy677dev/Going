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
            return { ok: data[0], error: data[1], data: data[2] };
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
            //console.log({ ok: data[0], error: data[1], data: data[2] })
            return { ok: data[0], error: data[1], data: data[2] }
        }
        else {
            return { ok: false, error: -1, data: { username: '' } };
        }
    }

    calculateDuration(stages,distance_data) {
        var durata = stages[0].durata;
        for (var i = 1; i < stages.length; i++) {
            durata += distance_data[stages[i-1].placeId+"|"+stages[i].placeId].routes[0].legs[0].duration.value ////CONVENZIONE è IN SECONDI
        }
        return durata
    }
    calculateDistance(stages,distance_data) {
        var distanza = 0;
        for (var i = 1; i < stages.length; i++) {
            distanza += distance_data[stages[i-1].placeId+"|"+stages[i].placeId].routes[0].legs[0].distance.value; //in metri
        }
        return distanza
    }

    async createRoadmap(user_id, roadmap, session_data, distance_data) {
        //console.log(roadmap)
        if (roadmap.titolo && roadmap.isPublic !== null && user_id !== null) {// && roadmap.stages) { //la roadmap è non nulla

            //fatte in blocco. se succede qualcosa va fatto il revert di tutto. ROLLBACK SI PUO' FARE???
            roadmap.durataComplessiva = this.calculateDuration(roadmap.stages, distance_data); //si calcola con una ulteriore chiamata a google maps
            roadmap.distanza = this.calculateDistance(roadmap.stages, distance_data);
            roadmap.travelMode = distance_data[roadmap.stages[0].placeId+"|"+roadmap.stages[1].placeId].routes[0].legs[0].steps[0].travel_mode; //CONVENZIONE CHE SIA SEMPRE LO STESSO METODO. CAMMINO O MACCHINA.
            
            console.log(session_data[roadmap.stages[0].placeId])
            roadmap.localita = session_data[roadmap.stages[0].placeId][0].localita// === undefined ? session_data[roadmap.stages[0].placeId][0].address_components[1].long_name : session_data[roadmap.stages[0].placeId][0].citta;
            console.log(roadmap.localita)
            console.log(roadmap.localita)
            console.log(roadmap.localita)
            roadmap.dataCreazione = new Date().toISOString().slice(0, 19).replace("T", " ");
            const data1 = await this.dao.addRoadmap(roadmap.titolo, roadmap.isPublic, roadmap.durataComplessiva, roadmap.localita, roadmap.descrizione, roadmap.dataCreazione, roadmap.travelMode, roadmap.distanza,user_id);
            const roadmap_id = data1[2].insertId

            await this.dao.addNewStages(roadmap.stages, session_data);
            const data3 = await this.dao.instantiateRoadmap(roadmap_id, user_id, roadmap.stages, distance_data); //salvo solo la sessione. e la rimozione?
            return { ok: data3[0], error: data3[1] }
        }

        return { ok: false, error: -5 } //return error!
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
    async viewRoadmap(id) {

        if (!id || id == null) { //rm nullo
            return { ok: false, error: -4, data: { id: '' } }
        }
        else {
            const data = await this.dao.viewRoadmap(id);

            return { ok: true, error: data[1], data: data[2] };
        }
    }
    async getRecCom(id) {
        if (!id || id == null) { //rm nullo
            return { ok: false, error: -4, data: { id: '' } }
        }
        else {
            const data = await this.dao.getRecCom(id);

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
        return { ok: data[0], error: data[1], data: data[2] }
    }


    async getExNovoStages() {
        const data = await this.dao.getExNovoStages();
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getDataUser(id, element) {
        const data = await this.dao.getDataUser(id);


        return { ok: data[0], error: data[1], data: data[2], isYou: element }
    }
    async allLoggedRoadmap(id) {
        if (!id || id == null) { //ricerca nulla
            return { ok: false, error: -4, data: { id_user: '' } }
        }
        else {
            const data = await this.dao.allLoggedRoadmap(id);
            return { ok: true, error: data[1], data: data[2] };
        }
    }
    async setCommento(user, roadmap, mod_com, day) {
        if (!roadmap || !user || !user || !mod_com || !day ) {

            return { ok: false, error: -4, data: ''  }
        }
        else {
            const data = await this.dao.setCommento(user, roadmap, mod_com, day);
            return { ok: true, error: data[1], data: data[2] };
        }
    }
    async updateCommento(user, roadmap, mod_com, day) {
        if (!roadmap || !user || !user || !mod_com || !day ) {

            return { ok: false, error: -4, data: ''  }
        }
        else {
            const data = await this.dao.updateCommento(user, roadmap, mod_com, day);
            return { ok: true, error: data[1], data: data[2] };
        }
    }
    async setRecensione(user, roadmap, mod_op,mod_val, day) {
        if (!roadmap || !user || !user || !mod_val|| !day ) {

            return { ok: false, error: -4, data: ''  }
        }
        else {
            const data = await this.dao.setRecensione(user, roadmap, mod_op,mod_val, day);
            
            return { ok: true, error: data[1], data: data[2] };
        }
    }
    async updateRecensione(user, roadmap, mod_op,mod_val, day) {
       
            const data = await this.dao.updateRecensione(user, roadmap, mod_op,mod_val, day);
            return { ok: true, error: data[1], data: data[2] };
        
    }
    async getPlaceInfo(id) {
        //qua ci vuole la query mancante al db!! select place info from places e se il risultato sta lì è inutile fare la chiamta
        //a google maps api!!

        const localHit = await this.dao.placeIDExists(id);
        if (localHit[0] && localHit[2].found) {
            console.log("place exists in db!")
            return { ok: localHit[0], error: localHit[1], data: localHit[2].result }
        }
        const data = await this.mapsHandler.getPlaceDetails(id);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getRoute(placeId1, placeId2, travelMode) {
        const data = await this.mapsHandler.getRoute(placeId1, placeId2, travelMode);
        //console.log(data)
        return { ok: data[0], error: data[1], data: data[2] }
    }


    async getPlaceFromCoords(lat, lng) {

        //stesso discorso di placeinfo!! c'è bisogno di una chiamata al db pe vedere se già esiste. se già esiste è inutile 
        //fare chiamate a google

        const data = await this.mapsHandler.getPlaceFromCoords(lat, lng);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getRoadmapCreate(id_query, id_session) {
        const data = await this.dao.getRoadmapCreate(id_query, id_session);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getRoadmapSeguite(id_query,id_session) {
        var element = 0;

        if(id_session == id_query && id_session != 0 && id_session != undefined){
            element=1;
        }
        
        const data = await this.dao.getRoadmapSeguite(id_query);
        return { ok: data[0], error: data[1], data: data[2], isYou: element }
    }

    async getRoadmapPreferite(id) {
        const data = await this.dao.getRoadmapPreferite(id);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async deleteRoadmapSeguite(id_roadmap,id_user) {
        const data = await this.dao.deleteRoadmapSeguite(id_roadmap,id_user);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async updateAvatar(id, new_avatar) {
        const data = await this.dao.updateAvatar(id, new_avatar);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getMarkersFromRect(centerLatInf, centerLatSup, centerLngInf, centerLngSup) {
        const data = await this.dao.getMarkersFromRect(centerLatInf, centerLatSup, centerLngInf, centerLngSup);
        return { ok: data[0], error: data[1], data: data[2] }
    }

}

module.exports = RequestController;