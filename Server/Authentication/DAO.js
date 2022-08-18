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
        const default_dict = {id: '', username: '', isAdmin: 0}
        try {
            var connection = await this.connect();
            // Execute SQL query that'll select the account from the database based on the specified username and password
            let selection = await connection.query('SELECT * FROM utenteregistrato WHERE username = ? AND password = ?', [username, password]);
            let results = selection[0];
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                return [true, 0, {id: results[0].id, username: results[0].username, isAdmin: results[0].isAdmin}];
            }
            else {
                return [false, -3, default_dict]; //-3 non si è registrato! Deve registrarsi!
            }
        } catch (error) {
            return [false, error.errno, default_dict];
        }
    }

    async searchUser(username) {
        try {
            var connection = await this.connect();
            // Execute SQL query that'll insert the account in the database
            var result = await connection.query('SELECT username FROM utenteregistrato WHERE LOWER(username) LIKE ?', ['%' + username.toLowerCase() + '%']);
            return [true, 0, {results: result[0]}];
        } catch (error) {
            return [false, error.errno, {results: []}];
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
                return [false, -5, {placeId: '', nome: ''}]; //Non ci sono nodi ex novo nel database
            }
        } catch (error) {
            return [false, error.errno, {placeId: '', nome: ''}];
        }
    }

    async getDataUser(id) {
        try {
            var connection = await this.connect();
            let selection = await connection.query('SELECT username,email,birthdate FROM utenteregistrato WHERE id = ?', [id]);
            let results = selection[0];
            return [true, 0, results];
        } catch (error) {
            return [false, error.errno, {results: result[0]}];
        }
    }
}

module.exports = DAO