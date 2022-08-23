var mysql = require('mysql2/promise');
const config = require('./config.js');

class DAO {
    async connect() {
        try {
            var connection = await mysql.createConnection({
                host: config.host,
                user: config.user,
                password: config.password,
                database: config.database
            });
            return connection;
        } catch (err) {
            console.log(err);
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

    async addRoadmap(titolo, isPublic, durataComplessiva, localita, descrizione, dataCreazione, utenteRegistrato_id) {
        try {
            var connection = await this.connect();
            console.log('INSERT INTO roadmap (titolo, isPublic, durataComplessiva, localita, descrizione, punteggio, dataCreazione, utenteRegistrato_id) VALUES(?, ?, ?, ?, ?, NULL, ?, ?)', [titolo, isPublic, durataComplessiva, localita, descrizione, dataCreazione, utenteRegistrato_id])
            const res = await connection.query('INSERT INTO roadmap (titolo, isPublic, durataComplessiva, localita, descrizione, punteggio, dataCreazione, utenteRegistrato_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)', [titolo, isPublic, durataComplessiva, localita, descrizione, null, dataCreazione, utenteRegistrato_id]);
            return [true, 0, res[0]];
        } catch (error) {
            return [false, error.errno, {}];
        }
    }
    async addNewStages(stages,session_data) {

        var connection = await this.connect();
        for (var i = 0; i < stages.length; i++) {
            var stage = stages[i];
            //console.log(stage);
            var stored_stage = session_data[stage.placeId][0]
            var isExNovo = session_data[stage.placeId][1]
            try {
                console.log(session_data)
                if (!isExNovo) //è da google! non è exnovo!
                {
                    //COVERARE IL CASO IN CUI NON HA FOTO!!
                    await connection.query('INSERT INTO stage (placeId, isExNovo, latitudine, longitudine, indirizzo, nome, descrizione, website, fotoID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', [stored_stage.place_id, 0, stored_stage.geometry.location.lat, stored_stage.geometry.location.lng, stored_stage.formatted_address, stored_stage.name, stage.descrizione, stored_stage.website, stored_stage.foto]);
                }
                else //è exnovo!
                {
                    await connection.query('INSERT INTO stage (placeId, isExNovo, latitudine, longitudine, indirizzo, nome, descrizione, website, fotoID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', [stored_stage.place_id, 1, stored_stage.geometry.location.lat, stored_stage.geometry.location.lng, stored_stage.formatted_address, stage.nome, stage.descrizione, stage.website, stage.fotoURL]);
                }
            } catch (error) {
                console.log(error)
                //return [false, error.errno, {}];
            }
        }
        return [true, 0];

    }

    async instantiateRoadmap(roadmap_id, user_id, stages) {
        try {
            var connection = await this.connect();
            for (var i = 0; i < stages.length; i++) {
                var stage = stages[i];
                // Execute SQL query that'll insert the account in the database
                await connection.query('INSERT INTO stageinroadmap (roadmap_id, roadmap_utenteRegistrato_id, stage_placeId, durata, ordine) VALUES(?, ?, ?, ?, ?)', [roadmap_id, user_id, stage.placeId, stage.durata, i]);
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
            var result = await connection.query('SELECT username FROM utenteregistrato WHERE LOWER(username) LIKE ?', ['%' + username.toLowerCase() + '%']);
            return [true, 0, { results: result[0] }];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async placeIDExists(placeID) {
        try {
            var connection = await this.connect();
            // Execute SQL query that'll select the account from the database based on the specified username and password
            let selection = await connection.query('SELECT placeId,latitudine,longitudine,indirizzo as formatted_address,nome as name,descrizione,website,fotoURL as foto FROM stage WHERE placeId = ?', [placeID]);
            let results = selection[0];
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                console.log(results)
                return [true, 0, {found:true,result:results[0]}];
            }
            else {
                return [false, -1, {}];
            }
        } catch (error) {
            return [false, error.errno, {}];
        }
    }

    async placeLatLngExists(lat,lng) {
        try {
            var connection = await this.connect();
            // Execute SQL query that'll select the account from the database based on the specified username and password

            //qui forse ci deve essere un certo scostamento di errore da tollerare
            let selection = await connection.query('SELECT placeId FROM stage WHERE lat = ? AND lng = ?', [lat,lng]);
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
            var result = await connection.query('SELECT titolo,durataComplessiva,localita,id,punteggio FROM roadmap WHERE isPublic=1 AND ((titolo LIKE ?)OR(localita LIKE ?)OR(durataComplessiva LIKE ?))', ['%'+ricerca+'%','%'+ricerca+'%','%'+ricerca+'%']);
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
            let selection = await connection.query('SELECT username,email,birthdate,avatar FROM utenteregistrato WHERE id = ?', [id]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async getNumberRoadmapCreate(id) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT COUNT(*) AS Roadmap_Utente FROM roadmap WHERE utenteRegistrato_id = ?', [id]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    
    async getNumberRoadmapSeguite(id) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT COUNT(*) AS Roadmap_Seguite FROM roadmapuser WHERE idUtenteRegistrato = ? AND seguita=1', [id]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async getNumberRoadmapPreferite(id) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT COUNT(*) AS Roadmap_Preferite FROM roadmapuser WHERE idUtenteRegistrato = ? AND preferita=1', [id]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async updateAvatar(id,new_avatar) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('UPDATE utenteregistrato SET avatar = ? WHERE id = ?', [new_avatar, id]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

}

module.exports = DAO