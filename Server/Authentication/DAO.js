var mysql = require('mysql2/promise');
const config = require('./config.js');
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
                    ca: fs.readFileSync(path.resolve(__dirname + "/ca", config.ca))
                }
            });
            return connection;
        } catch (err) {
            console.log(err);
        }
    }
    async viewRoadmap(id) {

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
    async getRecCom(id) {
        try {

            var connection = await this.connect();
            var result_rec = await connection.query('select idRecensione,username,valutazione,opinione,dataPubblicazione from recensione inner join utenteRegistrato on recensione.idUtenteRegistrato=utenteRegistrato.id where idRoadmap=?', [id])
            var result_comm = await connection.query('select idCommento,username,testo,dataPubblicazione from commento inner join utenteRegistrato on commento.idUtenteRegistrato=utenteRegistrato.id where idRoadmap=?', [id])

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
            const res = await connection.query('INSERT INTO utenteregistrato (username, password, email, birthdate, isAdmin, avatar) VALUES (?, ?, ?, ?, 0, "/avatar/Avatar_0.png")', [username, password, email, birthdate]);
            return [true, 0, res[0]];
        } catch (error) {
            return [false, error.errno];
        }
    }

    async login(username, password) {
        const default_dict = { id: '', username: '', isAdmin: 0 }
        try {
            var connection = await this.connect();
            // Execute SQL query that'll select the account from the database based on the specified username and password
            let selection = await connection.query('SELECT * FROM utenteregistrato WHERE username = ? AND password = ?', [username, password]);
            let results = selection[0];
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                return [true, 0, { id: results[0].id, username: results[0].username, isAdmin: results[0].isAdmin }];
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
            //console.log('INSERT INTO roadmap (titolo, isPublic, durata, localita, descrizione, punteggio, dataCreazione, utenteRegistrato_id) VALUES(?, ?, ?, ?, ?, NULL, ?, ?)', [titolo, isPublic, durata, localita, descrizione, dataCreazione, utenteRegistrato_id])
            const res = await connection.query('INSERT INTO roadmap (titolo, isPublic, durata, localita, descrizione, punteggio, dataCreazione, travelMode, distanza, utenteRegistrato_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [titolo, isPublic, durata, localita, descrizione, null, dataCreazione, travelMode, distanza, utenteRegistrato_id]);
            return [true, 0, res[0]];
        } catch (error) {
            console.log(error)
            return [false, error.errno, {}];
        }
    }
    async addNewStages(stages, session_data) {

        var connection = await this.connect();
        for (var i = 0; i < stages.length; i++) {
            var stage = stages[i];
            var stored_stage = session_data[stage.placeId][0]
            //console.log(stored_stage);
            //console.log(stored_stage.geometry);
            stored_stage.latitudine = stored_stage.latitudine === undefined ? stored_stage.geometry.location.lat : stored_stage.latitudine;
            stored_stage.longitudine = stored_stage.longitudine === undefined ? stored_stage.geometry.location.lng : stored_stage.longitudine;
            var isExNovo = session_data[stage.placeId][1]
            //console.log("       quiiiii \n\n")
            //console.log(stored_stage)

            try {
                //console.log(session_data)
                if (!isExNovo) //è da google! non è exnovo!
                {
                    //COVERARE IL CASO IN CUI NON HA FOTO!!
                    await connection.query('INSERT INTO stage (placeId, isExNovo, latitudine, longitudine, indirizzo, nome,  website, fotoID,localita) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', [stage.placeId, 0, stored_stage.latitudine, stored_stage.longitudine, stored_stage.formatted_address, stored_stage.name, stored_stage.website, stored_stage.foto, stored_stage.localita]);
                }
                else //è exnovo!
                {
                    await connection.query('INSERT INTO stage (placeId, isExNovo, latitudine, longitudine, indirizzo, nome,  website, fotoID,localita) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', [stage.placeId, 1, stored_stage.latitudine, stored_stage.longitudine, stored_stage.formatted_address, stage.nome, stage.website, stage.fotoURL,stored_stage.localita]);
                }
            } catch (error) {
                console.log(error)
                //return [false, error.errno, {}];
            }
        }
        return [true, 0];

    }

    async instantiateRoadmap(roadmap_id, user_id, stages, distance_data) {
        try {
            console.log(distance_data)
            var connection = await this.connect();
            var route;
            var reachTime;
            for (var i = 0; i < stages.length; i++) {
                var stage = stages[i];
                route = i > 0 ? distance_data[stages[i - 1].placeId + "|" + stage.placeId] : {}
                
                reachTime = i > 0 ? route.routes[0].legs[0].duration.value : 0;
                route = JSON.stringify(route);
                // Execute SQL query that'll insert the account in the database
                await connection.query('INSERT INTO stageinroadmap (roadmap_id, roadmap_utenteRegistrato_id, stage_placeId, durata, ordine, reachTime, route) VALUES(?, ?, ?, ?, ?, ?, ?)', [roadmap_id, user_id, stage.placeId, stage.durata, i, reachTime, route]);
            }
            return [true, 0];
        } catch (error) {
            console.log(error)
            return [false, error.errno];
        }
    }

    async searchUser(username) {
        try {
            var connection = await this.connect();
            var result = await connection.query('SELECT * FROM utenteregistrato WHERE LOWER(username) LIKE ?', ['%' + username.toLowerCase() + '%']);
            return [true, 0, { results: result[0] }];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async placeIDExists(placeID) {
        try {
            var connection = await this.connect();

            // Execute SQL query that'll select the account from the database based on the specified username and password
            let selection = await connection.query('SELECT placeId,latitudine,longitudine,indirizzo as formatted_address,localita, nome as name,website,fotoID as foto FROM stage WHERE placeId = ?', [placeID]);
            let results = selection[0];

            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
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
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                return [true, 0];
            }
            else {
                return [false, -1];
            }
        } catch (error) {
            return [false, error.errno, default_dict];
        }
    }


    async searchRoadmap(ricerca) {

        try {
            var connection = await this.connect();
            var result = await connection.query('SELECT titolo,durata,localita,id,punteggio,distanza FROM roadmap WHERE isPublic=1 AND ((titolo LIKE ?)OR(localita LIKE ?)OR(durata LIKE ?)OR(distanza LIKE ?))', ['%' + ricerca + '%', '%' + ricerca + '%', '%' + ricerca + '%','%' + ricerca + '%']);
            return [true, 0, { results: result[0] }];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async getBestRoadmap() {
        try {
            var connection = await this.connect();
            // Execute SQL query that'll insert the account in the database
            var result = await connection.query('SELECT * FROM roadmap WHERE punteggio>4 ORDER BY RAND() LIMIT 3');
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

    async getDataUser(id) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT id,username,email,birthdate,avatar FROM utenteregistrato WHERE id = ?', [id]);
            let results = selection[0];

            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async allLoggedRoadmap(id) {
        try {

            var connection = await this.connect();
            var result_rec = await connection.query('select idRecensione,valutazione,opinione,dataPubblicazione from recensione where idUtenteRegistrato=?', [id])
            var result_com = await connection.query('select idCommento,testo,dataPubblicazione from commento where idUtenteRegistrato=?', [id])
            //query per vedere se preferita o seguita, quindi due tabelle, ancora non fatte
            console.log("result_com: ", result_com[0])
            console.log("result_com length: ", result_com[0].length)

            console.log("result_rec: ", result_rec[0])
            console.log("result_rec length: ", result_rec[0].length)


            return [true, 0, { results_rec: result_rec[0], results_com: result_com[0] }];
        }
        catch (error) {
            return [false, error.errno];
        }
    }
    async setCommento(user, roadmap, mod_com, day) {
        try {

            var connection = await this.connect();
            var res = await connection.query('INSERT INTO commento (idUtenteRegistrato, idRoadmap, testo,dataPubblicazione) VALUES (?, ?, ?, ?)', [user, roadmap, mod_com, day])
            return [true, 0, res[0]];

        }
        catch (error) {
            return [false, error.errno];
        }
    }
    async setRecensione(user, roadmap, mod_op, mod_valutazione, day) {
        try {

            var connection = await this.connect();
            var res = await connection.query('INSERT INTO recensione (idUtenteRegistrato, idRoadmap,valutazione,opinione,dataPubblicazione) VALUES (?, ?, ?, ?,?)', [user, roadmap, mod_valutazione, mod_op, day])
            return [true, 0, res[0]];

        }
        catch (error) {
            return [false, error.errno];
        }
    }
    async updateCommento(user, roadmap, mod_com, day) {
        try {

            var connection = await this.connect();
            var res = await connection.query('UPDATE commento SET testo = ?, dataPubblicazione = ? WHERE idUtenteRegistrato=? and idRoadmap=?', [mod_com, day, user, roadmap])
            return [true, 0, res[0]];

        }
        catch (error) {
            return [false, error.errno];
        }
    }
    async updateRecensione(user, roadmap, mod_op, mod_valutazione, day) {
        try {

            var connection = await this.connect();
            var res = await connection.query('UPDATE recensione SET valutazione=?, opinione=?, dataPubblicazione=? where idUtenteRegistrato=? and idRoadmap=?', [mod_valutazione, mod_op, day, user, roadmap])
            console.log(res)
            return [true, 0, res[0]];

        }
        catch (error) {
            return [false, error.errno];
        }
    }

    async getRoadmapCreate(id_query, id_session) {
        try {
            var connection = await this.connect();

            if (id_query == id_session) {
                let selection = await connection.query('SELECT * FROM roadmap WHERE utenteRegistrato_id = ?', [id_session]);
                let results = selection[0];
                return [true, 0, results];
            }
            else {
                let selection = await connection.query('SELECT * FROM roadmap WHERE utenteRegistrato_id = ? AND isPublic = 1', [id_query]);
                let results = selection[0];
                return [true, 0, results];
            }

        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async getRoadmapSeguite(id) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT * FROM roadmapuser, roadmap WHERE roadmap.id = roadmapuser.idRoadmap AND seguita = 1 and idUtenteRegistrato= ?', [id]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async getRoadmapPreferite(id) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT * FROM roadmapuser, roadmap WHERE roadmap.id = roadmapuser.idRoadmap AND preferita = 1 and idUtenteRegistrato= ?', [id]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async deleteRoadmapSeguite(id_roadmap,id_user) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('UPDATE roadmapuser SET seguita = 0 WHERE idRoadmap = ? AND idUtenteRegistrato= ?', [id_roadmap, id_user]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }


    async updateAvatar(id, new_avatar) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('UPDATE utenteregistrato SET avatar = ? WHERE id = ?', [new_avatar, id]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
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

}

module.exports = DAO