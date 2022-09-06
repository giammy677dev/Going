class ContentController {
    constructor(dao) {
        this.dao = dao;
    }

    async searchUser(username) {
        var data;
        if (!username || username == "") {
            return { ok: false, error: -1, data: {} }
        } else {
            data = await this.dao.searchUser(username);
            return { ok: data[0], error: data[1], data: data[2] };
        }
    }

    async suggestedRoadmap(roadmap, rating) {
        if (!roadmap || !rating || rating <= 0 || rating > 5 || roadmap > 20 || roadmap < 1) {
            return { ok: false, error: -1, data: {} }
        }
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
    async deleteUser(user_id, isAdmin) {
        if (!user_id || !isAdmin) {
            return { ok: false, error: -4, data: {} }
        }
        else {
            const data = await this.dao.deleteUser(user_id, isAdmin);
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

    async deleteStage(idStage, isAdmin) {
        if (!idStage || !isAdmin || isAdmin == false) {
            return { ok: false, error: -4, data: {} }
        }
        else {
            try {
                const data = await this.dao.deleteStage(stageId);
                return { ok: data[0], error: data[1], data: data[2] };
            } catch (error) {
                console.log(error);
                return { ok: false, error: -5, data: {} }
            }
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

    async reportObject(idUtente, tipo, idOggetto, motivazione) {
        if (!idUtente || !tipo || !idOggetto) {
            return { ok: false, error: -1, data: {} }
        }
        /*var data;
        if (tipo == 5) //stage reporting. transform place id to stageId
        {
            var idOggetto = (await this.dao.getStageIdFromPlaceId(idOggetto))[2];
            data = await this.dao.aggiungiReport(idUtente, tipo, idOggetto, motivazione); //ora idOggetto è valido (intero)
        } else {*/
        const data = await this.dao.aggiungiReport(idUtente, tipo, idOggetto, motivazione);
        //}
        return { ok: data[0], error: data[1], data: data[2] }
    }
    async getSegnalazioni() {
        const data = await this.dao.getSegnalazioni();
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async processSegnalazioni(segnalazioni, id_user, isAdmin) {
        for (var i = 0; i < segnalazioni.length; i++) {
            var segnalazione = segnalazioni[i];
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
    async getAchievements(id) {
        const data = await this.dao.getAchievements(id);
        return { ok: data[0], error: data[1], data: data[2] }
    }

    async getRoadmapAchievementsPopup(id) {
        const data = await this.dao.getRoadmapAchievementsPopup(id);
        return { ok: data[0], error: data[1], data: data[2] }
    }
}

module.exports = ContentController;