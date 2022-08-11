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
            await connection.query('INSERT INTO utente (username, password, email, birthdate) VALUES (?, ?, ?, ?)', [username, password, email, birthdate]);
            return [true, 0];
        } catch (error) {
            return [false, error.errno];
        }
    }

    async login(username, password) {
        const default_dict={username: ''}
        try {
            var connection = await this.connect();
            // Execute SQL query that'll select the account from the database based on the specified username and password
            let selection = await connection.query('SELECT * FROM utente WHERE username = ? AND password = ?', [username, password]);
            let results = selection[0];
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                return [true, 0, {username: results[0].username}];
            }
            else
            {
                return [false, -3, default_dict]; //-3 non si è registrato! Deve registrarsi!
            }
        } catch (error) {
            return [false, error.errno, default_dict];
        }
    }
}

module.exports = DAO