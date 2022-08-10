const DAO = require('./DAO.js');
//const uuid = require('uuid');
//var nodemailer = require('nodemailer');

const serverIp = 'localhost'
const serverPort = '8888'

class RequestController{
    
    constructor(){
        this.dao = new DAO();
    }

    async register(username, password, email, birthdate) {
        const data = await this.dao.register(username, password, email, birthdate);
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

    /*async checkToken(id, token){
        const ok = await this.dao.checkToken(id,token);
        return {ok:ok};
    }

    async activate(id){
        const ok = await this.dao.confirmAccount(id);
        if(ok == true){
            return {ok:true};
        } else {
            return {ok:false};
        }       
    }

    async sendEmail(email, id){
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'Outlook365',
            auth: {
            user: 'hermesserver@outlook.it', // generated ethereal user
            pass: 'progettoSAD', // generated ethereal password
            },
    
        });
        
        var mailOptions = {
            from: 'Hermes Server', // Your email here
            to: email,
            subject: 'Account activation',
            text: 'Hello,\n\n' +
            'Please click on the following link to activate your account:\n' +
            'http://' + `${serverIp}:${serverPort}/` + 'activate/' + id + '\n'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }*/
}

module.exports = RequestController;