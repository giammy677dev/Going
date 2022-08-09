const uuid = require('uuid');
var mysql = require('mysql2/promise');
const config = require('./config.js');


class DAO{
    async connect(){
        /*try{
            var connection = await mysql.createConnection({
                host     : config.host,
                user     : config.user,
                password : config.password,
                database : config.database
            });
            return connection;
        }catch(err){
            console.log(err);
        }*/
    }
    
    async register(id, username, password, email, prk, puk, confirm){
        try{
            var connection = await this.connect();
            await connection.query("INSERT INTO user (id, username, password, email, prk, puk, confirm) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, username, password, email, prk, puk, confirm]);
            await connection.end();
            return true;
        }catch(err){
            console.log(err);
            await connection.end();
            return false;
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
    }
    
    async login(username, password, token){
        try{
            var connection = await this.connect();
            let result = await connection.query("SELECT * FROM user WHERE username = ? AND password = ?", [username, password]);
            result = result[0]
            if(result.length == 1){
                if(result[0].confirm == 1){
                    await connection.query("UPDATE user SET token = ? WHERE username = ? AND password = ?", [token, username, password]);
                    await connection.end();
                    return {ok: true, id: result[0].id, token: token, prk: result[0].prk, puk: result[0].puk};
                }else{
                    await connection.end();
                    return {ok: false, error: "Account not confirmed"};
                }
            }else{
                await connection.end();
                return {ok: false, error: "User does not exist"};
            }
        }catch(err){
            console.log(err);
            return {ok: false};
        }
    }
    
    //logout user removin his token
    async logout(id, token){
        try{
            var connection = await this.connect();
            let result = await connection.query("SELECT * FROM user WHERE id = ? AND token = ?", [id, token]);
            result = result[0]
            if(result.length == 1){
                await connection.query("UPDATE user SET token = NULL WHERE id = ? AND token = ?", [id, token]);
                await connection.end();
                return true;
            }else{
                await connection.end();
                return false;
            }
        }catch(err){
            console.log(err);
            await connection.end();
            return false;
        }
    }
    
    
    
    async checkToken(id, token){
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
    
}

module.exports = DAO