const DAO = require('./DAO.js');

class RequestController{
    
    constructor(){
        this.dao = new DAO();
    }

    async register(username, password, email, birthdate) {
        const data = await this.dao.register(username, password, email, birthdate);
        return data;
        //return {ok:ok, id:id};
    }

    async auth(username, password) {
        const data = await this.dao.auth(username, password);
        return data;
    }

    async logout(id, token){
        const ok = await this.dao.logout(id,token);
        return {ok:ok};
    }
}

module.exports = RequestController;