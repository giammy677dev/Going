const mysql = require('mysql2/promise'); //was var
const config = require('../config/config.js');
const fs = require('fs');
const path = require('path');

class DAO {
    async connect() {
        try {
            var connection = await mysql.createConnection({
                host: config.hostDB,
                user: config.userDB,
                password: config.passwordDB,
                database: config.database,
                //port: 3306
                ssl: {
                    ca: fs.readFileSync(__dirname + '/../config/ca/' + config.ca)
                }
            });
            return connection;
        } catch (err) {
            console.log(err);
        }
    }

    async getRoadmapData(id) {
        try {
            var connection = await this.connect();
            var result_rm = await connection.query('SELECT * FROM roadmap WHERE id=?', [id])
            var result_stages = await connection.query('SELECT * FROM stage INNER JOIN stageInRoadmap on stage.placeId=stageInRoadmap.stage_placeId WHERE stageInRoadmap.roadmap_id=? ORDER BY ordine ', [id])
            var id_utente = result_rm[0][0].utenteRegistrato_id
            var result_us = await connection.query('SELECT username FROM utenteRegistrato WHERE id=?', [id_utente])
            var result = result_rm[0][0]
            result.stages = result_stages[0]
            return [true, 0, { roadmap: result, user: result_us[0] }];
        }
        catch (error) {
            return [false, error.errno];
        }
    }

    async getCommentiRecensioni(roadmap_id) {
        try {
            var connection = await this.connect();
            var result_rec = await connection.query('select idRecensione,id as idUtente,username,valutazione,opinione,dataPubblicazione from recensione inner join utenteRegistrato on recensione.idUtenteRegistrato=utenteRegistrato.id where idRoadmap=?', [roadmap_id])
            var result_comm = await connection.query('select idCommento,id as idUtente,username,testo,dataPubblicazione from commento inner join utenteRegistrato on commento.idUtenteRegistrato=utenteRegistrato.id where idRoadmap=?', [roadmap_id])

            return [true, 0, { recensioni: result_rec[0], commenti: result_comm[0] }];
        }
        catch (error) {
            return [false, error.errno];
        }
    }

    async register(username, password, email, birthdate) {
        try {
            var connection = await this.connect();
            // Execute SQL query that'll insert the account in the database
            const res = await connection.query('INSERT INTO utenteregistrato (username, password, email, birthdate, isAdmin, avatar) VALUES (?, ?, ?, ?, 0, "/storage/avatar/Avatar_0.png")', [username, password, email, birthdate]);
            return [true, 0, { idUser: res[0].insertId }];
        } catch (error) {
            return [false, error.errno, {}];
        }
    }

    async login(username, password) {
        const default_dict = { id: '', username: '', isAdmin: 0 }
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT * FROM utenteregistrato WHERE username = ? AND password = ?', [username, password]);
            //await connection.close();
            let results = selection[0];

            if (results.length > 0) {
                return [true, 0, { id: results[0].id, username: results[0].username, isAdmin: results[0].isAdmin }];
            }
            else {
                return [false, -3, default_dict]; //-3 non si è registrato! Deve registrarsi!
            }
        } catch (error) {
            return [false, error.errno, default_dict];
        }
    }

    async isBanned(email) {
        const default_dict = { banned: false }
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT * FROM blacklist WHERE LOWER(email) = ?', [email.toLowerCase()]);
            //await connection.close();
            let results = selection[0];
            if (results.length > 0) {
                return [true, 0, { banned: true }];
            }
            else {
                return [false, -3, default_dict]; //-3 non si è registrato! Deve registrarsi!
            }
        } catch (error) {
            return [false, error.errno, default_dict];
        }
    }

    async addRoadmap(titolo, isPublic, durata, localita, descrizione, dataCreazione, travelMode, distanza, utenteRegistrato_id) {
        try {
            var connection = await this.connect();
            const res = await connection.query('INSERT INTO roadmap (titolo, isPublic, durata, localita, descrizione, punteggio, dataCreazione, travelMode, distanza, utenteRegistrato_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [titolo, isPublic, durata, localita, descrizione, null, dataCreazione, travelMode, distanza, utenteRegistrato_id]);
            return [true, 0, res[0]];
        } catch (error) {
            console.log(error)
            return [false, error.errno, {}];
        }
    }

    async deleteUser(id_user_to_delete, isAdmin) {
        try {
            if (isAdmin) {
                var connection = await this.connect();
                let selection = await connection.query('SELECT email FROM utenteregistrato WHERE id = ?', [id_user_to_delete]);
                await connection.query('INSERT INTO blacklist (email) VALUES(?)', [selection[0][0].email]);
                await connection.query('DELETE FROM utenteregistrato WHERE id = ?', [id_user_to_delete])
                return [true, 0, {}];
            }
            return [false, -1, {}];
        }
        catch (error) {
            return [false, error.errno || -1, {}];
        }
    }

    async aggiungiReport(idUtente, tipo, idOggetto, motivazione) {
        try {
            var connection = await this.connect();
            await connection.query('INSERT INTO segnalazione (idUtente, tipo, idOggetto, motivazione) VALUES (?, ?, ?, ?)', [idUtente, tipo, idOggetto, motivazione]);
            return [true, 0];
        } catch (error) {
            console.log(error)
            return [false, error.errno];
        }
    }

    async createStage(placeId, isExNovo, latitudine, longitudine, indirizzo, nome, website, fotoID, localita) {
        var connection = await this.connect();
        try {
            await connection.query('INSERT INTO stage (placeId, isExNovo, latitudine, longitudine, indirizzo, nome,  website, fotoID,localita) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', [placeId, isExNovo, latitudine, longitudine, indirizzo, nome, website, fotoID, localita]);
        } catch (error) {
            return [false, error.errno, {}];
        }
        return [true, 0];
    }

    async addStageInstanceToRoadmap(roadmap_id, user_id, placeId, durata, index, reachTime, route) {
        try {
            console.log("adding stage instance")
            var connection = await this.connect();
            await connection.query('INSERT INTO stageinroadmap (roadmap_id, roadmap_utenteRegistrato_id, stage_placeId, durata, ordine, reachTime, route) VALUES(?, ?, ?, ?, ?, ?, ?)', [roadmap_id, user_id, placeId, durata, index, reachTime, route]);
            return [true, 0]
        } catch (error) {
            console.log(error)
            return [false, error.errno];
        }
    }

    async placeIDExists(placeID) {
        try {
            var connection = await this.connect();

            // Execute SQL query that'll select the account from the database based on the specified username and password
            let selection = await connection.query('SELECT placeId,latitudine,longitudine,indirizzo as formatted_address,localita, nome as name,website,fotoID as fotoURL FROM stage WHERE placeId = ?', [placeID]);
            let results = selection[0];

            if (results.length > 0) {
                return [true, 0, { found: true, result: results[0] }];
            }
            else {
                return [false, -1, {}];
            }
        } catch (error) {
            console.log(error)
            return [false, error.errno, {}];
        }
    }

    async placeLatLngExists(lat, lng) {
        try {
            var connection = await this.connect();
            // Execute SQL query that'll select the account from the database based on the specified username and password

            //qui forse ci deve essere un certo scostamento di errore da tollerare
            let selection = await connection.query('SELECT placeId FROM stage WHERE lat = ? AND lng = ?', [lat, lng]);
            let results = selection[0];
            if (results.length > 0) {
                return [true, 0];
            }
            else {
                return [false, -1];
            }
        } catch (error) {
            return [false, error.errno, default_dict];
        }
    }

    async searchRoadmap(ricerca, time, distance) {
        try {
            var connection = await this.connect();
            var query = "SELECT titolo,durata,localita,id,punteggio,distanza,travelMode FROM roadmap WHERE isPublic=1 AND ((titolo LIKE '%" + ricerca + "%') OR (localita LIKE '%" + ricerca + "%'))";

            if (time != null && time > 0) {
                time = time * 3600;
                query += ' AND durata < ' + time;
            }

            if (distance != null && distance > 0) {
                distance = distance * 1000;
                query += ' AND distanza < ' + distance;
            }

            let selection = await connection.query(query);
            let results = { roadmaps: selection[0] };
            return [true, 0, results];

        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async searchUser(username) {
        try {
            var connection = await this.connect();
            var result = await connection.query('SELECT id,username,avatar,birthdate FROM utenteregistrato WHERE LOWER(username) LIKE ?', ['%' + username.toLowerCase() + '%']);
            return [true, 0, { users: result[0] }];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async suggestedRoadmap(roadmap, rating) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT titolo,durata,localita,id,punteggio,distanza,travelMode FROM roadmap WHERE isPublic=1 AND punteggio > ? ORDER BY RAND() LIMIT ?', [rating, roadmap]);
            let results = { roadmaps: selection[0] };
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async getBestRoadmap() {
        try {
            var connection = await this.connect();
            // Execute SQL query that'll insert the account in the database
            var result = await connection.query('SELECT * FROM roadmap WHERE punteggio>4 AND isPublic = 1 ORDER BY RAND() LIMIT 3');
            return [true, 0, result[0]];
        } catch (error) {
            return [false, error.errno, { result: [] }];
        }
    }

    async getExNovoStages() {
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT placeId,latitudine,longitudine FROM stage WHERE isExNovo = 1');
            let results = selection[0];

            if (results.length > 0) {
                return [true, 0, results];
            }
            else {
                return [false, -5, { placeId: '', nome: '' }]; //Non ci sono nodi ex novo nel database
            }
        } catch (error) {
            return [false, error.errno, { placeId: '', nome: '' }];
        }
    }

    async getDataUser(id_query, id_session) {
        try {
            var connection = await this.connect();

            if (id_query === undefined || id_query <= 0) {
                id_query = id_session;
            }

            let selection = await connection.query('SELECT id,username,email,birthdate,avatar,isAdmin FROM utenteregistrato WHERE id = ?', [id_query]);
            //let results = [selection[0], id_session == id_query];
            let results = { info: selection[0][0], isMe: id_session == id_query };
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async getMinimalDataUser(id_query) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT id,username,avatar FROM utenteregistrato WHERE id = ?', [id_query]);
            //let results = [selection[0], id_session == id_query];
            let results = { info: selection[0][0] || {} }; //if undefined puts {} in info
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async getPreferredFavouriteStatusByUserByRoadmap(id_user, id_roadmap) {
        try {
            var connection = await this.connect();
            var result = await connection.query('select preferita,seguita from roadmapuser where idUtenteRegistrato=? AND idRoadmap=?', [id_user, id_roadmap])
            if (result[0].length != 0) {
                return [true, 0, { preferita: result[0][0].preferita, seguita: result[0][0].seguita }]
            } else {
                return [true, 0, { preferita: 0, seguita: 0 }]
            }
        } catch (error) {
            return [false, error.errno, {}];
        }
        return [false, -1, {}];
    }

    async getCommmentsReviewByUserRoad(user, rm) {
        try {
            var connection = await this.connect();
            var pref = 0
            var fatta = 0
            var result_rec = await connection.query('select idRecensione,valutazione,opinione,dataPubblicazione from recensione where idUtenteRegistrato=? AND idRoadmap=?', [user, rm])
            var result_com = await connection.query('select idCommento,testo,dataPubblicazione from commento where idUtenteRegistrato=? AND idRoadmap=?', [user, rm])
            var result = await connection.query('select preferita,seguita from roadmapuser where idUtenteRegistrato=? AND idRoadmap=?', [user, rm])
            if (result[0].length != 0) {
                pref = result[0][0].preferita
                fatta = result[0][0].seguita
            }
            return [true, 0, { results_rec: result_rec[0], results_com: result_com[0], pref: pref, fatta: fatta }];
        }
        catch (error) {
            return [false, error.errno];
        }
    }

    async createCommento(user_id, roadmap_id, messaggio, now) {
        try {
            var connection = await this.connect();
            var resultCommento = await connection.query('INSERT INTO commento (idUtenteRegistrato, idRoadmap, testo,dataPubblicazione) VALUES (?, ?, ?, ?)', [user_id, roadmap_id, messaggio, now])
            let commentsNumber = await connection.query('SELECT COUNT(*) AS numberComments FROM commento WHERE idUtenteRegistrato = ?', [user_id]);
            return [true, 0, { idCommento: resultCommento[0].insertId, now: now, numCommentiUtente: commentsNumber[0][0].numberComments }];
        }
        catch (error) {
            return [false, error.errno];
        }
    }

    async createRecensione(user_id, roadmap_id, opinione, valutazione, now) {
        try {
            var connection = await this.connect();
            var res_ins = await connection.query('INSERT INTO recensione (idUtenteRegistrato, idRoadmap,valutazione,opinione,dataPubblicazione) VALUES (?, ?, ?, ?,?)', [user_id, roadmap_id, valutazione, opinione, now])
            var dati = await connection.query('SELECT count(*) AS numeroRecensioni, SUM(valutazione) AS somma FROM recensione WHERE idRoadmap = ?', [roadmap_id])
            var numeroRecensioniUtenteQuery = await connection.query('SELECT count(*) AS numeroRecensioniUtente FROM recensione WHERE idUtenteRegistrato = ?', [user_id])
            var numeroRecensioni = dati[0][0].numeroRecensioni
            var numeroRecensioniUtente = numeroRecensioniUtenteQuery[0][0].numeroRecensioniUtente
            var somma = dati[0][0].somma
            var media = parseFloat(somma / numeroRecensioni)
            var res_upd_media = await connection.query('UPDATE roadmap SET punteggio = ? WHERE id=?', [media, roadmap_id])
            //res upd media veniva passato alla soluzione ma perchè?
            //return [true, 0, { idRecensione: res_ins[0].insertId, res_upd_media: res_upd_media[0], numRecensioniUtente: numeroRecensioniUtente }];
            return [true, 0, { idRecensione: res_ins[0].insertId, now: now, numRecensioniUtente: numeroRecensioniUtente }];
        }
        catch (error) {
            return [false, error.errno];
        }
    }

    async updateCommento(user_id, idCommento, messaggio, now) {
        try {
            var connection = await this.connect();
            var res = await connection.query('UPDATE commento SET testo = ?, dataPubblicazione = ? WHERE idCommento = ? AND idUtenteRegistrato = ?', [messaggio, now, idCommento, user_id])
            return [true, 0, { idCommento: res[0].insertId, now: now }];
        }
        catch (error) {
            return [false, error.errno];
        }
    }

    async deleteStage(stageId) {
        try {
            var connection = await this.connect();
            var res = await connection.query('DELETE FROM stage WHERE idStage = ?', [stageId])
            return [true, 0, res[0]];

        }
        catch (error) {
            return [false, error.errno];
        }
    }

    async deleteSegnalazioni(idOggetto, tipo) { //plurale perché eliminate tutte quelle riferite allo stesso oggetto!
        try {
            var connection = await this.connect();
            await connection.query('DELETE FROM segnalazione WHERE idOggetto = ? AND tipo = ?', [idOggetto, tipo])
            return [true, 0, []];
        }
        catch (error) {
            console.log(error)
            return [false, error.errno, []];
        }
    }

    async getOggettoBySegnalazione(idSegnalazione) {
        try {
            console.log(idSegnalazione)

            var connection = await this.connect();
            let selection = await connection.query('SELECT idOggetto,tipo FROM segnalazione WHERE idSegnalazione = ?', [idSegnalazione]);

            return [true, 0, selection[0][0] || null];
        }
        catch (error) {
            console.log(error)
            return [false, error.errno, []];
        }
    }

    async deleteCommento(idCommento, user_id, isAdmin) {
        try {

            var connection = await this.connect();
            var res;
            if (isAdmin) {
                res = await connection.query('DELETE FROM commento WHERE idCommento = ?', [idCommento])
            } else {
                res = await connection.query('DELETE FROM commento WHERE idCommento = ? AND idUtenteRegistrato = ? ', [idCommento, user_id])
            }

            return [res[0].affectedRows != 0, res[0].affectedRows - 1, {}];

        }
        catch (error) {
            return [false, error.errno];
        }
    }

    async deleteRecensione(idRecensione, user_id, isAdmin) {
        try {

            var connection = await this.connect();
            var res;
            if (isAdmin) {
                res = await connection.query('DELETE FROM recensione WHERE idRecensione = ? ', [idRecensione])
            } else {
                res = await connection.query('DELETE FROM recensione WHERE idRecensione = ? and idUtenteRegistrato = ? ', [idRecensione, user_id])
            }

            return [res[0].affectedRows != 0, res[0].affectedRows - 1, {}];

        }
        catch (error) {
            return [false, error.errno];
        }
    }

    async updateRecensione(user_id, idRecensione, opinione, valutazione, now) {
        try {
            var connection = await this.connect();
            //idUtenteRegistrato serve a verificare che sia lui che ha inviato la query. un altro user non può fare le query per questo e così via.
            //la seconda condizione discrimina univocamente la recensione. (idRecensione)
            var res_ins = await connection.query('UPDATE recensione SET valutazione=?, opinione=?, dataPubblicazione=? where idUtenteRegistrato=? and idRecensione=?', [valutazione, opinione, now, user_id, idRecensione])
            var roadmap_id = (await connection.query('SELECT idRoadmap FROM recensione WHERE idRecensione = ?', [idRecensione]))
            roadmap_id = roadmap_id[0][0].idRoadmap;
            var dati = await connection.query('SELECT count(*) AS numeroRecensioni, SUM(valutazione) AS somma FROM recensione WHERE idRoadmap = ?', [roadmap_id])

            var numeroRecensioni = dati[0][0].numeroRecensioni
            var somma = dati[0][0].somma
            var media = parseFloat(somma / numeroRecensioni)
            var res_upd_media = await connection.query('UPDATE roadmap SET punteggio = ? WHERE id=?', [media, roadmap_id])
            //res upd media ancora non si sa cosa fa nel frontend
            return [res_ins[0].affectedRows == 1, 0, { idRecensione: idRecensione, now: now }]; //idRecensione ridondante ma va bene è coerente
        }
        catch (error) {
            console.log(error)
            return [false, error.errno];
        }
    }

    async setRoadmapFavouriteState(user, roadmap, valore) {
        try {
            var connection = await this.connect();
            var query;
            var see = await connection.query('select * from roadmapuser where idUtenteRegistrato=? and idRoadmap=?', [user, roadmap])
            if (see[0].length == 0) {
                //mai messo nulla
                query = await connection.query('INSERT INTO roadmapuser (idUtenteRegistrato,idRoadmap,preferita) VALUES (?,?,?)', [user, roadmap, valore])
            }
            else {
                query = await connection.query('UPDATE roadmapuser SET preferita=? where idUtenteRegistrato=? and idRoadmap=?', [valore, user, roadmap])
            }

            let numberFollowedResult = await connection.query('SELECT COUNT(*) AS numberFollowedRoadmap FROM roadmapuser WHERE preferita = 1 and idUtenteRegistrato = ?', [user])
            let results = numberFollowedResult[0][0].numberFollowedRoadmap;

            return [true, 0, results];
        }
        catch (error) {
            return [false, error.errno, {}];
        }
    }

    async setRoadmapCheckedState(user, roadmap, valore) {
        try {
            var connection = await this.connect();
            var see = await connection.query('SELECT * FROM roadmapuser WHERE idUtenteRegistrato = ? AND idRoadmap = ?', [user, roadmap])
            if (see[0].length == 0) {
                //mai messo nulla
                await connection.query('INSERT INTO roadmapuser (idUtenteRegistrato,idRoadmap,seguita) VALUES (?,?,?)', [user, roadmap, valore])
            }
            else {
                await connection.query('UPDATE roadmapuser SET seguita = ? where idUtenteRegistrato = ? and idRoadmap = ?', [valore, user, roadmap])
            }

            let numberFollowedResult = await connection.query('SELECT COUNT(*) AS numberFollowedRoadmap FROM roadmapuser WHERE seguita = 1 and idUtenteRegistrato = ?', [user])
            let results = numberFollowedResult[0][0].numberFollowedRoadmap;

            return [true, 0, results];
        }
        catch (error) {
            return [false, error.errno];
        }
    }

    async getRoadmapCreate(id_query, id_session) {
        try {
            var connection = await this.connect();
            var query = 'SELECT id, localita, punteggio, titolo, distanza, durata,travelMode,isPublic FROM roadmap WHERE utenteRegistrato_id = ?';
            query = id_query == id_session ? query : query + 'AND isPublic = 1';

            let selection = await connection.query(query, [id_query]);
            let results = { roadmaps: selection[0] };
            return [true, 0, results];

        } catch (error) {
            return [false, error.errno, { results: {} }];
        }
    }

    async getSegnalazioni() {
        try {
            var connection = await this.connect();

            var query = 'SELECT * FROM segnalazione ORDER BY idSegnalazione';
            let selection = await connection.query(query);
            let results = { segnalazioni: selection[0] };
            return [true, 0, results];

        } catch (error) {
            return [false, error.errno, { results: {} }];
        }
    }

    async getRoadmapSeguite(id_query, id_session) {
        try {
            var connection = await this.connect();
            var query = 'SELECT id, localita, punteggio, titolo, distanza, durata,travelMode,isPublic FROM roadmapuser, roadmap WHERE roadmap.id = roadmapuser.idRoadmap AND seguita = 1 and idUtenteRegistrato= ?';
            query = id_query == id_session ? query : query + 'AND roadmap.isPublic = 1';

            let selection = await connection.query(query, [id_query]);
            let results = { roadmaps: selection[0] };
            return [true, 0, results];

        } catch (error) {
            return [false, error.errno, { results: {} }];
        }
    }

    async getRoadmapPreferite(id_query, id_session) {
        try {
            var connection = await this.connect();
            var query = 'SELECT id, localita, punteggio, titolo, distanza, durata,travelMode,isPublic FROM roadmapuser, roadmap WHERE roadmap.id = roadmapuser.idRoadmap AND preferita = 1 and idUtenteRegistrato= ?';
            query = id_query == id_session ? query : query + 'AND roadmap.isPublic = 1';

            let selection = await connection.query(query, [id_query]);
            let results = { roadmaps: selection[0] };
            return [true, 0, results];

        } catch (error) {
            return [false, error.errno, { results: {} }];
        }
    }

    async deleteRoadmap(id_roadmap, id_user_session, isAdmin) {
        try {
            var connection = await this.connect();
            let roadmapInfo = await connection.query('SELECT utenteRegistrato_id from roadmap WHERE id = ?', [id_roadmap])
            let roadmapIdUserRegistrato = roadmapInfo[0][0].utenteRegistrato_id;

            if ((id_user_session || 0) == roadmapIdUserRegistrato || isAdmin) { //if la roadmap è sua oppure è admin (privilegi)
                //per modularità andrebbe fuori il check ma si dovrebbe fare una funzione getRoadmapCreatorFromRoadmap()
                await connection.query('DELETE FROM roadmap WHERE id = ?', [id_roadmap])
                let roadmapResult = await connection.query('SELECT COUNT(*) AS numberRoadmap FROM roadmap WHERE utenteRegistrato_id = ?', [roadmapIdUserRegistrato])
                let results = roadmapResult[0][0].numberRoadmap;
                return [true, 0, results];
            }
            return [false, 0, []];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async updateRoadmapSeguite(id_roadmap, id_user) {
        try {
            var connection = await this.connect();
            await connection.query('UPDATE roadmapuser SET seguita = 0 WHERE idRoadmap = ? AND idUtenteRegistrato= ?', [id_roadmap, id_user]);
            let numberFollowedResult = await connection.query('SELECT COUNT(*) AS numberFollowedRoadmap FROM roadmapuser WHERE seguita = 1 and idUtenteRegistrato = ?', [id_user])
            let results = numberFollowedResult[0][0].numberFollowedRoadmap;
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async updateRoadmapPreferite(id_roadmap, id_user) {
        try {
            var connection = await this.connect();
            await connection.query('UPDATE roadmapuser SET preferita = 0 WHERE idRoadmap = ? AND idUtenteRegistrato= ?', [id_roadmap, id_user]);
            let numberFavoriteResult = await connection.query('SELECT COUNT(*) AS numberFavoriteRoadmap FROM roadmapuser WHERE preferita = 1 and idUtenteRegistrato= ?', [id_user])
            let results = numberFavoriteResult[0][0].numberFavoriteRoadmap;
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async updateAvatar(id, new_avatar) {
        try {
            var connection = await this.connect();
            await connection.query('UPDATE utenteregistrato SET avatar = ? WHERE id = ?', [new_avatar, id]);
            //let results = selection[0];
            return [true, 0, {}];
        } catch (error) {
            return [false, error.errno, {}];
        }
    }

    async getMarkersFromRect(centerLatInf, centerLatSup, centerLngInf, centerLngSup) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT * FROM stage WHERE latitudine >= ? AND latitudine <= ? AND longitudine >= ? AND longitudine <= ? AND isExNovo = 1', [centerLatInf, centerLatSup, centerLngInf, centerLngSup]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async getAchievements(id) {
        try {
            var connection = await this.connect();
            let roadmapResult = await connection.query('SELECT COUNT(*) AS numberRoadmap FROM roadmap WHERE utenteRegistrato_id = ?', [id]);
            let followedRoadmapResult = await connection.query('SELECT COUNT(*) AS numberFollowedRoadmap FROM roadmapuser WHERE idUtenteRegistrato = ? AND seguita = 1', [id]);
            let reviewsResult = await connection.query('SELECT COUNT(*) AS numberReviews FROM recensione WHERE idUtenteRegistrato = ?', [id]);
            let commentsResult = await connection.query('SELECT COUNT(*) AS numberComments FROM commento WHERE idUtenteRegistrato = ?', [id]);
            let results = { createdRoadmapCount: roadmapResult[0][0].numberRoadmap, followedRoadmapCount: followedRoadmapResult[0][0].numberFollowedRoadmap, reviewedRoadmapCount: reviewsResult[0][0].numberReviews, commentedRoadmapCount: commentsResult[0][0].numberComments };
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, {}];
        }
    }

    async getRoadmapAchievementsPopup(id) {
        try {
            var connection = await this.connect();
            let roadmapResult = await connection.query('SELECT COUNT(*) AS numberRoadmap FROM roadmap WHERE utenteRegistrato_id = ?', [id]);
            let results = roadmapResult[0][0].numberRoadmap;
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }
}

module.exports = DAO