const DAO = require('../Model/DAO.js');
const MapsHandler = require('./MapsHandler.js');
const md5 = require('md5');
const config = require('../config/config.js');

class RequestController {
    constructor() {
        this.dao = new DAO();
        this.mapsHandler = new MapsHandler();
    }

    async register(username, password, email, birthdate) {
        //Ensure the input fields exists and are not empty
        if (username && password && email && birthdate) {

            var isBanned = (await this.dao.isBanned(email))[2].banned;

            if (isBanned) {
                return { ok: false, error: -777, data: {} } //banned alert
            } else {
                password = md5(password);
                const data = await this.dao.register(username, password, email, birthdate);
                return { ok: data[0], error: data[1], data: data[2] };
            }
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
            durata += stages[i].durata;
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
        return config.stagesFolder + "/" + file.fieldname + "." + split[split.length - 1]
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
            console.log(roadmap_id)
            return { ok: true, error: 0, data: { roadmapId: roadmap_id } }
        }
        return { ok: false, error: -5, data: {} } //return error!
    }

    async searchRoadmap(ricerca, time, distance) {
        const data = await this.dao.searchRoadmap(ricerca, time, distance);
        return { ok: true, error: data[1], data: data[2] };
    }

    async searchUser(username) {
        const data = await this.dao.searchUser(username);
        return { ok: data[0], error: data[1], data: data[2] };
    }

    async suggestedRoadmap(roadmap, rating) {
        const data = await this.dao.suggestedRoadmap(roadmap, rating);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getPreferredFavouriteStatusByUserByRoadmap(id_user, id_roadmap) {
        if (id_user !== null && id_roadmap !== null) {
            const data = await this.dao.getPreferredFavouriteStatusByUserByRoadmap(id_user, id_roadmap);
            return { ok: data[0], error: data[1], data: data[2] };
        }
        return { ok: false, error: -2, data: {} };
    }
    async getRoadmapData(id) {

        if (!id || id == null) { //rm nullo
            return { ok: false, error: -4, data: { id: '' } }
        }
        else {
            try {
                const data = await this.dao.getRoadmapData(id);

                var stages = data[2].roadmap.stages;
                var stage;
                for (var i = 0; i < stages.length; i++) {
                    stage = stages[i];
                    stage.fotoURL = this.mapsHandler.getPhotoUrl(stage.fotoID)
                }
                return { ok: data[0], error: data[1], data: data[2] };
            } catch (error) {
                console.log(error)
                return { ok: false, error: error.errno, data: {} }
            }
        }
    }
    
    async getCommentiRecensioni(roadmap_id) {
        if (!roadmap_id || roadmap_id == null) { //rm nullo
            return { ok: false, error: -4, data: { id: '' } }
        }
        else {
            const data = await this.dao.getCommentiRecensioni(roadmap_id);

            return { ok: data[0], error: data[1], data: data[2] };
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
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getUserStatus(id_session) {
        const data = await this.dao.getMinimalDataUser(id_session, id_session); //use getdatauser again but in anotha way
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getCommmentsReviewByUserRoad(user, rm) {
        if (!user || user == null || !rm || rm == null) { //ricerca nulla
            return { ok: false, error: -4, data: '' }
        }
        else {
            const data = await this.dao.getCommmentsReviewByUserRoad(user, rm);

            return { ok: data[0], error: data[1], data: data[2] };
        }
    }

    async createCommento(user_id, roadmap_id, messaggio) {
        if (!roadmap_id || !user_id || !messaggio || messaggio == "") {
            return { ok: false, error: -4, data: '' }
        }
        else {
            const now = new Date()
            const data = await this.dao.createCommento(user_id, roadmap_id, messaggio, now);
            return { ok: data[0], error: data[1], data: data[2] };
        }
    }

    async updateCommento(user_id, idCommento, messaggio) {
        if (!user_id || !idCommento || !messaggio) {

            return { ok: false, error: -4, data: '' }
        }
        else {
            const now = new Date()
            const data = await this.dao.updateCommento(user_id, idCommento, messaggio, now);
            return { ok: data[0], error: data[1], data: data[2] };
        }
    }
    async deleteUser(user_id) {
        if (!user_id) {
            return { ok: false, error: -4, data: {} }
        }
        else {
            const data = await this.dao.deleteUser(user_id);
            return { ok: data[0], error: data[1], data: data[2] };
        }
    }

    async deleteCommento(user_id, idCommento, isAdmin) {
        if (!idCommento || !user_id) {
            return { ok: false, error: -4, data: '' }
        }
        else {
            const data = await this.dao.deleteCommento(idCommento, user_id, isAdmin);
            return { ok: data[0], error: data[1], data: data[2] };
        }
    }

    async deleteRecensione(user_id, idRecensione, isAdmin) {
        if (!idRecensione || !user_id) {
            return { ok: false, error: -4, data: '' }
        }
        else {
            const data = await this.dao.deleteRecensione(idRecensione, user_id, isAdmin);
            return { ok: data[0], error: data[1], data: data[2] };
        }
    }

    async deleteStage(stageId) {
        if (!stageId) {
            return { ok: false, error: -4, data: {} }
        }
        else {
            const data = await this.dao.deleteStage(stageId);
            return { ok: data[0], error: data[1], data: data[2] };
        }
    }

    async createRecensione(user_id, roadmap_id, opinione, valutazione) {
        if (!user_id || !roadmap_id || !opinione || !valutazione || valutazione > 5 || valutazione < 1) {
            return { ok: false, error: -4, data: '' }
        }
        else {
            try {
                const now = new Date()
                const data = await this.dao.createRecensione(user_id, roadmap_id, opinione, valutazione, now);
                return { ok: data[0], error: data[1], data: data[2] };
            } catch (error) {
                console.log(error)
                return { ok: false, error: -4, data: '' }
            }
        }
    }

    async updateRecensione(user_id, idRecensione, opinione, valutazione) {
        if (!user_id || !idRecensione || !opinione || !valutazione || opinione.length == 0 || valutazione < 1 || valutazione > 5) {
            return { ok: false, error: -4, data: '' }
        } else {
            const now = new Date()
            const data = await this.dao.updateRecensione(user_id, idRecensione, opinione, valutazione, now);
            return { ok: data[0], error: data[1], data: data[2] };
        }
    }

    async setRoadmapFavouriteState(user_id, roadmap_id, newStatus) {
        const data = await this.dao.setRoadmapFavouriteState(user_id, roadmap_id, newStatus);
        return { ok: data[0], error: data[1], data: data[2] };
    }

    async setRoadmapCheckedState(user_id, roadmap_id, newStatus) {
        const data = await this.dao.setRoadmapCheckedState(user_id, roadmap_id, newStatus);
        return { ok: data[0], error: data[1], data: data[2] };
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

    async reportObject(idUtente, tipo, idOggetto, motivazione) {
        if(!idUtente || !tipo || !idOggetto){
            return { ok: false, error: -1, data: {}}
        }
        const data = await this.dao.aggiungiReport(idUtente, tipo, idOggetto, motivazione);

        return { ok: data[0], error: data[1], data:data[2]}
    }

    async getPlaceFromCoords(lat, lng) {
        //stesso discorso di placeinfo!! c'è bisogno di una chiamata al db pe vedere se già esiste. se già esiste è inutile 
        //fare chiamate a google

        const data = await this.mapsHandler.getPlaceFromCoords(lat, lng);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getSegnalazioni() {
        const data = await this.dao.getSegnalazioni();
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async processSegnalazioni(segnalazioni, id_user, isAdmin) {
        console.log(segnalazioni)
        for (var i = 0; i < segnalazioni.length; i++) {
            var segnalazione = segnalazioni[i];
            console.log(segnalazione)
            const objInfo = (await this.dao.getOggettoBySegnalazione(segnalazione.idSegnalazione))[2];
            if (objInfo !== null) {
                const idOggetto = objInfo.idOggetto;
                const tipo = objInfo.tipo;
                if (segnalazione.action.toLowerCase() == "accept") {
                    switch (tipo) {
                        case 1:
                            await this.dao.deleteRoadmap(idOggetto, id_user, isAdmin);
                            break;
                        case 2:
                            await this.dao.deleteUser(idOggetto, isAdmin);
                            break;
                        case 3:
                            await this.dao.deleteRecensione(idOggetto, id_user, isAdmin);
                            break;
                        case 4:
                            await this.dao.deleteCommento(idOggetto, id_user, isAdmin)
                            break;
                    }
                }
                await this.dao.deleteSegnalazioni(idOggetto, tipo);
            }
        }

        return { ok: true, error: 0, data: {} }
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

    async deleteRoadmap(id_roadmap, id_user, isAdmin) {
        const data = await this.dao.deleteRoadmap(id_roadmap, id_user, isAdmin);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    /*async updateRoadmapSeguite(id_roadmap, id_user) {
        const data = await this.dao.updateRoadmapSeguite(id_roadmap, id_user);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async updateRoadmapPreferite(id_roadmap, id_user) {
        const data = await this.dao.updateRoadmapPreferite(id_roadmap, id_user);
        return { ok: data[0], error: data[1], data: data[2] }
    }*/

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