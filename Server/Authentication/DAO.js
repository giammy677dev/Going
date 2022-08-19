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
            await connection.query('INSERT INTO utenteregistrato (username, password, email, birthdate, isAdmin) VALUES (?, ?, ?, ?, 0)', [username, password, email, birthdate]);
            return [true, 0];
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
            // Execute SQL query that'll insert the account in the database
            console.log('INSERT INTO roadmap (titolo, isPublic, durataComplessiva, localita, descrizione, punteggio, dataCreazione, utenteRegistrato_id)', [titolo, isPublic, durataComplessiva, localita, descrizione, null, dataCreazione, utenteRegistrato_id])
            const res = await connection.query('INSERT INTO roadmap (titolo, isPublic, durataComplessiva, localita, descrizione, punteggio, dataCreazione, utenteRegistrato_id) VALUES(?, ?, ?, ?, ?, NULL, ?, ?)', [titolo, isPublic, durataComplessiva, localita, descrizione, dataCreazione, utenteRegistrato_id]);
            return [true, 0, res[0]];
        } catch (error) {
            return [false, error.errno, {}];
        }
    }
    async addNewStages(stages) {

        var connection = await this.connect();
        for (var i = 0; i < stages.length; i++) {
            var stage = stages[i];
            console.log(stage);
            // Execute SQL query that'll insert the account in the database
            console.log('INSERT INTO stage (placeId, isExNovo, latitudine, longitudine, indirizzo, nome, descrizione, website, fotoURL) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', [stage.placeId, stage.isExNovo, stage.latitudine, stage.longitudine, stage.indirizzo, stage.nome, stage.descrizione, stage.website, stage.fotoURL])
            try {
                const res = await connection.query('INSERT INTO stage (placeId, isExNovo, latitudine, longitudine, indirizzo, nome, descrizione, website, fotoURL) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', [stage.placeId, stage.isExNovo, stage.latitudine, stage.longitudine, stage.indirizzo, stage.nome, stage.descrizione, stage.website, stage.fotoURL]);
                console.log(res)
            } catch (error) {
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
                const res = await connection.query('INSERT INTO stageinroadmap (roadmap_id, roadmap_utenteRegistrato_id, stage_placeId, durata) VALUES(?, ?, ?, ?)', [roadmap_id, user_id, stage.placeId, stage.durata]);
            }
            return [true, 0, res[0]];
        } catch (error) {
            return [false, error.errno, {}];
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
            let selection = await connection.query('SELECT * FROM stage WHERE isExNovo = 1');
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
            let selection = await connection.query('SELECT username,email,birthdate FROM utenteregistrato WHERE id = ?', [id]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }

    async getRoadmapUser(id) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT COUNT(*) AS Roadmap_Utente FROM roadmap WHERE utenteRegistrato_id = ?', [id]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, { results: [] }];
        }
    }
}

module.exports = DAO