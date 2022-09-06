const DAO = require('../Model/DAO.js');
const MapsHandler = require('./MapsHandler.js');
const config = require('../config/config.js');
const userController = require('./UserController.js');
const mapController = require('./MapController.js');
const contentController = require('./ContentController.js');

class MainController {
    constructor() {
        this.dao = new DAO();
        this.userController = new userController(this.dao);
        this.mapController = new mapController(this.dao);
        this.contentController = new contentController(this.dao);
        this.mapsHandler = new MapsHandler();
    }

    async register(username, password, email, birthdate) {
        return await this.userController.register(username, password, email, birthdate);
    }

    async login(username, password) {
        return await this.userController.login(username, password);
    }

    async createRoadmap(user_id, roadmap, session_data, distance_data, stages_img) {
        return await this.mapController.createRoadmap(user_id, roadmap, session_data, distance_data, stages_img);
    }

    async searchRoadmap(ricerca, time, distance) {
        return await this.mapController.searchRoadmap(ricerca, time, distance);
    }

    async searchUser(username) {
        return await this.contentController.searchUser(username);
    }

    async suggestedRoadmap(roadmap, rating) {
        return await this.contentController.suggestedRoadmap(roadmap, rating);
    }

    async getPreferredFavouriteStatusByUserByRoadmap(id_user, id_roadmap) {
        return await this.contentController.getPreferredFavouriteStatusByUserByRoadmap(id_user, id_roadmap);
    }

    async getRoadmapData(id) {
        return await this.mapController.getRoadmapData(id);
    }
    
    async getCommentiRecensioni(roadmap_id) {
        return await this.contentController.getCommentiRecensioni(roadmap_id)
    }

    async getBestRoadmap() {
        return await this.contentController.getBestRoadmap()
    }

    /*async getExNovoStages() {
        return await this.mapController.getExNovoStages()
    }*/

    async getDataUser(id_query, id_session) {
        return await this.userController.getDataUser(id_query, id_session)
    }

    async getUserStatus(id_session) {
        return await this.userController.getUserStatus(id_session)
    }

    async createCommento(user_id, roadmap_id, messaggio) {
        return await this.contentController.createCommento(user_id, roadmap_id, messaggio)
    }

    async updateCommento(user_id, idCommento, messaggio) {
        return await this.contentController.updateCommento(user_id, idCommento, messaggio) 
    }
    async deleteUser(user_id,isAdmin) {
        return await this.contentController.deleteUser(user_id,isAdmin) 
    }

    async deleteCommento(user_id, idCommento, isAdmin) {
        return await this.contentController.deleteCommento(user_id, idCommento, isAdmin) 
    }

    async deleteRecensione(user_id, idRecensione, isAdmin) {
        return await this.contentController.deleteRecensione(user_id, idRecensione, isAdmin) 
    }

    async deleteStage(idStage,isAdmin) {
        return await this.contentController.deleteStage(idStage,isAdmin) 
    }

    async createRecensione(user_id, roadmap_id, opinione, valutazione) {
        return await this.contentController.createRecensione(user_id, roadmap_id, opinione, valutazione) 
    }

    async updateRecensione(user_id, idRecensione, opinione, valutazione) {
        return await this.contentController.updateRecensione(user_id, idRecensione, opinione, valutazione)
    }

    async setRoadmapFavouriteState(user_id, roadmap_id, newStatus) {
        return await this.userController.setRoadmapFavouriteState(user_id, roadmap_id, newStatus)
    }

    async setRoadmapCheckedState(user_id, roadmap_id, newStatus) {
        return await this.userController.setRoadmapCheckedState(user_id, roadmap_id, newStatus)
    }

    async getPlaceInfo(id) {
        return await this.mapController.getPlaceInfo(id)
    }

    async getRoute(placeId1, placeId2, travelMode) {
        return await this.mapController.getRoute(placeId1, placeId2, travelMode)
    }

    async reportObject(idUtente, tipo, idOggetto, motivazione) {
        return await this.contentController.reportObject(idUtente, tipo, idOggetto, motivazione)
    }

    async getPlaceFromCoords(lat, lng) {
        return await this.mapController.getPlaceFromCoords(lat, lng)
    }

    async getSegnalazioni() {
        return await this.contentController.getSegnalazioni()
    }

    async processSegnalazioni(segnalazioni, id_user, isAdmin) {
        return await this.contentController.processSegnalazioni(segnalazioni, id_user, isAdmin)
    }

    async getRoadmapCreate(id_query, id_session) {
        return await this.contentController.getRoadmapCreate(id_query, id_session)
    }

    async getRoadmapSeguite(id_query, id_session) {
        return await this.contentController.getRoadmapSeguite(id_query, id_session)
    }

    async getRoadmapPreferite(id_query, id_session) {
        return await this.contentController.getRoadmapPreferite(id_query, id_session)
    }

    async deleteRoadmap(id_roadmap, id_user, isAdmin) {
        return await this.mapController.deleteRoadmap(id_roadmap, id_user, isAdmin)
    }

    async updateAvatar(id, new_avatar_index) {
        return await this.userController.updateAvatar(id, new_avatar_index)
    }

    async getMarkersFromRect(centerLatInf, centerLatSup, centerLngInf, centerLngSup) {
        return await this.mapController.getMarkersFromRect(centerLatInf, centerLatSup, centerLngInf, centerLngSup)
    }

    async getAchievements(id) {
        return await this.contentController.getAchievements(id)
    }

    async getRoadmapAchievementsPopup(id) {
        return await this.contentController.getRoadmapAchievementsPopup(id)
    }
}

module.exports = MainController;