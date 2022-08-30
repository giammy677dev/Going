const DAO = require('./DAO.js');
const MapsHandler = require('./MapsHandler.js');
const md5 = require('md5');
const config = require('./config.js');

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

    calculateDuration(stages, distance_data) {
        var durata = stages[0].durata;
        for (var i = 1; i < stages.length; i++) {
            durata += distance_data[stages[i - 1].placeId + "|" + stages[i].placeId].routes[0].legs[0].duration.value ////CONVENZIONE è IN SECONDI
        }
        return durata
    }
    calculateDistance(stages, distance_data) {
        var distanza = 0;
        for (var i = 1; i < stages.length; i++) {
            distanza += distance_data[stages[i - 1].placeId + "|" + stages[i].placeId].routes[0].legs[0].distance.value; //in metri
        }
        return distanza
    }

    getFileName(file) {
        const split = file.originalname.split(".");
        return config.stagesFolder+"/"+file.fieldname + "." + split[split.length - 1]
    }

    async createRoadmap(user_id, roadmap, session_data, distance_data, stages_img) {

        if (roadmap.titolo && roadmap.isPublic !== null && user_id !== null) {
            roadmap.durataComplessiva = this.calculateDuration(roadmap.stages, distance_data);
            roadmap.distanzaComplessiva = this.calculateDistance(roadmap.stages, distance_data);
            roadmap.travelMode = distance_data[roadmap.stages[0].placeId + "|" + roadmap.stages[1].placeId].routes[0].legs[0].steps[0].travel_mode; //CONVENZIONE CHE SIA SEMPRE LO STESSO METODO. CAMMINO O MACCHINA.
            roadmap.localita = session_data[roadmap.stages[0].placeId][0].localita;
            roadmap.dataCreazione = new Date().toISOString().slice(0, 19).replace("T", " ");

            const data1 = await this.dao.addRoadmap(roadmap.titolo, roadmap.isPublic, roadmap.durataComplessiva, roadmap.localita, roadmap.descrizione, roadmap.dataCreazione, roadmap.travelMode, roadmap.distanzaComplessiva, user_id);
            const roadmap_id = data1[2].insertId

            var stages_img_dict = {} //ex novo imgs handle
            var stages = roadmap.stages;
            var route;
            var reachTime;

            for (var i = 0; i < stages_img.length; i++) {
                stages_img_dict[stages_img[i].fieldname] = this.getFileName(stages_img[i]);
            }

            for (var i = 0; i < stages.length; i++) {
                var stage = stages[i];
                var stored_stage = session_data[stage.placeId][0]
                stored_stage.latitudine = stored_stage.latitudine === undefined ? stored_stage.geometry.location.lat : stored_stage.latitudine;
                stored_stage.longitudine = stored_stage.longitudine === undefined ? stored_stage.geometry.location.lng : stored_stage.longitudine;
                var isExNovo = session_data[stage.placeId][1]

                if (!isExNovo) {
                    await this.dao.createStage(stage.placeId, isExNovo, stored_stage.latitudine, stored_stage.longitudine, stored_stage.formatted_address, stored_stage.name, stored_stage.website, stored_stage.foto, stored_stage.localita)
                }
                else //è exnovo!
                {
                    stage.fotoURL = stages_img_dict[stage.placeId] || null;
                    console.log(stage.fotoURL)
                    await this.dao.createStage(stage.placeId, isExNovo, stored_stage.latitudine, stored_stage.longitudine, stored_stage.formatted_address, stage.nome, stage.website, stage.fotoURL, stored_stage.localita)

                }

                route = i > 0 ? distance_data[stages[i - 1].placeId + "|" + stage.placeId] : {}

                reachTime = i > 0 ? route.routes[0].legs[0].duration.value : 0;
                route = JSON.stringify(route);
                await this.dao.addStageInstanceToRoadmap(roadmap_id, user_id, stage.placeId, stage.durata, i, reachTime, route)

            }

            return { ok: true, error: 0, data: roadmap_id }
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

            console.log(data)
            var stages = data[2].roadmap.stages;
            var stage;
            for (var i = 0; i < stages.length; i++) {
                stage = stages[i];
                stage.fotoURL = this.mapsHandler.getPhotoUrl(stage.fotoID)
            }

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

    async getDataUser(id_query, id_session) {
        const data = await this.dao.getDataUser(id_query, id_session);
        return { ok: data[0], error: data[1], data: data[2]}
    }

    async getCommmentsReviewByUserRoad(user,rm) {
        if (!user || user == null || !rm || rm == null) { //ricerca nulla
            return { ok: false, error: -4, data: '' }
        }
        else {
            const data = await this.dao.getCommmentsReviewByUserRoad(user, rm);

            return { ok: true, error: data[1], data: data[2] };
        }
    }

    async setCommento(user, roadmap, mod_com, day) {
        if (!roadmap || !user || !user || !mod_com || !day) {
            return { ok: false, error: -4, data: '' }
        }
        else {
            const data = await this.dao.setCommento(user, roadmap, mod_com, day);
            return { ok: true, error: data[1], data: data[2] };
        }
    }

    async updateCommento(user, roadmap, mod_com, day) {
        if (!roadmap || !user || !user || !mod_com || !day) {

            return { ok: false, error: -4, data: '' }
        }
        else {
            const data = await this.dao.updateCommento(user, roadmap, mod_com, day);
            return { ok: true, error: data[1], data: data[2] };
        }
    }
    async setRecensione(user, roadmap, mod_op, mod_val, day) {
        if (!roadmap || !user || !user || !mod_val || !day) {
            return { ok: false, error: -4, data: '' }
        }
        else {
            const data = await this.dao.setRecensione(user, roadmap, mod_op, mod_val, day);
            return { ok: true, error: data[1], data: data[2] };
        }
    }
    async updateRecensione(user, roadmap, mod_op, mod_val, day) {

        const data = await this.dao.updateRecensione(user, roadmap, mod_op, mod_val, day);
        return { ok: true, error: data[1], data: data[2] };

    }
    async setFavorite(user, roadmap, valore) {
        const data = await this.dao.setFavorite(user, roadmap, valore);
        return { ok: true, error: data[1], data: data[2] };
    }

    async setChecked(user, roadmap, valore) {
        const data = await this.dao.setChecked(user, roadmap, valore);
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

    async reportObject(user_id, tipo, idOggetto, motivazione) {
        const data = await this.dao.aggiungiReport(user_id, tipo, idOggetto, motivazione);

        return { ok: data[0], error: data[1] }
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

    async getRoadmapSeguite(id_query, id_session) {
        const data = await this.dao.getRoadmapSeguite(id_query, id_session);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getRoadmapPreferite(id_query, id_session) {
        const data = await this.dao.getRoadmapPreferite(id_query, id_session);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async deleteRoadmapCreata(id_roadmap,id_user) {
        const data = await this.dao.deleteRoadmapCreata(id_roadmap,id_user);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async updateRoadmapSeguite(id_roadmap, id_user) {
        const data = await this.dao.updateRoadmapSeguite(id_roadmap, id_user);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async updateRoadmapPreferite(id_roadmap, id_user) {
        const data = await this.dao.updateRoadmapPreferite(id_roadmap, id_user);
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

    async getAchievements(id) {
        const data = await this.dao.getAchievements(id);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getRoadmapAchievementsPopup(id) {
        const data = await this.dao.getRoadmapAchievementsPopup(id);
        return { ok: data[0], error: data[1], data: data[2] }
    }

}

module.exports = RequestController;