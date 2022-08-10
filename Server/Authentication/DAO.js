//const uuid = require('uuid');
var mysql = require('mysql2/promise');
const config = require('./config.js');
const md5 = require('md5');

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

    async register(id, username, password, email, birthdate) {
        // Ensure the input fields exists and are not empty
        //console.log(req.body);

        if (username && password && email && birthdate) {
            password = md5(password);
            // Execute SQL query that'll insert the account in the database
            connection.query('INSERT INTO utente (username, password, email, birthdate) VALUES (?, ?, ?, ?)', [username, password, email, birthdate], function (error, results, fields) {
                console.log(error);
                // If the account exists
                if (error) {
                    if (error.errno == 1062) { //Username o email sono già in uso
                        res.send('Username or email already in use');
                    }
                    else if (error.errno != 0) { //Errore generico
                        res.send('There was an error');
                    }
                }
                else {
                    res.send('OK');
                }
                res.end();
            });
        } else {
            //res.send('Please, ensure the input fields are not empty');
            //res.end();
        }
    }

    async auth(username, password) {
        try {
            var connection = await this.connect();
            // Ensure the input fields exists and are not empty
            if (username && password) {
                console.log(username, password)
                password = md5(password);
                console.log(username, password)
                // Execute SQL query that'll select the account from the database based on the specified username and password
                let selection = await connection.query('SELECT * FROM utente WHERE username = ? AND password = ?', [username, password]);
                let results = selection[0];
                // If there is an issue with the query, output the error
                //if (error) throw error;
                // If the account exists
                if (results.length > 0) {
                    // Authenticate the user
                    return [true, results[0].username];
                } else {
                    //res.send('Incorrect Username and/or Password!');
                    return false;
                }
                //res.end();
                return false;
            } else {
                //res.send('Please enter Username and Password!');
                //res.end();
                return false;
            }
        } catch (err) {
            console.log(err);
            return { ok: false };
        }
    }

    //logout user removin his token
    async logout(id, token) {
        try {
            var connection = await this.connect();
            let result = await connection.query("SELECT * FROM user WHERE id = ? AND token = ?", [id, token]);
            result = result[0]
            if (result.length == 1) {
                await connection.query("UPDATE user SET token = NULL WHERE id = ? AND token = ?", [id, token]);
                await connection.end();
                return true;
            } else {
                await connection.end();
                return false;
            }
        } catch (err) {
            console.log(err);
            await connection.end();
            return false;
        }
    }

    /*async checkToken(id, token){
        try{
            var connection = await this.connect();
            let result = await connection.query("SELECT * FROM user WHERE id = ? AND token = ?", [id, token]);
            result = result[0]
            if(result.length == 1){
                await connection.end();
                return true;
            }else{
                await connection.end();
                return false;
            }
        }catch(err){
            console.log(err);
            await connection.end();
        }
    }

      async confirmAccount(id){
        try{
            var connection = await this.connect();
            await connection.query("UPDATE user SET confirm = 1 WHERE id = ?", [id]);
            await connection.end();
            return true;
        }catch(err){
            await connection.end();
            return false;        
        }
    }*/
}

module.exports = DAO