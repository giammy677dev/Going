const DAO = require('../Model/DAO.js');
const MapsHandler = require('./MapsHandler.js');
const md5 = require('md5');
const config = require('../config/config.js');

class MapController {
    constructor(dao) {
        this.dao = dao;
        this.mapsHandler = new MapsHandler();
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
        return '/storage/'+config.stagesFolder + "/" + file.fieldname + "." + split[split.length - 1]
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

            var stages_img_dict = {}
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
                else
                {
                    stage.fotoURL = stages_img_dict[stage.placeId] || null;
                    await this.dao.createStage(stage.placeId, isExNovo, stored_stage.latitudine, stored_stage.longitudine, stored_stage.formatted_address, stage.nome, stage.website, stage.fotoURL, stored_stage.localita)

                }

                route = i > 0 ? distance_data[stages[i - 1].placeId + "|" + stage.placeId] : {}

                reachTime = i > 0 ? route.routes[0].legs[0].duration.value : 0;
                route = JSON.stringify(route);
                await this.dao.addStageInstanceToRoadmap(roadmap_id, user_id, stage.placeId, stage.durata, i, reachTime, route)

            }
            return { ok: true, error: 0, data: { roadmapId: roadmap_id } }
        }
        return { ok: false, error: -5, data: {} }
    }
    async searchRoadmap(ricerca, time, distance) {
        const data = await this.dao.searchRoadmap(ricerca, time, distance);
        return { ok: true, error: data[1], data: data[2] };
    }
    async getRoadmapData(id,user_id,isAdmin) {
        if (!id || id == null || user_id===undefined || isAdmin===undefined) { //rm nullo
            return { ok: false, error: -4, data: { id: '' } }
        }
        else {
            try {
                const data = await this.dao.getRoadmapData(id,user_id,isAdmin);

                var stages = data[2].roadmap.stages || [];
                var stage;
                for (var i = 0; i < stages.length; i++) {
                    stage = stages[i];
                    stage.fotoURL = this.mapsHandler.getPhotoUrl(stage.isExNovo==1, stage.fotoID)
                }
                return { ok: data[0], error: data[1], data: data[2] };
            } catch (error) {
                console.log(error)
                return { ok: false, error: error.errno, data: {} }
            }
        }
    }

    async getPlaceInfo(id) {
        
        const localHit = await this.dao.placeIDExists(id);
        if (localHit[0] && localHit[2].found) {
            return { ok: localHit[0], error: localHit[1], data: localHit[2].result }
        }
        const data = await this.mapsHandler.getPlaceDetails(id);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getRoute(placeId1, placeId2, travelMode) {
        if(!placeId1 || !placeId2 || !travelMode){
            return {ok:false,error:-1,data:{}}
        }
        const data = await this.mapsHandler.getRoute(placeId1, placeId2, travelMode);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    
    async getPlaceFromCoords(lat, lng) {
        const data = await this.mapsHandler.getPlaceFromCoords(lat, lng);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    
    async deleteRoadmap(id_roadmap, id_user, isAdmin) {
        const data = await this.dao.deleteRoadmap(id_roadmap, id_user, isAdmin);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getMarkersFromRect(centerLatInf, centerLatSup, centerLngInf, centerLngSup) {
        const data = await this.dao.getMarkersFromRect(centerLatInf, centerLatSup, centerLngInf, centerLngSup);
        return { ok: data[0], error: data[1], data: data[2] }
    }
}

module.exports = MapController;